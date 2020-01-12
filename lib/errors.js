class CannotReadDirectoryError extends Error {
  constructor (...params) {
    super(...params)
    this.name = 'CannotReadDirectoryError'
  }
}

class CannotGetFileStatError extends Error {
  constructor (...params) {
    super(...params)
    this.name = 'CannotGetFileStatError'
  }
}

class NotSupportedModeError extends Error {
  constructor (...params) {
    super(...params)
    this.name = 'NotSupportedModeError'
  }
}

module.exports = {
  CannotReadDirectoryError,
  CannotGetFileStatError,
  NotSupportedModeError
}
