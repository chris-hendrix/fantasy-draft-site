export const formatDate = (date: Date, options: Intl.DateTimeFormatOptions = {}) => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }

  const mergedOptions = { ...defaultOptions, ...options }
  const formattedDate = new Date(date).toLocaleDateString('en-US', mergedOptions)
  return formattedDate
}

export const formatDatetime = (date: Date, options: Intl.DateTimeFormatOptions = {}) => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }

  const mergedOptions = { ...defaultOptions, ...options }
  const formattedDate = new Date(date).toLocaleDateString('en-US', mergedOptions)
  return formattedDate
}

export const toLocaleISOString = (date: Date): string => {
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - (offset * 60 * 1000))
  return localDate.toISOString().slice(0, 16)
}
