/**
 * Transform a sequence of elements into semantic content groups
 */

/**
 * Process a sequence into hierarchical content groups
 * @param {Array} sequence - Sequence of content elements
 * @returns {object} Grouped content structure
 */
export function processGroups(sequence) {
  // Initialize group structure
  const structure = {
    main: null, // Main content group if it exists
    items: [], // Subsequent content groups
  };

  // Track current group being built
  let currentGroup = null;
  let mainGroupIdentified = false;

  // Analyze the sequence
  for (let i = 0; i < sequence.length; i++) {
    const element = sequence[i];

    if (element.type === "divider") {
      // Explicit group division
      if (currentGroup) {
        addGroupToStructure(currentGroup, structure);
      }
      currentGroup = createNewGroup();
      continue;
    }

    if (element.type === "heading") {
      // Handle heading-based group creation
      if (shouldStartNewGroup(element, currentGroup, sequence, i)) {
        if (currentGroup) {
          addGroupToStructure(currentGroup, structure);
        }
        currentGroup = createNewGroup(element);
      } else {
        // Add heading to current group
        addHeadingToGroup(currentGroup, element);
      }
      continue;
    }

    // Add element to current group
    if (!currentGroup) {
      currentGroup = createNewGroup();
    }
    currentGroup.content.push(element);
  }

  // Add final group if exists
  if (currentGroup) {
    addGroupToStructure(currentGroup, structure);
  }

  return structure;
}

/**
 * Create a new content group
 * @param {object} [headingElement] - Initial heading element
 * @returns {object} New group structure
 */
function createNewGroup(headingElement = null) {
  return {
    headings: {
      title: null, // Main heading (h1 or first significant heading)
      subtitle: null, // Secondary heading if exists
      eyebrow: null, // Small heading above title if exists
    },
    content: [], // Non-heading content
    metadata: {
      level: headingElement ? headingElement.level : null,
      hasMedia: false,
      contentTypes: new Set(),
    },
  };
}

/**
 * Determine if a heading should start a new group
 * @param {object} heading - Heading element
 * @param {object} currentGroup - Current group being built
 * @param {Array} sequence - Full sequence
 * @param {number} position - Current position in sequence
 * @returns {boolean}
 */
function shouldStartNewGroup(heading, currentGroup, sequence, position) {
  if (!currentGroup) return true;

  // Always start new group if current group is empty
  if (currentGroup.content.length === 0 && !currentGroup.headings.title) {
    return true;
  }

  // Check for eyebrow pattern
  if (isEyebrowPattern(heading, sequence, position)) {
    return false;
  }

  // Check heading levels
  if (currentGroup.metadata.level) {
    // Start new group if:
    // 1. Current group has main heading and content
    // 2. New heading is same or higher level
    return (
      currentGroup.content.length > 0 &&
      heading.level <= currentGroup.metadata.level
    );
  }

  return true;
}

/**
 * Check if heading is part of an eyebrow pattern
 * @param {object} heading - Heading element
 * @param {Array} sequence - Full sequence
 * @param {number} position - Current position in sequence
 * @returns {boolean}
 */
function isEyebrowPattern(heading, sequence, position) {
  // Look ahead for a larger heading
  const nextHeading = sequence
    .slice(position + 1)
    .find((el) => el.type === "heading");

  if (nextHeading && nextHeading.level < heading.level) {
    // Current heading is smaller than next heading = eyebrow pattern
    return true;
  }

  return false;
}

/**
 * Add a heading to a group in the appropriate slot
 * @param {object} group - Content group
 * @param {object} heading - Heading element
 */
function addHeadingToGroup(group, heading) {
  if (!group.headings.title) {
    group.headings.title = heading;
    group.metadata.level = heading.level;
    return;
  }

  if (heading.level < group.headings.title.level) {
    // Higher level heading becomes title, current title becomes subtitle
    group.headings.subtitle = group.headings.title;
    group.headings.title = heading;
    group.metadata.level = heading.level;
  } else if (heading.level > group.headings.title.level) {
    // Lower level heading might be subtitle or eyebrow
    if (group.content.length === 0 && !group.headings.subtitle) {
      // No content yet, could be eyebrow pattern
      group.headings.eyebrow = group.headings.title;
      group.headings.title = heading;
      group.metadata.level = heading.level;
    } else {
      // Regular subtitle
      group.headings.subtitle = heading;
    }
  }
}

/**
 * Add a completed group to the overall structure
 * @param {object} group - Content group
 * @param {object} structure - Overall content structure
 */
function addGroupToStructure(group, structure) {
  // Update group metadata
  group.metadata.hasMedia = group.content.some((el) => el.type === "image");
  group.content.forEach((el) => group.metadata.contentTypes.add(el.type));
  group.metadata.contentTypes = Array.from(group.metadata.contentTypes);

  // Determine if this is the main group
  if (!structure.main && isMainGroup(group)) {
    structure.main = group;
  } else {
    structure.items.push(group);
  }
}

/**
 * Determine if a group should be considered the main group
 * @param {object} group - Content group
 * @returns {boolean}
 */
function isMainGroup(group) {
  // Main group criteria:
  // 1. First group with a level 1 heading, or
  // 2. First group with significant content and a clear title
  return (
    (group.headings.title && group.headings.title.level === 1) ||
    (group.headings.title && group.content.length > 0)
  );
}
