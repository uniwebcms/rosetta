// index.js

const fs = require("fs/promises");
const path = require("path");
const yaml = require("js-yaml");
const pLimit = require("p-limit");
const { markdownToProseMirror } = require("@uniwebcms/content-reader");

/**
 * Collects the entire site structure starting from the root directory.
 * Reads site-level metadata from `site.yml` (if present) and processes each
 * subdirectory as a page.
 *
 * @param {string} rootDir - The root folder containing page folders and site.yml.
 * @param {number} [concurrency=20] - Maximum number of pages to process concurrently.
 * @returns {Promise<Object>} - The complete site structure as a JavaScript object.
 */
async function collectSite(rootDir, concurrency = 20) {
  const siteData = {};

  // Attempt to load site-level metadata from "site.yml" (optional)
  const siteMetadataPath = path.join(rootDir, "site.yml");
  try {
    const siteYmlContent = await fs.readFile(siteMetadataPath, "utf-8");
    siteData.siteMetadata = yaml.load(siteYmlContent);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw new Error(
        `Error reading site metadata at ${siteMetadataPath}: ${err.message}`
      );
    }
    // If "site.yml" doesn't exist, continue without siteMetadata.
  }

  // Read all entries in the root directory
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const pageEntries = entries.filter((entry) => entry.isDirectory());

  // Use p-limit to limit the concurrency
  const limit = pLimit(concurrency);

  // Process pages with a concurrency limit
  const pagesPromises = pageEntries.map((entry) => {
    const pageName = entry.name;
    const pagePath = path.join(rootDir, pageName);
    return limit(() =>
      processPage(pagePath).then((pageData) => ({ pageName, pageData }))
    );
  });

  const pagesResults = await Promise.all(pagesPromises);
  const pages = {};
  for (const { pageName, pageData } of pagesResults) {
    pages[pageName] = pageData;
  }

  siteData.pages = pages;
  return siteData;
}

/**
 * Processes a single page folder.
 * It reads optional page metadata from `page.yml` and processes all content
 * files (Markdown or JSON) that follow the naming convention (numeric prefix).
 *
 * @param {string} pageDir - The full path to the page folder.
 * @returns {Promise<Object>} - An object containing the page metadata and sections.
 */
async function processPage(pageDir) {
  const pageData = {};

  // Read page metadata from "page.yml" if it exists.
  const pageMetadataPath = path.join(pageDir, "page.yml");
  try {
    const pageYmlContent = await fs.readFile(pageMetadataPath, "utf-8");
    pageData.metadata = yaml.load(pageYmlContent);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw new Error(
        `Error reading page metadata in ${pageDir}: ${err.message}`
      );
    }
    // No metadata; proceed.
  }

  // Regular expression to match files with the correct naming convention:
  // Numeric prefix, a dash, then a title, and then a valid extension (md or json).
  const fileRegex = /^(\d+(?:\.\d+)*)-(.+)\.(md|json)$/i;

  // Read all files in the page directory.
  const entries = await fs.readdir(pageDir, { withFileTypes: true });
  const contentFiles = entries.filter(
    (entry) => entry.isFile() && fileRegex.test(entry.name)
  );

  // Build an array of file info objects.
  let fileInfos = [];
  for (const fileEntry of contentFiles) {
    const match = fileEntry.name.match(fileRegex);
    if (match) {
      const prefix = match[1]; // e.g., "1" or "2.1"
      const title = match[2]; // e.g., "hero" or "feature-one"
      const ext = match[3].toLowerCase(); // either "md" or "json"
      const filePath = path.join(pageDir, fileEntry.name);
      fileInfos.push({ prefix, title, ext, filePath });
    }
  }

  // Sort fileInfos by numeric prefix. This ensures proper ordering of sections.
  fileInfos.sort((a, b) => {
    const aParts = a.prefix.split(".").map(Number);
    const bParts = b.prefix.split(".").map(Number);
    const len = Math.max(aParts.length, bParts.length);
    for (let i = 0; i < len; i++) {
      const aNum = aParts[i] || 0;
      const bNum = bParts[i] || 0;
      if (aNum !== bNum) {
        return aNum - bNum;
      }
    }
    return 0;
  });

  // Process each content file in parallel.
  const processedSections = await Promise.all(
    fileInfos.map(async (fileInfo) => {
      const fileContent = await fs.readFile(fileInfo.filePath, "utf-8");
      let content;
      if (fileInfo.ext === "md") {
        try {
          content = markdownToProseMirror(fileContent);
        } catch (err) {
          throw new Error(
            `Error processing Markdown in ${fileInfo.filePath}: ${err.message}`
          );
        }
      } else if (fileInfo.ext === "json") {
        try {
          content = JSON.parse(fileContent);
        } catch (err) {
          throw new Error(
            `Error parsing JSON in ${fileInfo.filePath}: ${err.message}`
          );
        }
      }
      return {
        id: fileInfo.prefix, // Use the numeric prefix as an identifier.
        title: fileInfo.title, // Derived from the filename.
        content, // Processed content.
        prefix: fileInfo.prefix, // Keep this for building the hierarchy.
      };
    })
  );

  // Build the nested section hierarchy based on the numeric prefixes.
  let sections = buildSectionTree(processedSections);
  pageData.sections = sections;
  return pageData;
}

/**
 * Builds a nested tree structure from a flat list of sections.
 * Each section's numeric prefix (e.g., "2.1") determines its level and parent.
 * Throws an error if a section's parent is missing.
 *
 * @param {Array<Object>} flatSections - Array of section objects with a "prefix" property.
 * @returns {Array<Object>} - Array of top-level sections, each containing nested subsections.
 */
function buildSectionTree(flatSections) {
  const sectionByPrefix = {};
  const topSections = [];

  for (const section of flatSections) {
    // Initialize the subsections array.
    section.subsections = [];
    const prefix = section.prefix;

    if (!prefix.includes(".")) {
      // Top-level section.
      topSections.push(section);
      sectionByPrefix[prefix] = section;
    } else {
      // For nested sections, compute the parent's prefix by removing the last segment.
      const parts = prefix.split(".");
      parts.pop();
      const parentPrefix = parts.join(".");
      const parent = sectionByPrefix[parentPrefix];
      if (!parent) {
        throw new Error(
          `Inconsistent numbering: section "${prefix}" has no parent (expected parent prefix "${parentPrefix}").`
        );
      }
      parent.subsections.push(section);
      sectionByPrefix[prefix] = section;
    }
  }
  return topSections;
}

// Export the main function for external usage.
module.exports = {
  collectSite,
};

// If this script is executed directly, run an example.
if (require.main === module) {
  // The root directory is passed as a command-line argument,
  // or defaults to a "pages" folder in the current directory.
  const rootDir = process.argv[2] || path.join(__dirname, "pages");
  collectSite(rootDir)
    .then((siteData) => {
      console.log(JSON.stringify(siteData, null, 2));
    })
    .catch((err) => {
      console.error("Error:", err);
      process.exit(1);
    });
}
