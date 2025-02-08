/**
 * Transform AST nodes into a linear sequence of content elements
 */

/**
 * Process an AST into a sequence of content elements
 * @param {object} ast - The markdown AST
 * @returns {Array} Sequence of content elements
 */
export function processSequence(ast) {
  const sequence = [];
  let position = 0;

  // Process each node in the AST
  visit(ast, (node) => {
    const element = processNode(node, position++);
    if (element) {
      sequence.push(element);
    }
  });

  return sequence;
}

/**
 * Process a single AST node into a content element
 * @param {object} node - AST node
 * @param {number} position - Position in sequence
 * @returns {object|null} Processed content element or null if node should be skipped
 */
function processNode(node, position) {
  switch (node.type) {
    case "heading": {
      const labels = extractLabels(node);
      // Remove labels from content
      const content = node.children
        ? getTextContent(node).replace(/\s*{\.[\w-]+}\s*$/, "")
        : "";

      return {
        type: "heading",
        level: node.depth,
        content,
        position,
        labels,
      };
    }

    case "paragraph": {
      // Check if this paragraph only contains an image
      const hasOnlyImage =
        node.children?.length === 1 && node.children[0].type === "image";

      if (hasOnlyImage) {
        return processImageNode(node.children[0], position);
      }

      return {
        type: "paragraph",
        content: getTextContent(node),
        position,
      };
    }

    case "image":
      return processImageNode(node, position);

    case "thematicBreak":
      return {
        type: "divider",
        position,
      };

    case "list":
      return {
        type: "list",
        ordered: node.ordered,
        items: node.children.map((item) => getTextContent(item)),
        position,
      };

    case "code":
      return {
        type: "code",
        language: node.lang || null,
        content: node.value,
        position,
      };

    default:
      return null;
  }
}

/**
 * Process an image node with special handling for roles
 * @param {object} node - Image node
 * @param {number} position - Position in sequence
 * @returns {object} Processed image element
 */
function processImageNode(node, position) {
  // Determine image role from alt text or context
  const alt = node.alt || "";
  let role = "content";

  // Check for role in alt text
  const roleMatch = alt.match(/^(background|icon|gallery):\s*(.*)/);
  if (roleMatch) {
    role = roleMatch[1];
  } else if (position === 0) {
    // First image in sequence is typically a background
    role = "background";
  }

  // Clean up alt text
  const cleanAlt = roleMatch ? roleMatch[2] : alt;

  return {
    type: "image",
    role,
    src: node.url,
    alt: cleanAlt,
    title: node.title || null,
    position,
  };
}

/**
 * Extract text content from a node and its children
 * @param {object} node - AST node
 * @returns {string} Combined text content
 */
function getTextContent(node) {
  if (node.value) return node.value;
  if (node.children) {
    return node.children.map((child) => getTextContent(child)).join("");
  }
  return "";
}

/**
 * Extract labels from a node (e.g., {.label1 .label2})
 * @param {object} node - AST node
 * @returns {string[]} Array of labels
 */
function extractLabels(node) {
  const text = getTextContent(node);
  const labelMatch = text.match(/{(\.[\w-]+(?:\s+\.[\w-]+)*)}\s*$/);

  if (labelMatch) {
    return labelMatch[1].split(/\s+/).map((label) => label.substring(1)); // Remove the leading dot
  }

  return [];
}

/**
 * Visit each node in the AST
 * @param {object} node - AST node
 * @param {function} callback - Function to call for each node
 */
function visit(node, callback) {
  callback(node);
  if (node.children) {
    node.children.forEach((child) => visit(child, callback));
  }
}
