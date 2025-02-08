# Rosetta

A sophisticated content parsing system that bridges the gap between natural content writing and component-based web development. Named after the Rosetta Stone, this library helps translate naturally-written markdown content into rich, structured data that web components can easily consume.

## Core Concepts

Rosetta is built on three fundamental ideas:

1. **Natural Writing Experience**: Content creators write in familiar markdown, organizing their content just like they would in a document or book. No technical knowledge required.

2. **Smart Content Understanding**: The parser understands document structure and relationships, automatically identifying patterns like eyebrow text, feature lists, and content groups.

3. **Component-Ready Output**: Components receive content in multiple formats optimized for different needs - from raw AST to semantic groupings.

## Quick Start

Install the package:

```bash
npm install @uniwebcms/rosetta
```

Create your content sections:

First, organize your pages as directories of numbered markdown files:

```
content/
  home/
    1-hero.md
    2.1-feature-one.md
    2.2-feature-two.md
    3-conclusion.md
```

Then write your content using natural markdown structure. Here's a hero section example:

```markdown
---
component: Hero
props:
  layout: centered
  background: gradient
---

### WELCOME

# Build Amazing Websites

## With Natural Writing

Transform your content into powerful web experiences using
familiar markdown conventions.
```

Process your content:

```javascript
import { parseSection } from "@uniwebcms/rosetta";

const content = await parseSection("content/pages/home/1-hero.md");

// Access content in multiple ways:
console.log(content.groups.main.title);
console.log(content.sequence);
console.log(content.byType.headings);
```

Or use the CLI:

```bash
# Build all content
rosetta build ./content --output ./dist

# Watch mode for development
rosetta watch ./content --output ./dist
```

## Content Structure

Rosetta understands natural document organization. Let's look at how different content structures are interpreted:

### Main Content with Eyebrow

```markdown
### SOLUTIONS

# Platform Features

## Built for Scale

Our platform provides enterprise-grade solutions...
```

This creates a main content group with three related headings: eyebrow ("SOLUTIONS"), title ("Platform Features"), and subtitle ("Built for Scale").

### Feature Lists

```markdown
# Our Features

Transform how you build websites.

## Fast Performance

Lightning quick response times...

## Easy Integration

Connect with your existing tools...

## 24/7 Support

Round-the-clock assistance...
```

This structure is recognized as a main section (title and description) followed by a list of feature items, each with its own title and content.

### Media Integration

```markdown
---
component: Hero
---

![](./hero-background.jpg)

### WELCOME

# Main Title

![](./feature1.jpg)

## Feature One

Feature description...
```

Images are interpreted based on their position:

- Before any heading: Treated as background
- After a heading: Associated with that section's content

## Parser Output

Content is provided to components in multiple formats:

```javascript
{
  // Component identification
  component: 'Hero',
  props: { layout: 'centered' },

  content: {
    // Sequential elements
    sequence: [
      { type: 'heading', level: 1, content: 'Title' },
      { type: 'paragraph', content: 'Description...' }
    ],

    // Grouped by element type
    byType: {
      headings: [/* all headings with context */],
      images: [/* all images with context */],
      paragraphs: [/* all paragraphs */]
    },

    // Semantic structure
    groups: {
      main: {/* main content group */},
      items: [/* subsequent groups */]
    }
  }
}
```

## CLI Usage

The CLI supports various options for content processing:

```bash
# Basic build
rosetta build ./content

# Watch for changes
rosetta watch ./content

# Validate content
rosetta build ./content --validate

# Strict validation
rosetta build ./content --validate --strict

# Pretty print output
rosetta build ./content --pretty
```

## Documentation

- [Content Writing Guide](docs/content-guide.md)
- [Component Development Guide](docs/component-guide.md)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

Apache License 2.0 - See [LICENSE](LICENSE) for details.
