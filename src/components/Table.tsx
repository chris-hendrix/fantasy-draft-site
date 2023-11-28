import React from 'react'

export interface TableColumn<T> {
  name?: string;
  renderedValue?: (rowData: T) => React.ReactNode;
  value?: (rowData: T) => string | number | null | undefined;
}

interface Props<T> {
  columns: TableColumn<T>[];
  data: T[];
  xs?: boolean
}

const Table = <T extends {}>({ columns, data, xs = false }: Props<T>) => {
  const renderColumn = (row: T, column: TableColumn<T>) => {
    if (column.renderedValue) return column.renderedValue(row)
    if (column.value) return column.value(row)
    return ''
  }
  return (
    <div className="overflow-x-auto w-full">
      <table className={`table${xs ? ' table-xs' : ''}`}>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={'hover'}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>{renderColumn(row, column)}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
