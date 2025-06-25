"use client";

import {useEffect, useState, useCallback, useMemo} from "react";
import Table from "@/components/ui/table";

import SearchInput from "../shared/search-input";
import {useRouter} from "next/navigation";
import ArrowBack from "../shared/ArrowBack";

import {useUserHook} from "@/hooks/useUser";
import {TimePeriod} from "@/components/shared/TimeFilter";
import TableLoader from "../shared/table-loader";
import {fetchLeaningPathPerformance} from "./analytic.service";

interface LearningPathPerformanceData {
  id: string;
  title: string;
  averageScore: number;
}

export default function LearningPathsPerformanceList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState<LearningPathPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);

  const {userData} = useUserHook();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!userData) return;
        const response = await fetchLeaningPathPerformance(userData?.id);
        if (response?.success && response?.path?.all) {
          setData(response.path.all);
        } else {
          setData([]);
        }
      } catch (err) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userData]);

  // Filtered data by search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(
      (row) =>
        row.title.toLowerCase().includes(query) ||
        row.averageScore.toString().includes(query)
    );
  }, [data, searchQuery]);

  // Table columns
  const columns = [
    {Header: "Learning Paths", accessor: "title"},
    {Header: "Overall Score", accessor: "averageScore"},
    {Header: "Status Label", accessor: "statusLabel"},
  ];

  // Add statusLabel to data for rendering
  const dataWithStatus = useMemo(
    () =>
      filteredData.map((row) => ({
        ...row,
        statusLabel: row.averageScore >= 50 ? "High" : "Low",
      })),
    [filteredData]
  );

  // Render cell
  const renderCell = (
    column: string,
    row: LearningPathPerformanceData & {statusLabel: string}
  ) => {
    if (column === "averageScore") {
      return `${row.averageScore}%`;
    }
    if (column === "title") {
      return row.title;
    }
    if (column === "statusLabel") {
      return row.statusLabel;
    }
    return "-";
  };

  return (
    <div className="text-white py-4">
      <div className="flex mb-6 md:mb-8 justify-between">
        <div className="flex flex-wrap items-center gap-4 sm:gap-7">
          <ArrowBack link={`/analytics`} />
          <h1 className="font-urbanist font-medium text-2xl sm:text-3xl leading-tight">
            Top & Worst Learning Paths
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            onChange={setSearchQuery}
            placeholder="Search by title or score..."
          />
        </div>
      </div>
      <div className="overflow-hidden">
        {loading ? (
          <TableLoader />
        ) : dataWithStatus.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400">
              {searchQuery
                ? "No learning paths match your search criteria"
                : "No learning paths found"}
            </p>
          </div>
        ) : (
          <Table
            columns={columns}
            data={dataWithStatus}
            filterValue={searchQuery}
            renderCell={renderCell}
            tableClassName="w-full border-collapse"
            headerClassName="bg-[#f0d568] text-black justify-between text-left text-sm font-medium px-4 py-3 border-b border-gray-800"
            cellClassName="px-4 py-3 border-t border-[#E0EAF5] text-left font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0] h-[68px]"
            bodyClassName="divide-y divide-gray-800 justify-between text-sm font-normal"
          />
        )}
      </div>
    </div>
  );
}
