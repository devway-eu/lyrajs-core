/**
 * Validator class
 * Provides validation methods for common data formats
 * Uses regex patterns to validate usernames, emails, passwords, and dates
 */
export class Validator {
    /**
     * Regex patterns for common validation scenarios
     * - date: YYYY-MM-DD format
     * - username: Alphanumeric + underscore, min 2 chars
     * - email: Standard email format
     * - password: Min 10 chars, requires uppercase, lowercase, digit, and special char
     */
    static patterns = {
        date: /[1-9][0-9][0-9]{2}-([0][1-9]|[1][0-2])-([1-2][0-9]|[0][1-9]|[3][0-1])/,
        username: /^[a-zA-Z0-9_]{2,}$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,4}$/,
        password: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_])\S{10,}$/
    };
    /**
     * Validates username format
     * Allows alphanumeric characters and underscores, minimum 2 characters
     * @param {string} username - Username to validate
     * @returns {boolean} - True if valid username format
     * @example
     * Validator.isUsernameValid('john_doe') // true
     * Validator.isUsernameValid('a') // false (too short)
     */
    static isUsernameValid(username) {
        return this.patterns.username.test(username);
    }
    /**
     * Validates email format
     * Checks for standard email pattern with @ and domain
     * @param {string} email - Email address to validate
     * @returns {boolean} - True if valid email format
     * @example
     * Validator.isEmailValid('user@example.com') // true
     * Validator.isEmailValid('invalid-email') // false
     */
    static isEmailValid(email) {
        return this.patterns.email.test(email);
    }
    /**
     * Validates password strength
     * Requires: minimum 10 characters, at least one uppercase, one lowercase, one digit, one special character
     * @param {string} password - Password to validate
     * @returns {boolean} - True if password meets strength requirements
     * @example
     * Validator.isPasswordValid('MyP@ssw0rd123') // true
     * Validator.isPasswordValid('weak') // false
     */
    static isPasswordValid(password) {
        return this.patterns.password.test(password);
    }
    /**
     * Validates date string format
     * Checks for YYYY-MM-DD format
     * @param {string} stringDate - Date string to validate
     * @returns {boolean} - True if valid date format
     * @example
     * Validator.isDateValid('2025-01-03') // true
     * Validator.isDateValid('01/03/2025') // false
     */
    static isDateValid(stringDate) {
        return this.patterns.date.test(stringDate);
    }
}
//# sourceMappingURL=index.js.map