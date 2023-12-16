export const getUnique = <T>(
  array: T[],
  iteratee: ((item: T) => any) | undefined = undefined
): T[] => {
  const seen = new Set<any>()
  const defaultIteratee = (item: T) => item

  return array.filter((item) => {
    const key = iteratee ? iteratee(item) : defaultIteratee(item)
    if (!seen.has(key)) {
      seen.add(key)
      return true
    }
    return false
  })
}
