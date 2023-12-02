export const csvToObjectArray = (csvString: string): object[] => {
  const rows = csvString.split('\n')
  const header = rows[0].split(',')

  const data: object[] = []

  rows.slice(1).forEach((row) => {
    const values = row.split(',')
    if (values.length === header.length) {
      const rowObject: { [key: string]: string } = {}
      header.forEach((columnName, index) => {
        rowObject[columnName] = values[index]
      })
      data.push(rowObject)
    }
  })

  return data
}
