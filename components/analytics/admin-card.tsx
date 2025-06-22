import React, {useEffect, useState} from "react";
import Table from "../ui/table";
import {Button} from "../ui/button";
import {Icon} from "@iconify/react/dist/iconify.js";
import {fetchALLSearches} from "./analytic.service";
import {SearchAnalytics} from "@/types/types";
import TableLoader from "../shared/table-loader";
import {useRouter} from "next/navigation";
import {useUserHook} from "@/hooks/useUser";
import {exportToPDF} from "@/utils/exportToPDF";

const AdminCard = () => {
  const [searchData, setSearchData] = useState<SearchAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const columnsUnansweredSearch = [
    {Header: "Search Terms", accessor: "item"},
    {Header: "Search Frequency", accessor: "search_count"},
  ];
  const {userData} = useUserHook();

  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user details to get org_id

        if (userData.org_id) {
          const response = await fetchALLSearches(userData.org_id);
          if (response.success && response.data) {
            setSearchData(response.data);
          } else {
            setError("Failed to fetch search data");
          }
        } else {
          setError("Organization ID not found");
        }
      } catch (err) {
        console.error("Error fetching search data:", err);
        setError("Failed to load search data");
      } finally {
        setLoading(false);
      }
    };

    if (userData) {
      fetchSearchData();
    }
  }, [userData]);

  const processedData = searchData.map((item: SearchAnalytics) => ({
    item: item.item,
    search_count: item.search_count,
  }));

  return (
    <div className="">
      {/* Unanswered Searches Card */}
      <div className="bg-[#1c1c1c] text-white rounded-[30px] p-10 shadow-lg w-full mb-6">
        <div className="flex justify-between mb-4 items-center">
          <h3 className="font-urbanist font-medium text-[24px] leading-[100%] tracking-[0%]">
            Unanswered Searches
          </h3>
          <Button
            className="w-[52px] h-[50px] bg-[#333333] hover:bg-[#333333] rounded-lg border px-2 py-[9px] flex items-center justify-center gap-[10px] cursor-pointer"
            onClick={() => {
              if (searchData.length > 0) {
                exportToPDF({
                  title: "Unanswered Searches",
                  filename: "unanswered-searches",
                  data: processedData,
                  type: "table",
                  columns: ["item", "search_count"],
                  headers: {
                    item: "Search Terms",
                    search_count: "Search Frequency",
                  },
                });
              }
            }}
            disabled={searchData.length === 0}
          >
            <Icon
              icon="bi:filetype-pdf"
              width="24"
              height="24"
              color="white"
              className="cursor-pointer"
            />
          </Button>
        </div>
        <div className="flex flex-col w-full items-start justify-between mb-6 gap-4">
          {loading ? (
            <TableLoader />
          ) : (
            <div className="w-full">
              {searchData.length > 0 ? (
                <Table
                  columns={columnsUnansweredSearch}
                  data={processedData}
                  renderActions={() => (
                    <button
                      className="text-[#F9DB6F] font-medium hover:text-[#F9DB6F] transition-colors px-3 py-1.5 cursor-pointer"
                      onClick={() => {
                        router.push("/knowledge-base/create-knowledge-base");
                      }}
                    >
                      + Create Card
                    </button>
                  )}
                  tableClassName="w-full text-sm"
                  headerClassName="bg-[#F9DB6F] text-black text-left font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
                  bodyClassName="divide-y divide-gray-700 w-[171px] h-[68px]"
                  cellClassName="py-2 px-4 border-t border-[#E0EAF5] relative w-[171px] h-[68px] overflow-visible font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
                />
              ) : (
                <div className="text-center py-8 text-gray-400">
                  No unanswered searches found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCard;
