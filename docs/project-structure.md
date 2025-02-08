# Project Structure

rosetta/
├── src/ # Source files
│ ├── index.js # Main entry point
│ ├── cli.js # CLI implementation
│ ├── parser/ # Core parsing functionality
│ │ ├── index.js # Parser exports
│ │ ├── ast.js # AST processing
│ │ ├── sequence.js # Sequential content
│ │ ├── groups.js # Content grouping
│ │ └── types.js # Type-based grouping
│ ├── utils/ # Utility functions
│ │ ├── files.js # File operations
│ │ └── paths.js # Path handling
│ └── constants.js # Shared constants
├── examples/ # Example content and usage
│ ├── basic/ # Basic usage examples
│ └── advanced/ # Advanced usage examples
├── tests/ # Test files
│ ├── parser.test.js # Parser tests
│ ├── cli.test.js # CLI tests
│ └── fixtures/ # Test fixtures
├── .gitignore  
├── .eslintrc.json  
├── babel.config.json  
├── CHANGELOG.md  
├── LICENSE  
├── package.json  
└── README.md
