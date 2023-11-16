const getPrismaErrorMessage = (message: string) => {
  if (message.includes('Unique')) {
    const match = message.match(/fields: \(`([^`]+)`\)/)
    if (match && match.length > 1) {
      const extractedName = match[1]
      return `${extractedName.charAt(0).toUpperCase() + extractedName.slice(1)} exists`
    }
  }
  return message
}

export const getErrorMessage = (error: any) => {
  if (!error) return null
  if (typeof error === 'string') return error
  if ('message' in error && typeof error.message === 'string') return error.message
  if ('error' in error && typeof error.error === 'string') return error.error
  if ('data' in error && typeof error.data === 'string') return error.data
  if ('data' in error && typeof error.data === 'object') {
    if ('message' in error.data) return getPrismaErrorMessage(error.data.message)
    const url = (error?.data && 'url' in error.data && error.data.url as string) || null
    return url && new URL(url).searchParams.get('error')
  }
  return 'Error'
}

export default getErrorMessage
