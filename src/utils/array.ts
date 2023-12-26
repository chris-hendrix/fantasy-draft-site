export const getUnique = <T>(
  array: T[],
  propertySelector: ((item: T) => any) | undefined = undefined
): T[] => {
  const seen = new Set<any>()
  const defaultPropertySelector = (item: T) => item

  return array.filter((item) => {
    const key = propertySelector ? propertySelector(item) : defaultPropertySelector(item)
    if (!seen.has(key)) {
      seen.add(key)
      return true
    }
    return false
  })
}

export const getMax = <T>(
  array: T[],
  propertySelector?: T extends number | string ? never : (item: T) => number | string
): any => {
  if (array.length === 0) return undefined

  const defaultPropertySelector = (item: T) => (propertySelector
    ? propertySelector(item)
    : item) as T

  const maxObject = array.reduce((max, current) => {
    const maxPropertyValue = propertySelector ? propertySelector(max) : defaultPropertySelector(max)
    const currentPropertyValue = propertySelector
      ? propertySelector(current)
      : defaultPropertySelector(current)
    return currentPropertyValue > maxPropertyValue ? current : max
  })

  return defaultPropertySelector(maxObject)
}
