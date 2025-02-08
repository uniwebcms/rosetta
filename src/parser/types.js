/**
 * Organize content elements by their type while preserving context
 */

/**
 * Process a sequence into type-based collections
 * @param {Array} sequence - Sequence of content elements
 * @returns {object} Content organized by type
 */
export function processByType(sequence) {
  const collections = {
    headings: [],
    paragraphs: [],
    images: {
      background: [],
      content: [],
      gallery: [],
      icons: [],
    },
    lists: [],
    code: [],
    dividers: [],
    metadata: {
      totalElements: sequence.length,
      dominantType: null,
      hasMedia: false,
    },
  };

  // Track type frequencies for metadata
  const typeFrequency = new Map();

  sequence.forEach((element, index) => {
    // Track element type frequency
    typeFrequency.set(element.type, (typeFrequency.get(element.type) || 0) + 1);

    // Process element based on type
    switch (element.type) {
      case "heading":
        collections.headings.push({
          ...element,
          context: getElementContext(sequence, index),
        });
        break;

      case "paragraph":
        collections.paragraphs.push({
          ...element,
          context: getElementContext(sequence, index),
        });
        break;

      case "image":
        const role = element.role || "content";
        collections.images[role].push({
          ...element,
          context: getElementContext(sequence, index),
        });
        collections.metadata.hasMedia = true;
        break;

      case "list":
        collections.lists.push({
          ...element,
          context: getElementContext(sequence, index),
        });
        break;

      case "code":
        collections.code.push({
          ...element,
          context: getElementContext(sequence, index),
        });
        break;

      case "divider":
        collections.dividers.push({
          ...element,
          context: getElementContext(sequence, index),
        });
        break;
    }
  });

  // Calculate dominant type
  let maxFrequency = 0;
  typeFrequency.forEach((frequency, type) => {
    if (frequency > maxFrequency) {
      maxFrequency = frequency;
      collections.metadata.dominantType = type;
    }
  });

  // Add convenience methods for common queries
  addCollectionHelpers(collections);

  return collections;
}

/**
 * Get context information for an element
 * @param {Array} sequence - Full sequence
 * @param {number} position - Element's position
 * @returns {object} Context information
 */
function getElementContext(sequence, position) {
  const context = {
    position,
    previousElement: position > 0 ? sequence[position - 1] : null,
    nextElement: position < sequence.length - 1 ? sequence[position + 1] : null,
    nearestHeading: null,
  };

  // Find nearest preceding heading
  for (let i = position - 1; i >= 0; i--) {
    if (sequence[i].type === "heading") {
      context.nearestHeading = sequence[i];
      break;
    }
  }

  return context;
}

/**
 * Add helper methods to the collections object
 * @param {object} collections - Type-based collections
 */
function addCollectionHelpers(collections) {
  // Get all images regardless of role
  collections.getAllImages = function () {
    return [
      ...this.images.background,
      ...this.images.content,
      ...this.images.gallery,
      ...this.images.icons,
    ];
  };

  // Get headings of a specific level
  collections.getHeadingsByLevel = function (level) {
    return this.headings.filter((h) => h.level === level);
  };

  // Get elements that appear before a specific heading level
  collections.getElementsBeforeHeadingLevel = function (level) {
    const firstHeading = this.headings.find((h) => h.level === level);
    if (!firstHeading) return [];

    return Object.values(this)
      .flat()
      .filter(
        (el) =>
          el.context && el.context.position < firstHeading.context.position
      );
  };

  // Find elements by their relationship to headings
  collections.getElementsByHeadingContext = function (headingFilter) {
    const elements = [];
    const validTypes = ["paragraphs", "images", "lists", "code"];

    validTypes.forEach((type) => {
      if (Array.isArray(this[type])) {
        elements.push(
          ...this[type].filter(
            (el) =>
              el.context &&
              el.context.nearestHeading &&
              headingFilter(el.context.nearestHeading)
          )
        );
      }
    });

    return elements;
  };

  // Get all content between two headings
  collections.getContentBetweenHeadings = function (startHeading, endHeading) {
    const startPos = startHeading.context.position;
    const endPos = endHeading ? endHeading.context.position : Infinity;

    return Object.values(this)
      .flat()
      .filter(
        (el) =>
          el.context &&
          el.context.position > startPos &&
          el.context.position < endPos
      );
  };
}
