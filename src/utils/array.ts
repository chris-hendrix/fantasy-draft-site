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

export const getItemsInEqualColumns = <T>(items: T[], numCols: number): T[][] => {
  // remainder values should be added to the first column(s)
  const colSize = Math.floor(items.length / numCols)
  const remainder = items.length % numCols
  const sizes = Array.from({ length: numCols }).map((_, i) => colSize + Number(i < remainder))

  // get the start and end item index for each column
  const indices = sizes.reduce((acc, size) => {
    const start = acc.length > 0 ? acc[acc.length - 1].end + 1 : 0
    const end = start + size - 1
    acc.push({ start, end })
    return acc
  }, [] as { start: number; end: number }[])

  // add the items to the columns
  return indices.map(({ start, end }) => items.slice(start, end + 1))
}

interface TopValueOptions {
  sortOrder?: 'asc' | 'desc';
  count?: number;
}
type GetValueFunction<T> = (item: T) => number

export const getTopValues = <T>(
  list: T[],
  getValue: GetValueFunction<T>,
  options: TopValueOptions = {}
): number[] => {
  const { sortOrder = 'desc', count = 3 } = options
  if (!list || list.length === 0) return []
  const uniqueValues = Array.from(new Set(list.map(getValue)))
  uniqueValues.sort((a, b) => (sortOrder === 'asc' ? a - b : b - a))
  return uniqueValues.slice(0, count)
}
