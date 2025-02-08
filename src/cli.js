#!/usr/bin/env node

import { program } from "commander";
import path from "path";
import { promises as fs } from "fs";
import chokidar from "chokidar";
import { parseSection, parseSections } from "./index.js";
import {
  validateContent,
  formatValidationMessages,
} from "./validation/index.js";

program
  .name("rosetta")
  .description("Content processing tool for component-based websites")
  .version("0.1.0");

program
  .command("build")
  .description("Build content from markdown files")
  .argument("<source>", "Source directory containing content")
  .option("-o, --output <path>", "Output directory", "./dist")
  .option("--pretty", "Pretty print JSON output", false)
  .option("--validate", "Run content validation", false)
  .option("--strict", "Treat validation warnings as errors", false)
  .action(async (source, options) => {
    try {
      await buildContent(source, options);
      console.log("Content built successfully!");
    } catch (error) {
      console.error("Error building content:", error);
      process.exit(1);
    }
  });

program
  .command("watch")
  .description("Watch for content changes and rebuild")
  .argument("<source>", "Source directory containing content")
  .option("-o, --output <path>", "Output directory", "./dist")
  .option("--pretty", "Pretty print JSON output", false)
  .action(async (source, options) => {
    try {
      // Initial build
      await buildContent(source, options);
      console.log("Initial build complete. Watching for changes...");

      // Watch for changes
      const watcher = chokidar.watch(source, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
      });

      watcher
        .on("change", async (changedPath) => {
          console.log(`File ${changedPath} has been changed`);
          await buildContent(source, options);
          console.log("Rebuild complete");
        })
        .on("add", async (addedPath) => {
          console.log(`File ${addedPath} has been added`);
          await buildContent(source, options);
          console.log("Rebuild complete");
        })
        .on("unlink", async (removedPath) => {
          console.log(`File ${removedPath} has been removed`);
          await buildContent(source, options);
          console.log("Rebuild complete");
        });
    } catch (error) {
      console.error("Error in watch mode:", error);
      process.exit(1);
    }
  });

async function buildContent(sourcePath, options) {
  const hasErrors = new Set();
  const absoluteSource = path.resolve(sourcePath);
  const absoluteOutput = path.resolve(options.output);

  // Ensure output directory exists
  await fs.mkdir(absoluteOutput, { recursive: true });

  // Get all page directories
  const pages = await getPages(absoluteSource);
  const content = {};

  // Process each page
  for (const [pageName, pagePath] of Object.entries(pages)) {
    const sections = await getSections(pagePath);
    const sectionContents = await parseSections(sections);
    content[pageName] = sectionContents;

    // Run validation if requested
    if (options.validate) {
      for (const section of sectionContents) {
        const validationResults = validateContent(section);

        if (
          validationResults.errors.length > 0 ||
          (options.strict && validationResults.warnings.length > 0)
        ) {
          hasErrors.add(`${pageName}/${section.id}`);
        }

        const messages = formatValidationMessages(validationResults);
        console.log(`\nValidating ${pageName}/${section.id}:`);
        console.log(messages);
      }
    }
  }

  // Write output
  const outputFile = path.join(absoluteOutput, "content.json");
  await fs.writeFile(
    outputFile,
    JSON.stringify(content, null, options.pretty ? 2 : 0)
  );

  // Exit with error if validation failed
  if (hasErrors.size > 0) {
    console.error(`\nValidation failed for ${hasErrors.size} section(s):`);
    hasErrors.forEach((section) => console.error(`- ${section}`));
    process.exit(1);
  }

  return content;
}

async function getPages(contentRoot) {
  const pages = {};
  const entries = await fs.readdir(contentRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      pages[entry.name] = path.join(contentRoot, entry.name);
    }
  }

  return pages;
}

async function getSections(pagePath) {
  const sections = [];
  const entries = await fs.readdir(pagePath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith(".md")) {
      sections.push(path.join(pagePath, entry.name));
    }
  }

  return sections;
}

// Handle unhandled errors
process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  process.exit(1);
});

// Parse command line arguments
program.parse();
