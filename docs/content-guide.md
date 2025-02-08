# Rosetta Content Guide

## Overview

Rosetta enables sophisticated web content creation through natural markdown writing. This guide explains how to write content effectively using our conventions and patterns.

## Content Organization

### Page Structure

Pages are organized as directories containing numbered markdown files:

```
content/
  home/
    1-hero.md
    2.1-features.md
    2.2-benefits.md
    3-conclusion.md
  about/
    1-main.md
    2-team.md
```

The numbering system determines the order of sections and supports subsections (e.g., 2.1, 2.2).

### Section Files

Each section file consists of:

1. **Frontmatter**: Component selection and configuration
2. **Content**: Markdown content organized using natural patterns

Example:

```markdown
---
component: Hero
props:
  layout: centered
  background: gradient
---

### SOLUTIONS

# Main Heading

## Subtitle

Main content goes here...
```

## Writing Patterns

### Basic Section Structure

A typical section follows this pattern:

```markdown
![background](./image.jpg) # Optional background image

### EYEBROW TEXT # Optional small heading above

# Main Title # Main heading

## Subtitle # Optional subtitle

Main content paragraphs... # Main content

## Feature One # Section items start

Feature description...

## Feature Two # Another item

More description...
```

### Content Groups

Content naturally forms groups based on headings:

1. **Main Group**: Everything before the first content division
2. **Item Groups**: Subsequent content sections

Example:

```markdown
# Main Title # Main group starts

Main description...

## First Feature # First item group

Feature content...

## Second Feature # Second item group

Feature content...
```

### Special Elements

1. **Background Images**:

   ```markdown
   ![background](./bg.jpg) # Place before headings

   # Title
   ```

2. **Icons**:

   ```markdown
   ## Feature

   ![icon: rocket](./icon.svg) # Use icon: prefix
   Feature content...
   ```

3. **Labels**:

   ```markdown
   ## Section Title {.highlight} # Add labels after heading

   Content...
   ```

4. **Explicit Dividers**:
   ```markdown
   # Product List

   First product...
   --- # Divides content without headings
   Second product...
   ```

## Common Patterns

### Hero Sections

```markdown
---
component: Hero
props:
  layout: centered
---

![background](./hero.jpg)

### WELCOME

# Main Title

## Subtitle

Brief description...

[Call to Action](#)
```

### Feature Showcases

```markdown
---
component: Features
props:
  columns: 3
---

# Our Features

Why choose our platform...

## Fast {.highlight}

![icon: zap](./icons/fast.svg)
Lightning quick performance...

## Secure {.highlight}

![icon: shield](./icons/secure.svg)
Enterprise-grade security...

## Simple {.highlight}

![icon: feather](./icons/simple.svg)
Easy to use...
```

### Team Members

```markdown
---
component: Team
props:
  layout: grid
---

# Our Team

Meet our experts...

## Sarah Chen

![profile](./team/sarah.jpg)
Lead Designer
Experience in...

## Alex Kim

![profile](./team/alex.jpg)
Senior Developer
Specializes in...
```

### Content with Sidebar

```markdown
---
component: ContentLayout
props:
  sidebar: right
---

# Main Content

Main article content...

---

## In This Article # Sidebar content after divider

- First Section
- Second Section
```

## Best Practices

### Content Organization

1. **Use Heading Hierarchy Meaningfully**

   - H1 (#) for main titles
   - H2 (##) for major sections
   - H3 (###) for subsections or eyebrow text

2. **Group Related Content**

   - Keep related elements together
   - Use consistent patterns for similar content
   - Consider how content will be processed

3. **Image Placement**
   - Background images before headings
   - Content images after their reference
   - Icons next to their headings

### Writing Tips

1. **Clear Structure**

   - Start with the most important information
   - Use consistent patterns
   - Keep groups logically organized

2. **Content Flow**

   - Maintain natural reading order
   - Use headings to create clear sections
   - Group related information together

3. **Media Usage**
   - Use descriptive image names
   - Provide meaningful alt text
   - Consider image context and purpose

## Component Conventions

### Heading Patterns

Components typically interpret headings as:

1. **Single H1**: Main title
2. **H3 before H1**: Eyebrow text
3. **H2 after H1**: Subtitle
4. **Subsequent H2s**: Content sections

### Image Roles

Images are interpreted based on:

1. **Position**: Before headings = background
2. **Prefix**: `icon:` = icon image
3. **Context**: Within content = content image

### Content Groups

Content is grouped by:

1. **Heading Hierarchy**: New H2 starts new group
2. **Explicit Dividers**: --- creates group
3. **Special Syntax**: Component-specific grouping

## Troubleshooting

### Common Issues

1. **Incorrect Grouping**

   - Check heading levels
   - Verify divider placement
   - Review content organization

2. **Image Problems**

   - Verify image paths
   - Check role prefixes
   - Confirm placement

3. **Component Issues**
   - Verify frontmatter syntax
   - Check prop values
   - Review component documentation

### Validation

Run validation to check content:

```bash
rosetta build content/ --validate
```

Use strict mode for thorough checking:

```bash
rosetta build content/ --validate --strict
```

## Advanced Usage

### Custom Patterns

Components can define special patterns:

```markdown
::feature{icon="rocket"}

# Title

Content...
::

::gallery
![Image 1](./1.jpg)
![Image 2](./2.jpg)
::
```

### Dynamic Content

Use frontmatter for dynamic features:

```markdown
---
component: Features
props:
  layout: alternate
  animate: true
  delay: 200
---
```

### Responsive Content

Components handle responsive behavior:

```markdown
---
component: Hero
props:
  mobileLayout: stacked
  desktopLayout: split
---
```

## Next Steps

1. Review component documentation
2. Start with basic patterns
3. Gradually incorporate advanced features
4. Use validation to check content
5. Follow best practices consistently

Remember: Focus on content structure and let components handle presentation.
