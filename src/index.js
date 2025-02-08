import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import matter from "gray-matter";
import { promises as fs } from "fs";

import { processSequence } from "./parser/sequence.js";
import { processGroups } from "./parser/groups.js";
import { processByType } from "./parser/types.js";

/**
 * Parse a markdown section file into structured content
 * @param {string} filePath - Path to the markdown file
 * @returns {Promise<object>} Parsed content in multiple formats
 */
export async function parseSection(filePath) {
  // Read and parse the file
  const content = await fs.readFile(filePath, "utf-8");
  const { data: frontmatter, content: markdown } = matter(content);

  // Parse markdown into AST
  const ast = await unified().use(remarkParse).use(remarkGfm).parse(markdown);

  // Process content in different ways
  const sequence = processSequence(ast);
  const groups = processGroups(sequence);
  const byType = processByType(sequence);

  return {
    component: frontmatter.component,
    props: frontmatter.props || {},
    content: {
      raw: ast,
      sequence,
      groups,
      byType,
    },
  };
}

/**
 * Parse multiple section files into structured content
 * @param {string[]} filePaths - Array of markdown file paths
 * @returns {Promise<object>} Parsed content from all sections
 */
export async function parseSections(filePaths) {
  const sections = await Promise.all(
    filePaths.map(async (path) => {
      const content = await parseSection(path);
      // Extract section number from filename
      const sectionId = getSectionId(path);
      return { id: sectionId, ...content };
    })
  );

  // Sort sections by their numeric ID
  return sections.sort((a, b) => {
    const [aMajor, aMinor = 0] = a.id.split(".").map(Number);
    const [bMajor, bMinor = 0] = b.id.split(".").map(Number);
    return aMajor !== bMajor ? aMajor - bMajor : aMinor - bMinor;
  });
}

/**
 * Extract the section ID from a filename
 * @param {string} filePath - Full path to the markdown file
 * @returns {string} Section ID (e.g., "1" or "2.1")
 */
function getSectionId(filePath) {
  const filename = filePath.split("/").pop();
  return filename.split("-")[0];
}
