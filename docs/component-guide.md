# Rosetta Component Development Guide

## Overview

This guide explains how to create components that work effectively with Rosetta's content parsing system. Components receive rich, structured content that they can render in various ways.

## Content Structure

Components receive content in multiple formats:

```javascript
{
  // Component identification
  component: 'YourComponent',
  props: {
    // Props from frontmatter
  },

  content: {
    // Raw AST for maximum flexibility
    raw: markdownAST,

    // Sequential elements
    sequence: [
      { type: 'heading', level: 1, content: 'Title' },
      { type: 'paragraph', content: 'Description...' }
    ],

    // Grouped by element type
    byType: {
      headings: [/* all headings with context */],
      images: {
        background: [],
        content: [],
        gallery: [],
        icons: []
      },
      paragraphs: [/* all paragraphs */]
    },

    // Semantic structure
    groups: {
      main: {
        headings: {
          eyebrow: { level: 3, content: 'Category' },
          title: { level: 1, content: 'Main Title' },
          subtitle: { level: 2, content: 'Subtitle' }
        },
        content: [/* main content elements */]
      },
      items: [
        {
          headings: {/* item headings */},
          content: [/* item content */]
        }
      ]
    }
  }
}
```

## Basic Component Example

```javascript
function FeatureShowcase({ content, ...props }) {
  const { groups, byType } = content;

  return (
    <section className={props.layout}>
      {/* Main content */}
      <header>
        {groups.main.headings.eyebrow && (
          <p className="eyebrow">{groups.main.headings.eyebrow.content}</p>
        )}
        <h1>{groups.main.headings.title.content}</h1>
        {groups.main.headings.subtitle && (
          <h2>{groups.main.headings.subtitle.content}</h2>
        )}
      </header>

      {/* Feature items */}
      <div className="features">
        {groups.items.map((item, index) => (
          <article key={index}>
            <h3>{item.headings.title.content}</h3>
            {item.content.map((element, i) => (
              <ContentElement key={i} element={element} />
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
```

## Working with Content

### Using Sequences

Good for content-driven components like articles:

```javascript
function Article({ content }) {
  return (
    <article>
      {content.sequence.map((element, index) => (
        <ContentElement key={index} element={element} />
      ))}
    </article>
  );
}
```

### Using Type Collections

Good for specialized handling:

```javascript
function ImageGallery({ content }) {
  const { images } = content.byType;

  return (
    <div className="gallery">
      {images.gallery.map((image, index) => (
        <img
          key={index}
          src={image.src}
          alt={image.alt}
          className={image.context.nearestHeading ? "with-caption" : ""}
        />
      ))}
    </div>
  );
}
```

### Using Groups

Good for structured content:

```javascript
function TeamGrid({ content }) {
  const { main, items } = content.groups;

  return (
    <section>
      {/* Team introduction */}
      <header>
        <h1>{main.headings.title.content}</h1>
        {main.content.map((element, index) => (
          <ContentElement key={index} element={element} />
        ))}
      </header>

      {/* Team members */}
      <div className="team-grid">
        {items.map((member, index) => (
          <TeamMember key={index} data={member} />
        ))}
      </div>
    </section>
  );
}
```

## Helper Functions

Use byType helpers for common tasks:

```javascript
function ContentSection({ content }) {
  const { byType } = content;

  // Get headings of specific level
  const mainHeadings = byType.getHeadingsByLevel(1);

  // Get elements associated with a heading
  const introContent = byType.getElementsByHeadingContext(
    (h) => h.content === "Introduction"
  );

  // Get content between headings
  const betweenSections = byType.getContentBetweenHeadings(
    mainHeadings[0],
    mainHeadings[1]
  );
}
```

## Best Practices

1. **Choose the Right Access Pattern**

   - Use sequence for content-driven components
   - Use byType for specialized handling
   - Use groups for structured content

2. **Handle Missing Content**

   ```javascript
   function Hero({ content }) {
     const { main } = content.groups;

     return (
       <header>
         {main?.headings?.title && <h1>{main.headings.title.content}</h1>}
         {main?.content?.length > 0 && (
           <div className="content">{main.content.map(/*...*/)}</div>
         )}
       </header>
     );
   }
   ```

3. **Preserve Content Relationships**

   ```javascript
   function Feature({ content }) {
     // Keep images near their headings
     const { items } = content.groups;

     return items.map((item) => (
       <div key={item.headings.title.content}>
         <h3>{item.headings.title.content}</h3>
         {/* Show images immediately after their heading */}
         {item.content.filter((el) => el.type === "image")}
         {/* Then show other content */}
         {item.content.filter((el) => el.type !== "image")}
       </div>
     ));
   }
   ```

4. **Use Metadata**
   ```javascript
   function Section({ content }) {
     const { metadata } = content.groups.main;

     // Adapt layout based on content
     const hasImages = metadata.contentTypes.includes("image");
     const layout = hasImages ? "with-media" : "text-only";

     return <div className={layout}>{/*...*/}</div>;
   }
   ```

## Component Props

Design props for high-level control:

```markdown
---
component: Features
props:
  layout: grid # Not: gridColumns: 3
  style: minimal # Not: backgroundColor: '#f5f5f5'
  emphasis: alternate # Not: textAlign: 'left'
---
```

Props should:

- Express intentions, not implementations
- Use meaningful presets over raw values
- Focus on content organization, not styling

## Content Patterns

Support common content structures:

1. **Hero Pattern**

   ```markdown
   ![background](./bg.jpg)

   ### CATEGORY

   # Title

   ## Subtitle
   ```

2. **Feature Pattern**

   ```markdown
   # Features

   Overview...

   ## Feature One

   ![icon](./icon1.svg)
   Description...
   ```

3. **Grid Pattern**

   ```markdown
   # Grid Title

   ## Item One

   ![](./item1.jpg)
   Details...
   ```

## Testing Components

Test with various content patterns:

```javascript
describe("FeatureShowcase", () => {
  test("renders with minimal content", () => {
    const content = {
      groups: {
        main: {
          headings: { title: { content: "Title" } },
          content: [],
        },
        items: [],
      },
    };

    render(<FeatureShowcase content={content} />);
    // Assert minimal rendering
  });

  test("handles full content structure", () => {
    const content = {
      groups: {
        main: {
          headings: {
            eyebrow: { content: "Category" },
            title: { content: "Title" },
            subtitle: { content: "Subtitle" },
          },
          content: [
            /* ... */
          ],
        },
        items: [
          /* ... */
        ],
      },
    };

    render(<FeatureShowcase content={content} />);
    // Assert full rendering
  });
});
```

## Advanced Features

1. **Custom Patterns**

   ```javascript
   function CustomComponent({ content }) {
     // Define pattern recognition
     const findSpecialPattern = (sequence) => {
       return sequence.filter((el, i, arr) => {
         // Example: Find image followed by heading and paragraph
         return (
           el.type === "image" &&
           arr[i + 1]?.type === "heading" &&
           arr[i + 2]?.type === "paragraph"
         );
       });
     };

     // Apply pattern
     const specialSections = findSpecialPattern(content.sequence);

     return (
       <div>
         {specialSections.map((section, index) => (
           <SpecialSection key={index} data={section} />
         ))}
       </div>
     );
   }
   ```

2. **Content Transformations**

   ```javascript
   function TransformingComponent({ content }) {
     // Transform content structure
     const processedContent = content.groups.items.map((item) => ({
       title: item.headings.title.content,
       image: item.content.find((el) => el.type === "image"),
       description: item.content
         .filter((el) => el.type === "paragraph")
         .map((p) => p.content)
         .join("\n"),
     }));

     return <CustomView data={processedContent} />;
   }
   ```

3. **Dynamic Layouts**

   ```javascript
   function AdaptiveComponent({ content, ...props }) {
     // Analyze content to determine layout
     const layout = determineOptimalLayout({
       hasLongContent: content.groups.main.content.length > 3,
       hasImages: content.byType.images.content.length > 0,
       columnCount: props.columns || "auto",
     });

     return (
       <div className={`layout-${layout}`}>
         {/* Render content adapted to layout */}
       </div>
     );
   }
   ```

4. **Content Relationships**

   ```javascript
   function RelationalComponent({ content }) {
     // Build relationship map
     const relationships = new Map();

     content.sequence.forEach((el, i, arr) => {
       if (el.type === "heading") {
         // Find related content
         const related = arr
           .slice(i + 1)
           .takeWhile((next) => next.type !== "heading");

         relationships.set(el, related);
       }
     });

     return (
       <div>
         {Array.from(relationships).map(([heading, content]) => (
           <Section key={heading.content}>
             <h2>{heading.content}</h2>
             <RelatedContent items={content} />
           </Section>
         ))}
       </div>
     );
   }
   ```

## Performance Considerations

1. **Content Memoization**

   ```javascript
   function OptimizedComponent({ content }) {
     // Memoize expensive content processing
     const processedContent = useMemo(() => {
       return processContent(content);
     }, [content]);

     return <View data={processedContent} />;
   }
   ```

2. **Lazy Loading**
   ```javascript
   function LazyComponent({ content }) {
     // Load heavy content sections on demand
     const [activeSection, setActiveSection] = useState(0);

     return (
       <div>
         {content.groups.items.map((item, index) => (
           <Suspense key={index} fallback={<Loader />}>
             {index === activeSection && <HeavyContentSection data={item} />}
           </Suspense>
         ))}
       </div>
     );
   }
   ```

## Error Handling

1. **Graceful Degradation**

   ```javascript
   function RobustComponent({ content }) {
     // Handle missing or malformed content
     if (!content.groups.main?.headings?.title) {
       return (
         <div className="fallback">
           <h1>Untitled Section</h1>
           {content.sequence.map(renderElement)}
         </div>
       );
     }

     // Normal rendering...
   }
   ```

2. **Content Validation**

   ```javascript
   function validateComponentContent(content) {
     const issues = [];

     // Check required structure
     if (!content.groups.main) {
       issues.push("Missing main content group");
     }

     // Check content requirements
     if (content.byType.images.length === 0) {
       issues.push("Component requires at least one image");
     }

     return issues;
   }
   ```

## Development Tools

1. **Component Preview**

   ```javascript
   // Create sample content for development
   const sampleContent = {
     groups: {
       main: {
         headings: {
           title: { content: "Sample Title" },
         },
         content: [
           /* ... */
         ],
       },
       items: [
         /* ... */
       ],
     },
   };

   // Preview different states
   function Preview() {
     return (
       <div>
         <h2>Minimal Content</h2>
         <YourComponent content={minimalContent} />

         <h2>Full Content</h2>
         <YourComponent content={fullContent} />

         <h2>Edge Cases</h2>
         <YourComponent content={edgeCaseContent} />
       </div>
     );
   }
   ```

2. **Debug Helpers**
   ```javascript
   function DebugView({ content }) {
     const [debug, setDebug] = useState(false);

     return (
       <>
         <button onClick={() => setDebug(!debug)}>Toggle Debug</button>

         {debug ? (
           <pre>{JSON.stringify(content, null, 2)}</pre>
         ) : (
           <YourComponent content={content} />
         )}
       </>
     );
   }
   ```

Remember: Components should be flexible enough to handle various content patterns while maintaining consistent rendering logic and graceful fallbacks for edge cases.
