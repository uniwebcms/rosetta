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
    case "heading":
      return {
        type: "heading",
        level: node.depth,
        content: getTextContent(node),
        position,
        labels: extractLabels(node),
      };

    case "paragraph":
      // Check if this paragraph only contains an image
      if (isImageParagraph(node)) {
        return processImageNode(node.children[0], position);
      }
      return {
        type: "paragraph",
        content: getTextContent(node),
        position,
      };

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

    // Add more node types as needed

    default:
      return null;
  }
}

/**
 * Check if a paragraph node contains only an image
 * @param {object} node - Paragraph node
 * @returns {boolean}
 */
function isImageParagraph(node) {
  return node.children.length === 1 && node.children[0].type === "image";
}

/**
 * Process an image node with special handling for roles
 * @param {object} node - Image node
 * @param {number} position - Position in sequence
 * @returns {object} Processed image element
 */
function processImageNode(node, position) {
  // Check for special image roles using alt text prefixes
  const alt = node.alt || "";
  const roleMatch = alt.match(/^(background|icon|gallery):\s*(.*)/);

  return {
    type: "image",
    role: roleMatch ? roleMatch[1] : "content",
    src: node.url,
    alt: roleMatch ? roleMatch[2] : alt,
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
 * Extract labels from a node's data (e.g., {.label1 .label2})
 * @param {object} node - AST node
 * @returns {string[]} Array of labels
 */
function extractLabels(node) {
  // This will need to be implemented based on how we decide
  // to handle labels in the markdown
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
