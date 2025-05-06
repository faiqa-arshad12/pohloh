import React from 'react';

interface TableProps<T> {
  columns: { Header: string; accessor: keyof T | string }[];
  data: T[];
  renderCell?: (column: string, row: T) => React.ReactNode;
  renderActions?: (row: T) => React.ReactNode;
  tableClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  cellClassName?: string;
  // New props for pagination and filtering
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const Table = <T,>({ 
  columns, 
  data, 
  renderCell, 
  renderActions,
  tableClassName = '', 
  headerClassName = '', 
  bodyClassName = '', 
  cellClassName = '',
  filterValue,
  onFilterChange,
  currentPage,
  totalPages,
  onPageChange
}: TableProps<T>) => {


  const filteredData = filterValue
    ? data.filter((row) =>
        columns.some((column) => {
          const value = row[column.accessor as keyof T];
          return value?.toString().toLowerCase().includes(filterValue.toLowerCase());
        })
      )
    : data;

    // console.log("filterData",filteredData)
  return (
    <div>
      {/* Filter Input */}
      {onFilterChange && (
  <div className="mb-4">
    <input
      type="text"
      placeholder="Filter..."
      value={filterValue ?? ''}
      onChange={(e) => onFilterChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hidden"
    />
  </div>
)}
      {/* Pagination Controls */}
      {(currentPage !== undefined && totalPages !== undefined && onPageChange) && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2 items-center">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="mx-2 text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Table */}
      <div className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]">
        <table className={`${tableClassName} min-w-full`}>
          <thead>
            <tr className={headerClassName}>
              {columns.map((column, index) => (
                <th key={index} className={`${cellClassName} font-medium`}>
                  {column.Header}
                </th>
              ))}
              {renderActions && <th className={`${cellClassName} font-medium`}>Actions</th>}
            </tr>
          </thead>
          <tbody className={bodyClassName}>
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, colIndex) => (
                 <td key={colIndex} className={cellClassName}>
                 {renderCell
                   ? renderCell(column.accessor as string, row)
                   : (row[column.accessor as keyof T] as React.ReactNode) // Type casting here for safe access
                 }
               </td>
                ))}
                {renderActions && (
                  <td className={cellClassName}>
                    {renderActions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;