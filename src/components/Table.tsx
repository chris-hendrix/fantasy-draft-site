import React from 'react'

export interface TableColumn<T> {
  name?: string;
  renderedValue?: (rowData: T) => React.ReactNode;
  value?: (rowData: T) => string | number | null;
}

interface Props<T> {
  columns: TableColumn<T>[];
  data: T[];
}

const Table = <T extends {}>({ columns, data }: Props<T>) => {
  const renderColumn = (row: T, column: TableColumn<T>) => {
    if (column.renderedValue) return column.renderedValue(row)
    if (column.value) return column.value(row)
    return ''
  }
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 1 ? 'hover' : ''}>
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
