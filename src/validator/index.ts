export class Validator {
  static patterns = {
    date: /[1-9][0-9][0-9]{2}-([0][1-9]|[1][0-2])-([1-2][0-9]|[0][1-9]|[3][0-1])/,
    username: /^[a-zA-Z0-9_]{2,}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,4}$/,
    password: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_])\S{10,}$/
  }

  static isUsernameValid(username: string) {
    return this.patterns.username.test(username)
  }

  static isEmailValid(email: string) {
    return this.patterns.email.test(email)
  }

  static isPasswordValid(password: string) {
    return this.patterns.password.test(password)
  }

  static isDateValid(stringDate: string) {
    return this.patterns.date.test(stringDate)
  }
}
