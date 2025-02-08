# Development Guide

This guide explains how to set up your development environment and test Rosetta effectively.

## Initial Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/uniwebcms/rosetta.git
   cd rosetta
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Development Workflow

### Running Tests

1. Unit Tests:

   ```bash
   # First build the project
   npm run build

   # Run tests once
   npm test

   # Run tests in watch mode
   npm run test:watch

   # Run tests with coverage report
   npm run test:coverage
   ```

2. Local Testing:

   To test changes locally while developing:

   ```bash
   # In the rosetta project directory
   npm run build
   npm link

   # Create a test project
   mkdir ~/test-rosetta
   cd ~/test-rosetta
   npm init -y

   # Link rosetta in the test project
   npm link @uniwebcms/rosetta

   # Create test content
   mkdir -p content/home
   ```

   Create some test content:

   ```markdown
   # content/home/1-hero.md

   ---

   component: Hero
   props:
   layout: centered

   ---

   ### WELCOME

   # Test Title

   Main content...
   ```

   Test the CLI:

   ```bash
   npx rosetta build content/ --validate
   ```

   Test programmatically:

   ```javascript
   // test.js
   import { parseSection } from "@uniwebcms/rosetta";

   async function test() {
     const content = await parseSection("content/home/1-hero.md");
     console.log(JSON.stringify(content, null, 2));
   }

   test().catch(console.error);
   ```

### Development Mode

For active development:

1. Start the build watcher:

   ```bash
   npm run dev
   ```

2. In another terminal, run tests in watch mode:
   ```bash
   npm run test:watch
   ```

This way, your code will be automatically rebuilt and tests will rerun when you make changes.

### Code Quality

1. Run the linter:

   ```bash
   npm run lint
   ```

2. Fix common issues automatically:
   ```bash
   npm run lint -- --fix
   ```

## Project Structure

```
rosetta/
├── src/                   # Source files
│   ├── index.js          # Main entry point
│   ├── cli.js            # CLI implementation
│   ├── parser/           # Core parsing functionality
│   └── validation/       # Content validation
├── tests/                # Test files
│   ├── parser.test.js    # Parser tests
│   └── fixtures/         # Test fixtures
├── lib/                  # Build output (generated)
└── docs/                 # Documentation
```

## Common Tasks

### Adding New Features

1. Create necessary source files in `src/`
2. Add tests in `tests/`
3. Update documentation if needed
4. Build and test locally
5. Submit a pull request

### Testing Changes

Always verify your changes in three ways:

1. Unit tests pass (`npm test`)
2. Local testing with a test project
3. Lint passes (`npm run lint`)

### Debugging

1. For CLI:

   ```bash
   node --inspect-brk lib/cli.js build ./content
   ```

2. For tests:
   ```bash
   node --inspect-brk node_modules/.bin/jest --runInBand
   ```

## Release Process

1. Update version in `package.json`
2. Update [CHANGELOG.md](../CHANGELOG.md)
3. Build and test:
   ```bash
   npm run build
   npm test
   ```
4. Commit changes
5. Create a git tag
6. Push to GitHub
7. Publish to npm:
   ```bash
   npm publish
   ```

## Troubleshooting

### Common Issues

1. Test failures after changes:

   - Ensure you've rebuilt the project (`npm run build`)
   - Check test fixtures match your changes
   - Run tests in watch mode for faster feedback

2. Module not found errors:

   - Verify build is up to date
   - Check import paths use `.js` extension
   - Ensure all dependencies are installed

3. CLI not working in test project:
   - Rebuild the project
   - Re-run `npm link` in both directories
   - Check if CLI file is executable

### Getting Help

- Check existing issues on GitHub
- Ask in pull request discussions
- Update documentation as you learn solutions
