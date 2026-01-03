/**
 * Validator class
 * Provides validation methods for common data formats
 * Uses regex patterns to validate usernames, emails, passwords, and dates
 */
export declare class Validator {
    /**
     * Regex patterns for common validation scenarios
     * - date: YYYY-MM-DD format
     * - username: Alphanumeric + underscore, min 2 chars
     * - email: Standard email format
     * - password: Min 10 chars, requires uppercase, lowercase, digit, and special char
     */
    static patterns: {
        date: RegExp;
        username: RegExp;
        email: RegExp;
        password: RegExp;
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
    static isUsernameValid(username: string): boolean;
    /**
     * Validates email format
     * Checks for standard email pattern with @ and domain
     * @param {string} email - Email address to validate
     * @returns {boolean} - True if valid email format
     * @example
     * Validator.isEmailValid('user@example.com') // true
     * Validator.isEmailValid('invalid-email') // false
     */
    static isEmailValid(email: string): boolean;
    /**
     * Validates password strength
     * Requires: minimum 10 characters, at least one uppercase, one lowercase, one digit, one special character
     * @param {string} password - Password to validate
     * @returns {boolean} - True if password meets strength requirements
     * @example
     * Validator.isPasswordValid('MyP@ssw0rd123') // true
     * Validator.isPasswordValid('weak') // false
     */
    static isPasswordValid(password: string): boolean;
    /**
     * Validates date string format
     * Checks for YYYY-MM-DD format
     * @param {string} stringDate - Date string to validate
     * @returns {boolean} - True if valid date format
     * @example
     * Validator.isDateValid('2025-01-03') // true
     * Validator.isDateValid('01/03/2025') // false
     */
    static isDateValid(stringDate: string): boolean;
}
