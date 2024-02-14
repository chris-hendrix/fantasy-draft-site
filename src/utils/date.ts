export const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions = {}) => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  const mergedOptions = { ...defaultOptions, ...options }
  const formattedDate = new Date(dateString).toLocaleDateString('en-US', mergedOptions)
  return formattedDate
}
export const toLocaleISOString = (date: Date): string => {
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - (offset * 60 * 1000))
  return localDate.toISOString().slice(0, 16)
}
