# NPM Library: Site and Page Content Collector

This document describes the requirements and design of an NPM library that collects files from a folder structure representing a website. It processes page content, metadata, and section hierarchies to output a single JavaScript object with the complete site structure. Use this prompt to start a new conversation or guide the implementation without needing further clarifications.

---

## 1. Overview

The library should process a folder structure where:

- **Each nested folder represents a page.**
- **Each file within a page folder represents a section** of that page.
- **Sections can have nested subsections**, indicated by numeric prefixes (e.g., `2.1-feature-one.md` is a subsection).

---

## 2. File Structure and Conventions

### Content Files

- **Supported File Extensions:**

  - Markdown: `.md`
  - JSON: `.json`

- **Naming Convention:**

  - Every content file must start with a **numeric prefix**. This prefix defines the order and the nesting level of sections.
  - Files without a numeric prefix will be ignored to maintain consistent ordering.

- **Section Hierarchy:**
  - A file named `1-hero.md` is a top-level section.
  - A file named `2.1-feature-one.md` is considered a subsection (nested under section `2`).
  - The hierarchy is inferred from the numeric prefixes (e.g., `1`, `2`, `2.1`, `2.2`, etc.).
  - The library should support any level of nested sections (configurable maximum level is optional). Although levels beyond 3 are uncommon, they are supported.
  - **Inconsistent numbering** (e.g., a subsection without a valid parent) should result in an error being thrown.

### Metadata Files

- **Page Metadata:**

  - Each page folder can optionally include a `page.yml` file to provide metadata for that page.
  - The metadata might include details like the homepage designation or page ordering.

- **Site Metadata:**

  - The root folder may contain a `site.yml` file to hold site-level metadata (e.g., global settings, designation of the home page).

- **File Format:**
  - Metadata files are in YAML format (with the `.yml` extension).

---

## 3. Processing Content Files

### Markdown Files

- Markdown files should be processed using the `markdownToProseMirror` function from the `@uniwebcms/content-reader` package.
- This function will convert Markdown content into a JSON format compatible with ProseMirror/TipTap.

### JSON Files

- JSON files are assumed to already adhere to the expected ProseMirror/TipTap JSON format.
- Future enhancements may include validation to ensure the JSON is correct.

---

## 4. Output Data Structure

The library should produce a single JavaScript object structured as follows:

```js
{
  siteMetadata: { /* contents of site.yml if present */ },
  pages: {
    home: {
      metadata: { /* contents of page.yml if present */ },
      sections: [
        {
          id: "1",            // Numeric prefix (e.g., from "1-hero.md")
          title: "hero",      // Derived from the filename
          content: {          // Processed content from Markdown or JSON
            // Content in ProseMirror/TipTap JSON format
          },
          subsections: [      // Array of nested sections (same structure)
            // ...
          ]
        },
        // More sections in numeric order...
      ]
    },
    team: { /* Similar structure for the "team" page */ },
    about: { /* Similar structure for the "about" page */ }
  },
  // Optionally, an "errors" array can be included to list pages or sections with issues.
}
```

### Ordering

- **Within a Page:** Sections are ordered by their numeric prefixes.
- **Between Pages:** Page ordering can be determined via metadata (using a numeric order or relationships, such as referencing a previous page) or by folder name if not explicitly set.

---

## 5. Error Handling and Performance

### Error Handling

- **Strict Error Handling:**
  - The library should throw an error immediately when encountering issues such as:
    - Malformed Markdown, JSON, or YAML files.
    - Inconsistent section numbering (e.g., a subsection that references a non-existent parent).
- **Optional Error Aggregation:**
  - Alternatively, the implementation could collect errors and flag affected pages/sections (for example, by including an `errors` array in the output), but for now, throwing errors is acceptable.

### Performance Considerations

- **Asynchronous Processing:**
  - Use an asynchronous API (Promises/async-await) to perform non-blocking file I/O.
- **Parallel Processing:**
  - File reading and processing can be parallelized to take advantage of performance gains.
- **Caching:**
  - Caching strategies can be considered later if the performance needs require it.

---

## 6. Conventions Over Configuration

- **Defaults:**
  - The library should favor conventional file names and structures:
    - `page.yml` for page-level metadata.
    - `site.yml` for site-level metadata.
- **Minimal Configuration:**
  - The design should limit exposed configuration options. For example, the maximum nesting level could be configurable but defaults to allowing any depth.
- **Async & Parallel Processing:**
  - Emphasize asynchronous and parallel processing to improve speed, especially when dealing with many files.

---

## 7. Summary of Requirements

- **File Types and Naming:**
  - Only process `.md` and `.json` files that have a mandatory numeric prefix.
  - Ignore any file that does not begin with a numeric prefix.
- **Section Hierarchy:**

  - Use the numeric prefixes (including dot notation) to determine section order and nesting.
  - Throw errors for any inconsistencies in numbering.

- **Metadata:**
  - Optionally process `page.yml` for page-specific metadata and `site.yml` for site-level metadata.
- **Content Processing:**
  - Convert Markdown files to a ProseMirror/TipTap JSON format using `markdownToProseMirror`.
  - Accept JSON files as already being in the correct format.
- **Output Structure:**
  - Produce a JavaScript object containing:
    - `siteMetadata`
    - `pages` (with each page having its own `metadata` and ordered `sections`)
    - Optionally, an `errors` array to capture issues.
- **Error Handling:**
  - Throw errors on malformed content or structural inconsistencies, with the possibility of later supporting error aggregation.
- **Performance:**
  - Leverage asynchronous and parallel processing for file operations.
- **Conventions Over Configuration:**
  - Rely on standard file names and structures, exposing only minimal configuration options when necessary.
