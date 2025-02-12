const defaultOptions = {
  minLength: 8,
  minLowercase: 1,
  minUppercase: 1,
  minNumbers: 1,
  minSymbols: 1,
  returnScore: false,
  pointsPerUnique: 1,
  pointsPerRepeat: 0.5,
  pointsForContainingLower: 10,
  pointsForContainingUpper: 10,
  pointsForContainingNumber: 10,
  pointsForContainingSymbol: 10,
}

export const generateStrongPassword = (options = defaultOptions) => {
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const specialChars = "!@#$%^&*()-_=+[]{}|;:'\",.<>?/"

  const allChars = upperCase + lowerCase + numbers + specialChars

  let password = ''
  const getRandomChar = (chars: string) => chars[Math.floor(Math.random() * chars.length)]

  // Ensure at least one of each required character type
  for (let i = 0; i < options.minUppercase; i += 1) password += getRandomChar(upperCase)
  for (let i = 0; i < options.minLowercase; i += 1) password += getRandomChar(lowerCase)
  for (let i = 0; i < options.minNumbers; i += 1) password += getRandomChar(numbers)
  for (let i = 0; i < options.minSymbols; i += 1) password += getRandomChar(specialChars)

  // Fill the rest of the password with random characters
  for (let i = password.length; i < options.minLength; i += 1) {
    password += getRandomChar(allChars)
  }

  // Shuffle the password to avoid predictable patterns
  return password.split('').sort(() => Math.random() - 0.5).join('')
}
