import React from "react";
import Table from "../ui/table";
import {Button} from "../ui/button";

import {Icon} from "@iconify/react/dist/iconify.js";

const AdminCard = () => {
  interface UnansweredSearch {
    term: string;
    frequency: string;
  }

  const columnsUnansweredSearch = [
    {Header: "Search Terms", accessor: "term"},
    {Header: "Search Frequency", accessor: "frequency"},
  ];

  const dataUnansweredSearch: UnansweredSearch[] = [
    {term: "Sick Leave Policy", frequency: "Sick Leave Policy"},
    {term: "Sick Leave Policy", frequency: "Sick Leave Policy"},
    {term: "Sick Leave Policy", frequency: "Sick Leave Policy"},
    {term: "Sick Leave Policy", frequency: "Sick Leave Policy"},
    {term: "Sick Leave Policy", frequency: "Sick Leave Policy"},
    {term: "Sick Leave Policy", frequency: "Sick Leave Policy"},
    {term: "Sick Leave Policy", frequency: "Sick Leave Policy"},
    {term: "Sick Leave Policy", frequency: "Sick Leave Policy"},
    {term: "Sick Leave Policy", frequency: "Sick Leave Policy"},
  ];
  return (
    <div className="">
      {/* Unanswered Searches Card */}
      <div className="bg-[#1c1c1c] text-white rounded-[30px] p-10 shadow-lg w-full mb-6">
        <div className="flex justify-between mb-4 items-center">
          <h3 className="font-urbanist font-medium text-[24px] leading-[100%] tracking-[0%]">
            Unanswered Searches
          </h3>
          <Button className="w-[52px] h-[50px] bg-[#333333] hover:bg-[#333333] rounded-lg border  px-2 py-[9px] flex items-center justify-center gap-[10px] cursor-pointer">
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
          <div className="w-full">
            <Table
              columns={columnsUnansweredSearch}
              data={dataUnansweredSearch}
              renderActions={() => (
                <button className="text-[#F9DB6F] font-medium hover:text-[#F9DB6F] transition-colors px-3 py-1.5">
                  + Create Card
                </button>
              )}
              tableClassName="w-full text-sm"
              headerClassName="bg-[#F9DB6F] text-black text-left font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
              bodyClassName="divide-y divide-gray-700 w-[171px] h-[68px]"
              cellClassName="py-2 px-4 border-t border-[#E0EAF5] relative w-[171px] h-[68px] overflow-visible font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
            />
          </div>
        </div>
      </div>

      {/* Leaderboard Card */}
    </div>
  );
};

export default AdminCard;
