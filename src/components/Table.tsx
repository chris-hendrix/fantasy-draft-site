import React, { useState } from 'react'

export interface TableColumn<T> {
  header?: string | React.ReactNode;
  renderedValue?: (rowData: T) => React.ReactNode;
  value?: (rowData: T) => string | number | null | undefined;
  hidden?: boolean;
  sort?: (a: T, b: T) => number; // Sort function for the column
}

interface Props<T> {
  columns: TableColumn<T>[];
  data: T[];
  xs?: boolean;
  maxItemsPerPage?: number;
  minHeight?: string
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

const Table = <T extends {}>({ columns, data, xs = false, maxItemsPerPage = 50, minHeight = '600px' }: Props<T>) => {
  const [currentPage, setCurrentPage] = useState(1)

  const [sortState, setSortState] = useState<{ column: number; direction: 'asc' | 'desc' | null }>({
    column: -1,
    direction: 'asc',
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

  let sortedData = data ? [...data] : []
  if (sortState.column !== -1) {
    const sortFunction = columns[sortState.column].sort || defaultSort
    sortedData = sortedData?.sort(sortFunction)
    if (sortState.direction === 'desc') {
      sortedData?.reverse()
    }
  }

  const itemsPerPage = Math.min(maxItemsPerPage, data.length)
  const totalPages = data && Math.ceil(data.length / Math.min(itemsPerPage, data.length))
  const visibleColumns = columns.filter((c) => !c.hidden)
  const start = (currentPage - 1) * itemsPerPage
  const end = start + itemsPerPage
  const visibleData = sortedData && sortedData.slice(start, end)

  const handleColumnClick = (index: number) => {
    if (sortState.column === index) {
      // same column is clicked
      if (sortState.direction === 'asc') setSortState({ column: index, direction: 'desc', })
      if (sortState.direction === 'desc') setSortState({ column: -1, direction: null, })
    } else {
      // different column is clicked
      setSortState({ column: index, direction: 'asc', })
    }
  }

  return (
    <div className="overflow-x-auto w-full" style={{ minHeight }}>
      <table className={`table-zebra table${xs ? ' table-xs' : ''}`}>
        <thead>
          <tr>
            {visibleColumns.map((column, index) => (
              <th
                key={index}
                onClick={() => handleColumnClick(index)}
                style={{ cursor: 'pointer' }}
              >
                {column.header}
                {sortState.column === index && (
                  <span>
                    {sortState.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
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
      {visibleData && totalPages > 1 && (
        <div className="flex justify-end mt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}

export default Table
