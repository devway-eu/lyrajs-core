# Changelog

All notable changes to `@lyra-js/core` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-01-16

### Added

#### Server-Side Rendering (SSR)
- **Template Engine System** - Complete SSR framework with pluggable template engines
- **JSX/TSX Support** - Native support for JSX and TSX template rendering
- **TemplateRenderer** - High-level API for rendering templates with data
- **Template Engines** - Extensible engine architecture for multiple template formats
- **SSR Middleware Integration** - Seamless integration with the server middleware stack

#### Job Scheduler
- **Scheduler System** - Comprehensive cron-based job scheduling framework
- **@Job Decorator** - Decorator for marking classes as scheduled jobs
- **@Schedule Decorator** - Decorator for defining cron schedules on job methods
- **CronParser** - Built-in cron expression parser and validator
- **Job Management** - Start, stop, and manage scheduled jobs programmatically
- **Timezone Support** - Configure timezone for scheduled job execution
- **SchedulerHelper** - Utilities for job discovery and registration

#### Dependency Injection (DI)
- **DIContainer** - Full-featured dependency injection container
- **@Injectable Decorator** - Mark classes as injectable services
- **Container Class** - Service container management and resolution
- **Auto-injection** - Automatic dependency resolution in controllers and services
- **Service Registration** - Register third-party libraries for injection (bcrypt, jwt, etc.)
- **Singleton Management** - Automatic singleton pattern for services

#### Enhanced Server Module
- **LyraServer Class** - New unified server class with modern API
- **createServer()** - Factory function for creating server instances
- **Controller Registration** - Automatic controller discovery and registration
- **Route Decorators** - @Route, @Get, @Post, @Put, @Patch, @Delete decorators
- **Parameter Decorators** - @Param decorators
- **Service Class** - Base class for business logic services
- **Controller Base Class** - Enhanced base class for controllers with DI support

#### Additional Features
- **Rate Limiting** - Built-in rate limiting middleware with configurable options
- **XML Parser** - XML request body parsing support
- **Static File Serving** - Built-in middleware for serving static assets
- **Enhanced CORS** - Improved CORS middleware with more configuration options

#### New CLI Commands
- **maestro make:job** - Generate new job classes for the scheduler
- **maestro make:scheduler** - Generate scheduler configuration files
- **maestro show:schedulers** - List all registered schedulers and their schedules
- **maestro cleanup:backups** - Clean up old database backup files
- **maestro show:backups** - Display available database backups
- **maestro restore:backup** - Restore database from a backup file
- **maestro migration:squash** - Squash multiple migrations into a single migration file

### Changed

#### Server Architecture
- **Server Initialization** - New `createServer()` API replaces manual Express setup
- **Controller System** - Decorator-based controller registration instead of manual routing
- **Middleware Pipeline** - Enhanced middleware system with better composition
- **Configuration** - Server settings now configured via `app.setSetting()`

#### Dependency Management
- **Auto-discovery** - Controllers, repositories, and services are now auto-discovered
- **Injection Pattern** - Constructor injection replaces manual dependency instantiation
- **Service Lifecycle** - Services now managed by DI container with singleton lifecycle

#### Routing System
- **Route Declaration** - Routes defined with decorators instead of separate route files
- **Route Registration** - Automatic route registration from controller decorators
- **Parameter Binding** - Type-safe parameter extraction with decorators

#### Template System
- **View Rendering** - New SSR system replaces basic template rendering
- **Template Location** - Templates now organized in dedicated `src/templates` directory
- **Template Syntax** - Support for JSX/TSX templates with type safety

### Enhanced

#### ORM System
- **Query Builder** - Improved query builder with additional methods and better type safety
- **Repository Pattern** - Enhanced repository base class with DI support
- **Entity Management** - Better entity metadata management and reflection

#### Configuration System
- **Type Safety** - Improved TypeScript types for configuration values
- **Validation** - Better validation for configuration files
- **Environment Variables** - Enhanced environment variable interpolation

#### Mailer System
- **Mail Class** - Enhanced Mail class with more options
- **Transporter** - Improved SMTP configuration and connection management
- **Template Support** - Integration with SSR system for email templates

#### Middleware
- **Error Handling** - Enhanced error handler with better error formatting
- **Request Logging** - Improved HTTP request middleware with more details
- **Authentication** - Better JWT validation and error handling in auth middleware

#### Type System
- **Decorator Metadata** - New types for decorator metadata
- **Server Types** - Comprehensive type definitions for server components
- **DI Types** - Type definitions for dependency injection system
- **Scheduler Types** - Type definitions for job scheduling

### Removed

#### Manual Configuration
- **Manual Service Instantiation** - Services are now auto-injected via DI container
- **Manual Controller Registration** - Controllers are now auto-discovered and registered

### Migration Guide

#### From v1 to v2

See our [migration guide](https://lyrajs.dev/migration-guide/v1-to-v2).

### Breaking Changes

1. **Server Initialization**: The server initialization pattern has changed. Use `createServer()` instead of raw Express.
2. **Controller Registration**: Controllers can now use decorators for route definition.
3. **Dependency Injection**: Services and repositories are auto-injected dependencies.
4. **Route Files**: Separate route files are no longer used. Routes are defined in controllers with decorators.
5. **Service Instantiation**: Manual service instantiation is replaced by DI container.

### Deprecations

- Manual Express app creation (use `createServer()`)
- Manual route file creation (use route decorators)
- Manual service instantiation (use DI container)

---

## [1.1.3] - 2025-12-31

### Previous Version Features

- ORM System with decorators (@Table, @Column)
- Repository pattern with base Repository class
- CLI Tool (Maestro) for code generation
- Configuration management (YAML-based)
- Authentication & Authorization (JWT, RBAC)
- Middleware (access control, error handling, logging)
- HTTP Exceptions
- Email integration (Nodemailer)
- Validator utilities

---

For detailed documentation and upgrade guides, visit [lyrajs.dev](https://lyrajs.dev).
