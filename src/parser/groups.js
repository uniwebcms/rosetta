/**
 * Transform a sequence into content groups
 */

export function processGroups(sequence) {
  const structure = {
    main: null,
    items: [],
  };

  let currentGroup = null;
  let mainGroupIdentified = false;

  // First pass: identify the main group and initial item groups
  for (let i = 0; i < sequence.length; i++) {
    const element = sequence[i];

    if (element.type === "divider") {
      if (currentGroup) {
        addGroupToStructure(currentGroup, structure);
      }
      currentGroup = createNewGroup();
      continue;
    }

    // Start a new group on headings that should begin groups
    if (
      element.type === "heading" &&
      shouldStartNewGroup(element, currentGroup, sequence, i)
    ) {
      if (currentGroup) {
        addGroupToStructure(currentGroup, structure);
      }
      currentGroup = createNewGroup();
    }

    // Add element to current group
    if (!currentGroup) {
      currentGroup = createNewGroup();
    }

    if (element.type === "heading") {
      addHeadingToGroup(currentGroup, element);
    } else {
      currentGroup.content.push(element);
    }
  }

  // Add final group
  if (currentGroup) {
    addGroupToStructure(currentGroup, structure);
  }

  // Second pass: determine roles if not already set
  if (!structure.main && structure.items.length > 0) {
    // If first group has h1, it's the main group
    const firstGroup = structure.items[0];
    if (firstGroup.headings.title && firstGroup.headings.title.level === 1) {
      structure.main = firstGroup;
      structure.items = structure.items.slice(1);
    }
  }

  return structure;
}

function createNewGroup() {
  return {
    headings: {
      eyebrow: null,
      title: null,
      subtitle: null,
    },
    content: [],
    metadata: {
      level: null,
      contentTypes: new Set(),
    },
  };
}

function shouldStartNewGroup(heading, currentGroup, sequence, position) {
  if (!currentGroup) return true;

  // If current group has no content yet, don't start new one
  if (currentGroup.content.length === 0 && !currentGroup.headings.title) {
    return false;
  }

  // If we have an H1, it's always a new group (unless it's first)
  if (heading.level === 1 && currentGroup.headings.title) {
    return true;
  }

  // For H3s, check if it's an eyebrow for the next heading
  if (heading.level === 3) {
    const nextHeading = sequence
      .slice(position + 1)
      .find((el) => el.type === "heading");
    if (nextHeading && nextHeading.level < heading.level) {
      return false;
    }
  }

  // For same-level headings (like H2s in a feature list),
  // start new group if we already have significant content
  if (
    currentGroup.headings.title &&
    heading.level === currentGroup.headings.title.level &&
    (currentGroup.content.length > 0 || currentGroup.headings.subtitle)
  ) {
    return true;
  }

  return heading.level <= (currentGroup.metadata.level || Infinity);
}

function isEyebrowHeading(heading, sequence, position) {
  // Look ahead for a larger heading
  for (let i = position + 1; i < sequence.length; i++) {
    const next = sequence[i];
    if (next.type === "heading") {
      return next.level < heading.level;
    }
    // Only look at immediate siblings
    if (next.type !== "heading" && next.type !== "image") {
      break;
    }
  }
  return false;
}

function addHeadingToGroup(group, heading) {
  // Store the type of heading role we've assigned
  let role = null;

  // If no title yet, this is either eyebrow or title
  if (!group.headings.title) {
    // If it's level 3 and no eyebrow yet, it's likely an eyebrow
    if (heading.level === 3 && !group.headings.eyebrow) {
      group.headings.eyebrow = heading;
      role = "eyebrow";
    } else {
      group.headings.title = heading;
      role = "title";
    }
    group.metadata.level = heading.level;
    return role;
  }

  // If we have a title but no subtitle, and this heading is lower level
  if (!group.headings.subtitle && heading.level > group.headings.title.level) {
    group.headings.subtitle = heading;
    return "subtitle";
  }

  // Otherwise add to content
  group.content.push(heading);
  return "content";
}

function addGroupToStructure(group, structure) {
  // Update metadata
  group.metadata.contentTypes = Array.from(group.metadata.contentTypes);

  // Determine if this is the main group
  if (!structure.main && (isMainGroup(group) || structure.items.length === 0)) {
    structure.main = group;
  } else {
    structure.items.push(group);
  }
}

function isMainGroup(group) {
  return (
    group.headings.title?.level === 1 || // Has H1
    group.headings.eyebrow?.level === 3 // Has H3 eyebrow
  );
}
