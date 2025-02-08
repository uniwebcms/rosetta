/**
 * Content validation for Rosetta
 */

/**
 * Validate parsed content against common issues
 * @param {object} content - Parsed section content
 * @returns {object} Validation results
 */
export function validateContent(content) {
  const results = {
    errors: [],
    warnings: [],
    suggestions: [],
  };

  // Validate frontmatter
  validateFrontmatter(content, results);

  // Validate content structure
  validateStructure(content.content, results);

  // Check relationships
  validateRelationships(content.content, results);

  return results;
}

/**
 * Validate frontmatter configuration
 */
function validateFrontmatter(content, results) {
  // Check required fields
  if (!content.component) {
    results.errors.push({
      type: "missing_component",
      message: "Component name is required in frontmatter",
    });
  }

  // Check props object
  if (content.props && typeof content.props !== "object") {
    results.errors.push({
      type: "invalid_props",
      message: "Props must be an object",
    });
  }
}

/**
 * Validate content structure
 */
function validateStructure(content, results) {
  const { sequence, groups, byType } = content;

  // Check sequence integrity
  if (!sequence || !Array.isArray(sequence)) {
    results.errors.push({
      type: "invalid_sequence",
      message: "Content sequence is invalid or missing",
    });
    return; // Can't continue without valid sequence
  }

  // Validate heading hierarchy
  validateHeadingHierarchy(byType.headings, results);

  // Check for empty groups
  if (groups.items) {
    groups.items.forEach((group, index) => {
      if (
        !group.content.length &&
        !Object.values(group.headings).some((h) => h)
      ) {
        results.warnings.push({
          type: "empty_group",
          message: `Group ${index + 1} is empty`,
          location: group,
        });
      }
    });
  }

  // Check for orphaned content
  validateOrphanedContent(content, results);
}

/**
 * Validate heading hierarchy
 */
function validateHeadingHierarchy(headings, results) {
  if (!headings || !headings.length) {
    results.warnings.push({
      type: "no_headings",
      message: "Content has no headings",
    });
    return;
  }

  let previousLevel = 0;
  headings.forEach((heading, index) => {
    // Check for skipped levels
    if (heading.level > previousLevel + 1) {
      results.warnings.push({
        type: "skipped_heading_level",
        message: `Heading level skipped from h${previousLevel} to h${heading.level}`,
        location: heading,
      });
    }

    previousLevel = heading.level;
  });
}

/**
 * Validate relationships between content elements
 */
function validateRelationships(content, results) {
  const { sequence, byType } = content;

  // Check image-heading relationships
  byType.images.background.forEach((image) => {
    if (!findNearbyHeading(image, sequence)) {
      results.suggestions.push({
        type: "orphaned_background",
        message: "Background image has no associated heading",
        location: image,
      });
    }
  });

  // Check for broken content groups
  validateContentGroups(content, results);
}

/**
 * Find heading near an element
 */
function findNearbyHeading(element, sequence) {
  const pos = element.position;
  const searchRange = 2; // Look 2 elements before and after

  for (
    let i = Math.max(0, pos - searchRange);
    i < Math.min(sequence.length, pos + searchRange);
    i++
  ) {
    if (sequence[i].type === "heading") {
      return sequence[i];
    }
  }
  return null;
}

/**
 * Validate content groups integrity
 */
function validateContentGroups(content, results) {
  const { groups, sequence } = content;

  if (groups.main) {
    // Check main group structure
    if (!groups.main.headings.title) {
      results.warnings.push({
        type: "no_main_title",
        message: "Main content group has no title",
      });
    }
  } else {
    results.suggestions.push({
      type: "no_main_group",
      message: "Content has no clear main group",
    });
  }

  // Check for content outside of groups
  validateOrphanedContent(content, results);
}

/**
 * Check for content not properly grouped
 */
function validateOrphanedContent(content, results) {
  const { sequence, groups } = content;

  // Collect all content positions that are part of groups
  const groupedPositions = new Set();

  if (groups.main) {
    groups.main.content.forEach((el) => groupedPositions.add(el.position));
  }

  groups.items.forEach((group) => {
    group.content.forEach((el) => groupedPositions.add(el.position));
  });

  // Find content not in any group
  sequence.forEach((element, index) => {
    if (!groupedPositions.has(index) && element.type !== "divider") {
      results.warnings.push({
        type: "orphaned_content",
        message: `${element.type} element not part of any group`,
        location: element,
      });
    }
  });
}

/**
 * Format validation messages for display
 * @param {object} results - Validation results
 * @returns {string} Formatted message
 */
export function formatValidationMessages(results) {
  let output = "";

  if (results.errors.length) {
    output += "\nErrors:\n";
    results.errors.forEach((error) => {
      output += `❌ ${error.message}\n`;
    });
  }

  if (results.warnings.length) {
    output += "\nWarnings:\n";
    results.warnings.forEach((warning) => {
      output += `⚠️  ${warning.message}\n`;
    });
  }

  if (results.suggestions.length) {
    output += "\nSuggestions:\n";
    results.suggestions.forEach((suggestion) => {
      output += `💡 ${suggestion.message}\n`;
    });
  }

  return output || "✅ No issues found";
}
