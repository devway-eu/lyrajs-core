# @lyrajs/core

[![npm version](https://img.shields.io/npm/v/@lyra-js/core)](https://www.npmjs.com/package/%40lyrajs/core)
[![CLA Assistant](https://cla-assistant.io/readme/badge/devway-eu/lyrajs-core)](https://cla-assistant.io/devway-eu/lyrajs-core)
[![docs](https://img.shields.io/badge/docs-read-green)](https://lyrajs.dev)
[![Discord](https://img.shields.io/discord/1449345012604342427?label=discord&logo=discord&logoColor=white)](https://discord.gg/cWvUh8pQNU)

The core framework package for LyraJS - a lightweight and modern TypeScript framework for building robust APIs.

## About

`@lyrajs/core` is the heart of the LyraJS framework. It provides all the essential building blocks, utilities, and tools needed to build modern, type-safe APIs with TypeScript. This package is designed to be installed via the LyraJS project template and contains the framework's core functionality.

## Role in the Framework

`@lyrajs/core` serves as the foundation layer that powers LyraJS applications. It provides:

- **Core abstractions** - Base classes and interfaces for entities, repositories, and controllers
- **CLI tooling** - The Maestro CLI for code generation and database management
- **Runtime utilities** - Middleware, validators, error handlers, and configuration loaders
- **Type definitions** - Comprehensive TypeScript types for type-safe development

The core package is published to npm and installed as a dependency in LyraJS projects created via `npm create lyrajs`.

## Features Provided

### 1. ORM System
- **Entity Management** - Decorator-based entity definitions with `@Table()` and `@Column()`
- **Repository Pattern** - Base `Repository<T>` class with common database operations
- **Query Builder** - Fluent API for building complex SQL queries
- **Database Abstraction** - Connection management and query execution for MySQL/MariaDB

### 2. CLI Tool (Maestro)
- **Interactive Code Generation** - Entities, controllers, repositories, and routes
- **Database Management** - Database creation, migration generation, and execution
- **Project Introspection** - Commands to list entities, controllers, routes, and migrations
- **Fixture Management** - Load seed data into the database

### 3. Configuration System
- **YAML Configuration** - Support for structured configuration files
- **Environment Variables** - Interpolation syntax `%env(VAR_NAME)%`
- **Config Loader** - Runtime access to configuration via `Config` class
- **Multi-file Support** - Separate configs for database, security, routing, and parameters

### 4. Authentication & Authorization
- **JWT Authentication** - Token generation and validation
- **Role-Based Access Control (RBAC)** - Route protection based on user roles
- **Role Hierarchy** - Automatic permission inheritance between roles
- **Configuration-Driven** - Access control rules defined in YAML

### 5. Middleware
- **Access Control Middleware** - Automatic route protection based on configuration
- **Error Handler** - Centralized error handling with proper HTTP responses
- **HTTP Request Middleware** - Request logging and metadata tracking
- **Built-in Validators** - Email, password, and username validation

### 6. Type System
- **Request Types** - `AuthenticatedRequest<T>` for authenticated routes
- **ORM Types** - Column types, entity metadata, and repository interfaces
- **Config Types** - Typed access to configuration values
- **Routing Types** - Route definitions and controller signatures

### 7. Error Handling
- **HTTP Exceptions** - Pre-built exception classes for common HTTP errors
  - `NotFoundException`
  - `BadRequestException`
  - `UnauthorizedException`
  - `ForbiddenException`
- **HTTP Status Codes** - Standardized status code constants
- **Error Handler Middleware** - Automatic exception-to-response conversion

### 8. Email Integration
- **Mailer Service** - Nodemailer integration
- **Mail Class** - Type-safe email composition
- **Transporter** - SMTP configuration and sending

### 9. Utilities
- **Validator** - Email, password, and username validation
- **Console Logging** - Colored console output with `LyraConsole`
- **Module Loaders** - Dynamic loading of user modules (entities, controllers, fixtures)
- **Data Formatters** - Data transformation and cleaning utilities

## Installation

`@lyrajs/core` is typically installed automatically when creating a new LyraJS project:

```bash
npm create lyrajs
```

For manual installation in an existing project:

```bash
npm install @lyrajs/core
```

## Usage

For complete usage documentation, tutorials, and examples, please refer to:

- **[Official Documentation](https://lyrajs.dev)** - Complete guides and API reference
- **[Main Repository](https://github.com/devway-eu/lyrajs)** - Framework overview and quick start
- **[Template Repository](https://github.com/devway-eu/lyrajs-template)** - Example project structure

## Contributing

We welcome contributions to `@lyrajs/core`! Here's how you can help:

### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/lyrajs-core.git
   cd lyrajs-core
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Test your changes locally**
   ```bash
   npm link

   # In a test project
   cd /path/to/test-project
   npm link @lyrajs/core
   ```

### Contribution Guidelines

- **Read the guidelines** - See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed instructions
- **Sign the CLA** - Contributors must agree to the [Contributor License Agreement](./CLA.md)
- **Follow conventions** - Maintain consistent code style and TypeScript practices
- **Write tests** - Include tests for new features or bug fixes
- **Document changes** - Update relevant documentation and type definitions

### Areas for Contribution

We particularly welcome contributions in these areas:

1. **ORM Features**
   - Additional database drivers (PostgreSQL, SQLite)
   - Advanced query builder features
   - Relationship mapping improvements

2. **CLI Enhancements**
   - New code generation templates
   - Interactive prompts improvements
   - Additional introspection commands

3. **Authentication**
   - Additional authentication strategies
   - OAuth2 integration
   - Session management improvements

4. **Documentation**
   - Code examples and tutorials
   - API documentation improvements
   - Type definition documentation

5. **Testing**
   - Increase test coverage
   - Integration tests
   - CLI command tests

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Write clean, documented code
   - Follow existing patterns and conventions
   - Add or update tests as needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add amazing feature"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open a Pull Request**
   - Provide a clear description of the changes
   - Reference any related issues
   - Ensure all tests pass

### Development Commands

```bash
npm run build        # Compile TypeScript to JavaScript
npm run dev          # Watch mode for development
npm test             # Run test suite (when available)
npm run lint         # Check code style
```

### Reporting Issues

Found a bug or have a feature request?

- **Check existing issues** - Search for similar issues first
- **Create a new issue** - Use the [issue tracker](https://github.com/devway-eu/lyrajs-core/issues)
- **Provide details** - Include version, environment, and reproduction steps

## Project Structure

```
lyrajs-core/
├── src/
│   ├── cli/              # Maestro CLI commands and kernel
│   │   ├── commands/     # Individual CLI commands
│   │   ├── utils/        # CLI helper utilities
│   │   └── Kernel.ts     # CLI command manager
│   ├── config/           # Configuration system
│   │   ├── Config.ts           # Config loader
│   │   ├── ConfigParser.ts     # YAML parser
│   │   ├── DatabaseConfig.ts   # Database config types
│   │   └── SecurityConfig.ts   # Security config types
│   ├── console/          # Console logging utilities
│   ├── errors/           # HTTP exceptions and status codes
│   ├── loader/           # Module loaders
│   ├── mailer/           # Email integration
│   ├── middlewares/      # Express middleware
│   │   ├── auth/         # Authentication middleware
│   │   ├── error/        # Error handler
│   │   └── http/         # HTTP request middleware
│   ├── orm/              # ORM system
│   │   ├── decorator/    # @Table and @Column decorators
│   │   ├── types/        # ORM type definitions
│   │   ├── Entity.ts     # Base entity class
│   │   ├── Repository.ts # Base repository class
│   │   ├── QueryBuilder.ts
│   │   └── Database.ts   # Database connection
│   ├── security/         # Security utilities
│   ├── types/            # TypeScript type definitions
│   ├── validator/        # Validation utilities
│   └── index.ts          # Main exports
├── bin/
│   └── maestro.js        # CLI entry point
├── dist/                 # Compiled JavaScript
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

## Release Process

Releases are managed by the core maintainers. The process includes:

1. Version bump in `package.json`
2. Update CHANGELOG.md
3. Build and test
4. Publish to npm
5. Create GitHub release with tag

## CLI Development

The CLI is built with:
- **Node.js** - JavaScript runtime
- **ES Modules** - Modern JavaScript module system
- **readline** - Interactive prompts
- **fs/promises** - Async file operations

Main files:
- `cli.js` - CLI entry point (bin)
- `src/createApp.js` - Project creation logic
- `template/` - Project template files

## Links

- **GitHub Repository**: [github.com/devway-eu/lyrajs-core](https://github.com/devway-eu/lyrajs-core)
- **npm Package**: [npmjs.com/package/@lyrajs/core](https://www.npmjs.com/package/@lyrajs/core)
- **Documentation**: [lyrajs.dev](https://lyrajs.dev)
- **Main Repository**: [github.com/devway-eu/lyrajs](https://github.com/devway-eu/lyrajs)
- **Issue Tracker**: [github.com/devway-eu/lyrajs-core/issues](https://github.com/devway-eu/lyrajs-core/issues)

## License

LyraJS is licensed under the [GPL-3.0 License](./LICENSE).

## Authors

- **Matthieu Fergola** - Core Developer
- **Anthony Dewitte** - Core Developer

## Acknowledgments

Built with dedication by the Devway team and our amazing contributors.

---

**Need help?** Join our [Discussions](https://github.com/devway-eu/lyrajs/discussions) or check the [documentation](https://lyrajs.dev).

## Contributors ❤️

![Contributors](https://img.shields.io/github/contributors/devway-eu/lyrajs)