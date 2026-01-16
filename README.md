# @lyra-js/core

[![npm version](https://img.shields.io/npm/v/@lyra-js/core)](https://www.npmjs.com/package/@lyrajs/core)
[![CLA Assistant](https://cla-assistant.io/readme/badge/devway-eu/lyrajs-core)](https://cla-assistant.io/devway-eu/lyrajs-core)
[![docs](https://img.shields.io/badge/docs-read-green)](https://lyrajs.dev)
[![Discord](https://img.shields.io/discord/1449345012604342427?label=discord&logo=discord&logoColor=white)](https://discord.gg/cWvUh8pQNU)

The core framework package for LyraJS - a lightweight and modern TypeScript framework for building robust APIs.

## About

`@lyra-js/core` is the heart of the LyraJS framework. It provides all the essential building blocks, utilities, and tools needed to build modern, type-safe APIs with TypeScript. This package is designed to be installed via the LyraJS project template and contains the framework's core functionality.

## Role in the Framework

`@lyra-js/core` serves as the foundation layer that powers LyraJS applications. It provides:

- **Core abstractions** - Base classes and interfaces for entities, repositories, and controllers
- **CLI tooling** - The Maestro CLI for code generation and database management
- **Runtime utilities** - Middleware, validators, error handlers, and configuration loaders
- **Type definitions** - Comprehensive TypeScript types for type-safe development

The core package is published to npm and installed as a dependency in LyraJS projects created via `npm create lyrajs`.

## Features Provided

### 1. Server-Side Rendering (SSR) 🆕
- **Template Engine System** - Complete SSR framework with pluggable template engines
- **JSX/TSX Support** - Native support for JSX and TSX template rendering
- **TemplateRenderer** - High-level API for rendering templates with data
- **Template Engines** - Extensible engine architecture for multiple template formats
- **SSR Middleware** - Seamless integration with the server middleware stack

### 2. Job Scheduler 🆕
- **Scheduler System** - Comprehensive cron-based job scheduling framework
- **@Job Decorator** - Decorator for marking classes as scheduled jobs
- **@Schedule Decorator** - Decorator for defining cron schedules on job methods
- **CronParser** - Built-in cron expression parser and validator
- **Job Management** - Start, stop, and manage scheduled jobs programmatically
- **Timezone Support** - Configure timezone for scheduled job execution

### 3. Dependency Injection (DI) 🆕
- **DIContainer** - Full-featured dependency injection container
- **@Injectable Decorator** - Mark classes as injectable services
- **Auto-injection** - Automatic dependency resolution in controllers and services
- **Service Registration** - Register third-party libraries for injection (bcrypt, jwt, etc.)
- **Singleton Management** - Automatic singleton pattern for services

### 4. Enhanced Server Module 🆕
- **LyraServer Class** - New unified server class with modern API
- **createServer()** - Factory function for creating server instances
- **Controller Registration** - Automatic controller discovery and registration
- **Route Decorators** - @Route, @Get, @Post, @Put, @Patch, @Delete decorators
- **Parameter Decorators** - @Param, @Body, @Query, @Headers decorators
- **Rate Limiting** - Built-in rate limiting middleware with configurable options
- **XML Parser** - XML request body parsing support
- **Static File Serving** - Built-in middleware for serving static assets

### 5. ORM System
- **Entity Management** - Decorator-based entity definitions with `@Table()` and `@Column()`
- **Repository Pattern** - Enhanced base `Repository<T>` class with DI support
- **Query Builder** - Improved query builder with additional methods and better type safety
- **Database Abstraction** - Connection management and query execution for MySQL/MariaDB

### 6. CLI Tool (Maestro)
- **Interactive Code Generation** - Entities, controllers, repositories, routes, and jobs
- **Database Management** - Database creation, migration generation, and execution
- **Backup & Restore** - Database backup, restore, and cleanup commands 🆕
- **Migration Tools** - Squash, rollback, refresh, and fresh commands 🆕
- **Project Introspection** - Commands to list entities, controllers, routes, migrations, and schedulers
- **Fixture Management** - Enhanced fixture loading with dependencies

### 7. Configuration System
- **YAML Configuration** - Support for structured configuration files
- **Environment Variables** - Enhanced environment variable interpolation
- **Config Loader** - Runtime access to configuration via `Config` class
- **Multi-file Support** - Separate configs for database, security, routing, and parameters
- **Type Safety** - Improved TypeScript types for configuration values

### 8. Authentication & Authorization
- **JWT Authentication** - Token generation and validation
- **Role-Based Access Control (RBAC)** - Route protection based on user roles
- **Role Hierarchy** - Automatic permission inheritance between roles
- **Configuration-Driven** - Access control rules defined in YAML
- **Enhanced Security** - Better JWT validation and error handling

### 9. Middleware
- **Access Control Middleware** - Automatic route protection based on configuration
- **Error Handler** - Enhanced error handler with better error formatting
- **HTTP Request Middleware** - Improved request logging with more details
- **Built-in Validators** - Email, password, and username validation
- **Rate Limiting** - Configurable rate limiting middleware 🆕

### 10. Type System
- **Request Types** - `AuthenticatedRequest<T>` for authenticated routes
- **ORM Types** - Column types, entity metadata, and repository interfaces
- **Config Types** - Typed access to configuration values
- **Routing Types** - Route definitions and controller signatures
- **Decorator Metadata** - New types for decorator metadata 🆕
- **Server Types** - Comprehensive type definitions for server components 🆕
- **DI Types** - Type definitions for dependency injection system 🆕
- **Scheduler Types** - Type definitions for job scheduling 🆕

### 11. Error Handling
- **HTTP Exceptions** - Pre-built exception classes for common HTTP errors
  - `NotFoundException`
  - `BadRequestException`
  - `UnauthorizedException`
  - `ForbiddenException`
- **HTTP Status Codes** - Standardized status code constants
- **Error Handler Middleware** - Automatic exception-to-response conversion

### 12. Email Integration
- **Mailer Service** - Nodemailer integration
- **Mail Class** - Enhanced Mail class with more options
- **Transporter** - Improved SMTP configuration and connection management
- **Template Support** - Integration with SSR system for email templates 🆕

### 13. Utilities
- **Validator** - Email, password, and username validation
- **Console Logging** - Colored console output with `LyraConsole`
- **Module Loaders** - Dynamic loading of user modules (entities, controllers, fixtures, jobs)
- **Data Formatters** - Data transformation and cleaning utilities

## Installation

`@lyra-js/core` is typically installed automatically when creating a new LyraJS project:

```bash
npm create lyrajs
```

For manual installation in an existing project:

```bash
npm install @lyra-js/core
```

## Usage

For complete usage documentation, tutorials, and examples, please refer to:

- **[Official Documentation](https://lyrajs.dev)** - Complete guides and API reference
- **[Main Repository](https://github.com/devway-eu/lyrajs)** - Framework overview and quick start
- **[Template Repository](https://github.com/devway-eu/lyrajs-template)** - Example project structure

## Contributing

We welcome contributions to `@lyra-js/core`! Here's how you can help:

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
   npm link @lyra-js/core
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
│   │   ├── commands/     # Individual CLI commands (including new v2 commands)
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
│   ├── logger/           # Logging system
│   ├── mailer/           # Email integration with template support
│   ├── middlewares/      # Express middleware
│   │   ├── auth/         # Authentication middleware
│   │   ├── error/        # Error handler
│   │   └── http/         # HTTP request middleware
│   ├── orm/              # ORM system
│   │   ├── decorator/    # @Table and @Column decorators
│   │   ├── types/        # ORM type definitions
│   │   ├── Entity.ts     # Base entity class
│   │   ├── Repository.ts # Enhanced repository with DI support
│   │   ├── QueryBuilder.ts
│   │   └── Database.ts   # Database connection
│   ├── scheduler/        # 🆕 Job scheduling system
│   │   ├── decorators/   # @Job and @Schedule decorators
│   │   ├── types/        # Scheduler type definitions
│   │   ├── Job.ts        # Base job class
│   │   ├── Scheduler.ts  # Scheduler manager
│   │   └── CronParser.ts # Cron expression parser
│   ├── security/         # Security utilities
│   ├── server/           # 🆕 Enhanced server module
│   │   ├── decorators/   # Route and parameter decorators
│   │   ├── middlewares/  # Server-specific middleware
│   │   ├── Container.ts  # Service container
│   │   ├── Controller.ts # Base controller class
│   │   ├── DIContainer.ts # Dependency injection container
│   │   ├── LyraServer.ts # Main server class
│   │   ├── Router.ts     # Enhanced router
│   │   └── Service.ts    # Base service class
│   ├── ssr/              # 🆕 Server-side rendering
│   │   ├── engines/      # Template engines (JSX, etc.)
│   │   ├── TemplateEngine.ts
│   │   └── TemplateRenderer.ts
│   ├── types/            # TypeScript type definitions
│   ├── validator/        # Validation utilities
│   └── index.ts          # Main exports
├── bin/
│   └── maestro.js        # CLI entry point
├── dist/                 # Compiled JavaScript
├── package.json
├── tsconfig.json
├── CHANGELOG.md          # 🆕 Version history
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
- **npm Package**: [npmjs.com/package/@lyra-js/core](https://www.npmjs.com/package/@lyra-js/core)
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