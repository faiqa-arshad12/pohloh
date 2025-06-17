"use client";

import {useState, useEffect} from "react";
import type React from "react";
import Loader from "../shared/loader";
import {ArrowLeft, ArrowRight} from "lucide-react";
import { NoData } from "../shared/NoData";

interface TableProps<T> {
  columns: {Header: string; accessor: string}[];
  data: T[];
  renderCell?: (column: string, row: T) => React.ReactNode;
  renderActions?: (row: T) => React.ReactNode;
  tableClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  cellClassName?: string;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  isLoading?: boolean;
  loggedInUserId?: string;
  defaultItemsPerPage?: number;
  defaultPage?: number;
  totalItems?: number;
  onPageChange?: (page: number, itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
}

// Helper function to get nested property value using dot notation
const getNestedValue = (obj: any, path: string) => {
  return path.split(".").reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, obj);
};

// Helper function to truncate text
const truncateText = (text: string, maxLength: number = 30) => {
  if (!text) return "-";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const Table = <T,>({
  columns,
  data,
  renderCell,
  renderActions,
  tableClassName = "",
  headerClassName = "",
  bodyClassName = "",
  cellClassName = "",
  filterValue,
  onFilterChange,
  isLoading,
  loggedInUserId,
  defaultItemsPerPage,
  defaultPage = 1,
  totalItems: externalTotalItems,
  onPageChange,
  itemsPerPageOptions = [4, 10, 25, 50],
}: TableProps<T>) => {
  // Internal pagination state
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage || 4);

  // Reset to page 1 when items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  // Filter data
  const filteredData = data
    .filter((row) => {
      if (
        (loggedInUserId && (row as any).user_id === loggedInUserId) ||
        (row as any).role === "owner"
      ) {
        return false; // 👈 skip the logged-in user
      }
      return true;
    })
    .filter((row) =>
      filterValue
        ? columns.some((column) => {
            // Use getNestedValue for filtering
            const value = getNestedValue(row, column.accessor);
            return value
              ?.toString()
              .toLowerCase()
              .includes(filterValue.toLowerCase());
          })
        : true
    );

  // Calculate total items and pages
  const totalItems = externalTotalItems || filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Get current page data
  const getCurrentPageData = () => {
    // If we have external total items, assume the data is already paginated
    if (externalTotalItems) {
      return filteredData;
    }

    // Otherwise, paginate the data ourselves
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  };

  const currentPageData = getCurrentPageData();

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (onPageChange) {
      onPageChange(page, itemsPerPage);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    if (onPageChange) {
      onPageChange(1, newItemsPerPage);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Filter Input */}
      {onFilterChange && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Filter..."
            value={filterValue ?? ""}
            onChange={(e) => onFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hidden"
          />
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
              {renderActions && (
                <th className={`cursor-pointer ${cellClassName} font-medium`}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className={bodyClassName}>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (renderActions ? 1 : 0)}>
                  <div className="flex flex-row justify-center py-4 cursor-pointer">
                    <Loader size={35} />
                  </div>
                </td>
              </tr>
            ) : currentPageData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (renderActions ? 1 : 0)}
                  className="text-center text-gray-500 py-4"
                >
               <NoData/>
                </td>
              </tr>
            ) : (
              currentPageData?.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className={cellClassName}>
                      {renderCell
                        ? renderCell(column.accessor, row)
                        : truncateText(
                            getNestedValue(row, column.accessor)?.toString() ||
                              "-"
                          )}
                    </td>
                  ))}
                  {renderActions && (
                    <td className={cellClassName}>{renderActions(row)}</td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 0 && (
        <div className="flex justify-end items-center mt-4 gap-5">
          <div className="text-[18px] font-normal text-[#FFFFFF]">
            Rows per page: {itemsPerPage} &nbsp;&nbsp;{" "}
            {currentPage > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-800  border border-[#CDCDCD] rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-white cursor-pointer"
              style={{borderRadius: "8px"}}
              aria-label="Previous page"
            >
              <ArrowLeft size={20} style={{marginRight: "10px"}} />
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#F9DB6F] text-[#232D39] rounded hover:bg-[#F9DB6F] disabled:opacity-50 disabled:cursor-not-allowed flex items-center cursor-pointer"
              aria-label="Next page"
              style={{borderRadius: "8px"}}
            >
              Next
              <ArrowRight
                size={20}
                color="#232D39"
                style={{marginLeft: "10px"}}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
