export declare class Validator {
    static patterns: {
        date: RegExp;
        username: RegExp;
        email: RegExp;
        password: RegExp;
    };
    static isUsernameValid(username: string): boolean;
    static isEmailValid(email: string): boolean;
    static isPasswordValid(password: string): boolean;
    static isDateValid(stringDate: string): boolean;
}
