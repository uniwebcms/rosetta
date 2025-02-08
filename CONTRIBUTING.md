# Contributing to Rosetta

We love your input! We want to make contributing to Rosetta as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We Develop with Github

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue a pull request.

## Any contributions you make will be under the Apache License 2.0

When you submit code changes, your submissions are understood to be under the same [Apache License 2.0](LICENSE) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's [issue tracker](https://github.com/uniwebcms/rosetta/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/uniwebcms/rosetta/issues/new).

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Development Process

1. Clone the repository:

   ```bash
   git clone https://github.com/uniwebcms/rosetta.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. Make your changes and test:

   ```bash
   npm test
   npm run lint
   ```

5. Push your branch and create a pull request.

## Testing

- Write test cases for any new functionality
- Ensure existing tests pass
- Run tests with `npm test`
- Check code coverage with `npm run test:coverage`

## Documentation

- Update documentation for any changed functionality
- Follow the existing documentation style
- Test documentation examples to ensure they work
- Keep explanations clear and concise

## Code Style

We use ESLint to maintain code quality. Our style guide is enforced through our ESLint configuration.

Key points:

- Use 2 spaces for indentation
- Use single quotes for strings
- Always use semicolons
- Follow the existing code style

Run the linter:

```bash
npm run lint
```

## Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.
