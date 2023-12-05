import React, { useState } from 'react'

export interface TableColumn<T> {
  name?: string;
  renderedValue?: (rowData: T) => React.ReactNode;
  value?: (rowData: T) => string | number | null | undefined;
  hidden?: boolean;
  sort?: (a: T, b: T) => number; // Sort function for the column
}

interface Props<T> {
  columns: TableColumn<T>[];
  data: T[];
  xs?: boolean;
  itemsPerPage?: number;
}

const Pagination = ({ currentPage, totalPages, onPageChange }: any) => (
  <div className="join">
    <button className="join-item btn btn-xs" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
      {'<<'}
    </button>
    <select
      className="join-item btn btn-xs capitalize"
      value={currentPage}
      onChange={(e) => onPageChange(Number(e.target.value))}
    >
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <option key={page} value={page}>
          {`Page ${page}`}
        </option>
      ))}
    </select>
    <button
      className="join-item btn btn-xs"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      {'>>'}
    </button>
  </div>
)

const Table = <T extends {}>({ columns, data, xs = false, itemsPerPage = 50 }: Props<T>) => {
  const [currentPage, setCurrentPage] = useState(1)

  const [sortState, setSortState] = useState<{ column: number; direction: 'asc' | 'desc' | null }>(() => {
    const defaultSortColumn = columns.findIndex((column) => !column.hidden && column.value)
    return {
      column: defaultSortColumn !== -1 ? defaultSortColumn : 0,
      direction: 'asc',
    }
  })

  const renderColumn = (row: T, column: TableColumn<T>) => {
    if (column.renderedValue) return column.renderedValue(row)
    if (column.value) return column.value(row)
    return ''
  }

  // Sorting logic
  const defaultSort: TableColumn<T>['sort'] = (a, b) => {
    const aValue = columns[sortState.column].value?.(a)
    const bValue = columns[sortState.column].value?.(b)
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return aValue - bValue
    }
    return String(aValue).localeCompare(String(bValue))
  }

  let sortedData = [...data]
  if (sortState.column !== -1) {
    const sortFunction = columns[sortState.column].sort || defaultSort
    sortedData = sortedData?.sort(sortFunction)
    if (sortState.direction === 'desc') {
      sortedData?.reverse()
    }
  }

  const totalPages = data && Math.ceil(data.length / itemsPerPage)
  const visibleColumns = columns.filter((c) => !c.hidden)
  const start = (currentPage - 1) * itemsPerPage
  const end = start + itemsPerPage
  const visibleData = sortedData && sortedData.slice(start, end)

  const handleColumnClick = (index: number) => {
    if (sortState.column === index) {
      // Same column clicked, toggle direction
      setSortState({
        column: index,
        direction: sortState.direction === 'asc' ? 'desc' : 'asc',
      })
    } else {
      // Different column clicked, set direction to 'asc'
      setSortState({
        column: index,
        direction: 'asc',
      })
    }
  }

  return (
    <div className="overflow-x-auto w-full">
      {visibleData && totalPages > 1 && (
        <div className="flex justify-end mb-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
      <table className={`table-zebra table${xs ? ' table-xs' : ''}`}>
        <thead>
          <tr>
            {visibleColumns.map((column, index) => (
              <th
                key={index}
                onClick={() => handleColumnClick(index)}
                style={{ cursor: 'pointer' }}
              >
                {column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleData?.map((row, rowIndex) => (
            <tr key={rowIndex} className={'hover'}>
              {visibleColumns.map((column, colIndex) => (
                <td key={colIndex}>{renderColumn(row, column)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
