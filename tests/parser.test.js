import { jest } from "@jest/globals";
import path from "path";
import { fileURLToPath } from "url";
import { parseSection } from "../src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Content Parser", () => {
  describe("Hero Section", () => {
    let heroContent;

    beforeAll(async () => {
      const heroPath = path.join(__dirname, "fixtures/test-sections/1-hero.md");
      heroContent = await parseSection(heroPath);
    });

    test("parses frontmatter correctly", () => {
      expect(heroContent.component).toBe("Hero");
      expect(heroContent.props).toEqual({
        layout: "centered",
        background: "gradient",
      });
    });

    test("identifies background image", () => {
      const background = heroContent.content.byType.images.background[0];
      expect(background).toBeDefined();
      expect(background.src).toBe("./hero-bg.jpg");
    });

    test("structures headings correctly", () => {
      const { main } = heroContent.content.groups;

      expect(main.headings.eyebrow.content).toBe("WELCOME TO");
      expect(main.headings.title.content).toBe("Build Amazing Sites");
      expect(main.headings.subtitle.content).toBe("With Natural Writing");
    });

    test("preserves content sequence", () => {
      const sequence = heroContent.content.sequence;

      expect(sequence[0].type).toBe("image");
      expect(sequence[1].type).toBe("heading"); // eyebrow
      expect(sequence[2].type).toBe("heading"); // title
      expect(sequence[3].type).toBe("heading"); // subtitle
      expect(sequence[4].type).toBe("paragraph");
    });
  });

  describe("Features Section", () => {
    let featureContent;

    beforeAll(async () => {
      const featurePath = path.join(
        __dirname,
        "fixtures/test-sections/2-features.md"
      );
      featureContent = await parseSection(featurePath);
    });

    test("identifies main and item groups", () => {
      const { main, items } = featureContent.content.groups;

      expect(main.headings.title.content).toBe("Why Choose Rosetta");
      expect(items).toHaveLength(3);
    });

    test("processes feature items correctly", () => {
      const { items } = featureContent.content.groups;

      // Check first feature
      expect(items[0].headings.title.content).toBe("Natural Writing");
      expect(items[0].headings.title.labels).toContain("highlight");

      // Verify icon
      const icon = featureContent.content.byType.images.icons.find(
        (img) => img.context.nearestHeading.content === "Natural Writing"
      );
      expect(icon).toBeDefined();
      expect(icon.src).toBe("./icons/write.svg");
    });

    test("maintains heading hierarchy", () => {
      const headings = featureContent.content.byType.headings;

      expect(headings[0].level).toBe(1); // Main title
      expect(headings[1].level).toBe(2); // First feature
      expect(headings[2].level).toBe(2); // Second feature
      expect(headings[3].level).toBe(2); // Third feature
    });

    test("associates content with correct headings", () => {
      const { items } = featureContent.content.groups;

      items.forEach((item) => {
        // Each feature should have a heading and content
        expect(item.headings.title).toBeDefined();
        expect(item.content.length).toBeGreaterThan(0);

        // Content should include an image and description
        const hasImage = item.content.some((el) => el.type === "image");
        const hasText = item.content.some((el) => el.type === "paragraph");

        expect(hasImage).toBe(true);
        expect(hasText).toBe(true);
      });
    });
  });

  describe("Helper Functions", () => {
    test("getHeadingsByLevel returns correct headings", async () => {
      const featurePath = path.join(
        __dirname,
        "fixtures/test-sections/2-features.md"
      );
      const content = await parseSection(featurePath);

      const h1s = content.content.byType.getHeadingsByLevel(1);
      const h2s = content.content.byType.getHeadingsByLevel(2);

      expect(h1s).toHaveLength(1);
      expect(h2s).toHaveLength(3);
    });

    test("getElementsByHeadingContext finds related elements", async () => {
      const featurePath = path.join(
        __dirname,
        "fixtures/test-sections/2-features.md"
      );
      const content = await parseSection(featurePath);

      const elementsUnderFirstFeature =
        content.content.byType.getElementsByHeadingContext(
          (h) => h.content === "Natural Writing"
        );

      expect(elementsUnderFirstFeature.length).toBeGreaterThan(0);
      expect(elementsUnderFirstFeature.some((el) => el.type === "image")).toBe(
        true
      );
      expect(
        elementsUnderFirstFeature.some((el) => el.type === "paragraph")
      ).toBe(true);
    });
  });
});
