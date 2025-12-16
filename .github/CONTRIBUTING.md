# Contributing to LyraJS Core

Thank you for your interest in contributing to LyraJS Core! 🎉

We welcome contributions of all kinds: bug fixes, new features, documentation improvements, and more.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Guidelines](#coding-guidelines)
- [Commit Message Convention](#commit-message-convention)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

Please be respectful, constructive, and professional in all interactions. We're building a welcoming community for everyone.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/lyrajs-core.git
   cd lyrajs-core
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/devway-eu/lyrajs-core.git
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- MySQL 8.0 or MariaDB 10.11 (for testing database features)
- Git

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix
```

### Project Structure

```
lyrajs-core/
├── src/               # Source code
│   ├── orm/          # ORM implementation
│   ├── cli/          # Maestro CLI
│   ├── auth/         # Authentication
│   └── utils/        # Utilities
├── bin/              # CLI binaries
├── dist/             # Compiled output (generated)
├── __tests__/        # Test files
└── docs/             # Documentation
```

## How to Contribute

### Reporting Bugs

Use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.yml) and include:

- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS, database, etc.)
- Error logs if available
- Code sample that reproduces the issue

### Suggesting Features

Use the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.yml) and explain:

- The problem you're trying to solve
- Your proposed solution with examples
- Any alternatives you've considered
- Which component(s) would be affected

### Improving Documentation

Documentation improvements are always welcome! This includes:

- Fixing typos or clarifying explanations
- Adding examples
- Improving API documentation
- Writing guides or tutorials

## Pull Request Process

### Before Submitting

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run the full test suite**:
   ```bash
   npm test
   ```

3. **Lint your code**:
   ```bash
   npm run lint
   ```

4. **Build the project**:
   ```bash
   npm run build
   ```

### Submitting the PR

1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** on GitHub

3. **Fill out the PR template** completely

4. **Sign the CLA**: You'll be prompted automatically on your first PR

### After Submitting

- Respond to review comments
- Make requested changes
- Keep your PR updated with main branch
- Be patient - reviews may take a few days

## Coding Guidelines

### TypeScript Style

- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Avoid `any` type - use `unknown` if needed

### Code Organization

- One class/interface per file
- Group related functionality together
- Keep functions small and focused
- Use dependency injection for better testability

### Example Code Style

```typescript
/**
 * Finds a user by their email address.
 *
 * @param email - The email address to search for
 * @returns The user entity or null if not found
 * @throws {ValidationError} If email format is invalid
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email format');
  }

  return userRepository.findOneBy({ email });
}
```

### Naming Conventions

- **Classes**: PascalCase (`UserRepository`, `QueryBuilder`)
- **Functions/Methods**: camelCase (`findById`, `createMigration`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Interfaces**: PascalCase with 'I' prefix optional (`User` or `IUser`)
- **Type Aliases**: PascalCase (`EntityConstructor`)

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring (no functional changes)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, build, etc.)
- `ci`: CI/CD changes

### Scopes

- `orm`: ORM-related changes
- `cli`: Maestro CLI changes
- `auth`: Authentication changes
- `migration`: Database migration changes
- `repo`: Repository pattern changes
- `query`: QueryBuilder changes

### Examples

```bash
feat(cli): add support for TypeScript project generation

Add --typescript flag to maestro CLI for generating projects
with TypeScript configuration out of the box.

Fixes #123
```

```bash
fix(orm): resolve N+1 query issue in relationship loading

Implement eager loading for one-to-many relationships to prevent
multiple database queries when accessing related entities.

BREAKING CHANGE: Relationship loading API changed from lazy to eager by default.
Migration guide: Set {lazy: true} option to preserve old behavior.
```

## Testing

### Writing Tests

- Write tests for all new features
- Write tests for bug fixes to prevent regressions
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### Test Structure

```typescript
describe('UserRepository', () => {
  describe('findById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = 1;
      const expectedUser = new User({ id: userId, email: 'test@example.com' });

      // Act
      const result = await userRepository.findById(userId);

      // Assert
      expect(result).toEqual(expectedUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const nonExistentId = 999;

      // Act
      const result = await userRepository.findById(nonExistentId);

      // Assert
      expect(result).toBeNull();
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- UserRepository.test.ts

# Run tests with coverage
npm test -- --coverage
```

## Documentation

### Code Documentation

- Add JSDoc comments to all public APIs
- Include parameter descriptions
- Document return types
- Provide usage examples
- Note any side effects or important behaviors

### README Updates

If your change affects how users interact with LyraJS:

- Update README.md
- Add examples
- Update installation/setup instructions if needed

### API Documentation

For new features or API changes:

- Update TypeScript type definitions
- Add examples to docs/
- Update migration guides for breaking changes

## Community

### Getting Help

- **Documentation**: https://lyrajs.dev/docs
- **GitHub Discussions**: https://github.com/devway-eu/lyrajs-core/discussions
- **Email**: matthieu@dev-way.eu

### Asking Questions

Before opening an issue:

1. Check existing issues and discussions
2. Review the documentation
3. Search Stack Overflow for similar questions

### Staying Updated

- Watch the repository for updates
- Follow releases for new versions
- Join discussions about new features

## Recognition

Contributors are automatically added to [CONTRIBUTORS.md](../CONTRIBUTORS.md) when their PR is merged.

## License

By contributing to LyraJS Core, you agree to the terms in our [CLA](../CLA.md). Your contributions will be licensed under the GPL-3.0 License.

---

**Questions?** Open a [discussion](https://github.com/devway-eu/lyrajs-core/discussions) or contact matthieu@dev-way.eu

Thank you for contributing to LyraJS! 🚀
