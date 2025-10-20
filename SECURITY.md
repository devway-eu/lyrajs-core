# Security Policy

## Supported Versions

We actively support the following versions of LyraJS Core with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability within LyraJS Core, please send an email to:

**security@devway.eu**

### What to Include

Please include the following information in your report:
- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability, including how an attacker might exploit it

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Updates**: Weekly updates on progress
- **Resolution**: We aim to address critical vulnerabilities within 7 days

### Disclosure Policy

- We will coordinate with you on the timing of any public disclosure
- We appreciate responsible disclosure and will credit you in our security advisories (unless you prefer to remain anonymous)

## Security Best Practices

When using LyraJS Core in your applications, follow these security guidelines:

### JWT Configuration

**Secret Keys**
- Use JWT secrets of at least 32 characters
- Generate secrets using cryptographically secure random generators
- Never use dictionary words or predictable patterns
- Example: `openssl rand -base64 32`

**Key Management**
- Never commit secrets to version control
- Use environment variables for all secrets
- Rotate secrets regularly in production environments
- Use different secrets for access tokens and refresh tokens

**Algorithm Configuration**
- Always specify the algorithm explicitly (default: HS256)
- Ensure `JWT_ALGORITHM` is set in your `.env` file
- Verify algorithm configuration matches between signing and verification

### Database Security

**Credentials**
- Use strong database passwords (minimum 16 characters)
- Restrict database access by IP address when possible
- Never expose database credentials in error messages or logs
- Use read-only database users for read operations when applicable

**Connection Security**
- Use SSL/TLS for database connections in production
- Limit connection pool size based on your infrastructure
- Monitor for connection leaks

### Input Validation

**Controller Level**
- Always validate user input in controllers before processing
- Don't rely solely on TypeScript types for runtime validation
- Use the built-in `Validator` class for common patterns:
  - `Validator.isEmailValid(email)`
  - `Validator.isUsernameValid(username)`
  - `Validator.isPasswordValid(password)`

**QueryBuilder Considerations**
- Avoid passing user input directly to `orderBy()` or `join()` methods
- If you must use user input for column/table names, validate against a whitelist
- Use parameterized queries for all values (done automatically by WHERE clauses)

### Rate Limiting

The framework includes `express-rate-limit` as a dependency. Implement rate limiting on sensitive endpoints:

```javascript
import rateLimit from 'express-rate-limit'

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many attempts, please try again later'
})

app.use('/api/auth/sign-in', authLimiter)
```

### HTTPS and Cookie Security

**Production Requirements**
- Always use HTTPS in production environments
- Set `NODE_ENV=production` to enable secure cookies
- Consider implementing HSTS (HTTP Strict Transport Security)

**Cookie Configuration**
- Cookies are automatically configured with `httpOnly: true`
- `sameSite: "Lax"` provides CSRF protection
- `secure` flag is enabled automatically in production

### Password Security

**Built-in Protection**
- Passwords are hashed using bcrypt with 10 rounds (secure default)
- Never log or expose password fields in API responses
- Password validation requires: 10+ characters, uppercase, lowercase, digit, special character

**Recommendations**
- Consider implementing password strength meters on the client side
- Implement account lockout after multiple failed login attempts
- Consider adding 2FA support for enhanced security

### Role-Based Access Control

**Configuration**
- Define role hierarchies in `config/security.yaml`
- Use the principle of least privilege
- Regularly audit role assignments and permissions

**Implementation**
- Routes are automatically protected via `accessMiddleware`
- User roles are validated on every protected request
- Role inheritance is supported (e.g., ADMIN inherits USER permissions)

### Environment Variables

**Required Security Variables**
```bash
JWT_SECRET=your_32+_character_random_secret
JWT_SECRET_REFRESH=different_32+_character_random_secret
JWT_ALGORITHM=HS256
DB_PASSWORD=strong_database_password
```

**Best Practices**
- Never commit `.env` files to version control
- Use different secrets for development, staging, and production
- Store production secrets in secure secret management systems (AWS Secrets Manager, Azure Key Vault, etc.)
- Limit access to environment variables to necessary personnel only

## Known Security Considerations

### QueryBuilder String Parameters

The `QueryBuilder` class accepts string parameters for table and column names in methods like `orderBy()`, `join()`, and `selectFrom()`. While values in WHERE clauses are properly parameterized, column and table names are inserted directly into SQL queries.

**Mitigation**: Always validate user input before passing to these methods, or avoid using user input entirely for structural query elements.

### No Built-in Rate Limiting Middleware

While `express-rate-limit` is included as a dependency and configuration is provided, there is no built-in rate limiting middleware. Developers must implement it manually.

**Mitigation**: See the Rate Limiting section above for implementation guidance.

### Password Validation

The password validator requires a minimum of 10 characters but has no maximum length limit, which could potentially be used for DoS attacks with extremely long passwords.

**Mitigation**: Consider implementing a maximum password length (e.g., 128 characters) in your application logic.

## Security Updates and Notifications

To stay informed about security updates:

1. Watch the [LyraJS Core repository](https://github.com/devway-eu/lyrajs-core) for security advisories
2. Subscribe to security notifications on npm
3. Run `npm audit` regularly to check for vulnerable dependencies
4. Keep your LyraJS Core version up to date

## Security Audit History

- **December 2025**: Initial security audit completed before v1.0.0 release
  - JWT security verified
  - Dependency vulnerabilities resolved
  - Password protection mechanisms validated

## Contact

For security-related questions or concerns:
- **Security issues**: security@devway.eu
- **General questions**: Via GitHub discussions

---

**Thank you for helping keep LyraJS and our community safe!**
