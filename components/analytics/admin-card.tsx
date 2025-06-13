import React from "react";
import Table from "../ui/table";
import Image from "next/image";
import {Button} from "../ui/button";

import {Icon} from "@iconify/react/dist/iconify.js";

const AdminCard = () => {
  interface UnansweredSearch {
    term: string;
    frequency: string;
  }
  interface LeaderboardEntry {
    name: string;
    completion: string;
    cards: string;
    engagement: string;
    rankIcon: string;
    avatarUrl: string;
  }
  const columnsLeaderboardEntry = [
    {Header: "Rank", accessor: "rankIcon"},
    {Header: "Name", accessor: "name"},
    {Header: "Completion Rate", accessor: "completion"},
    {Header: "Created Card & Verified", accessor: "cards"},
    {Header: "Engagement Level", accessor: "engagement"},
  ];

  const dataLeaderboardEntry: LeaderboardEntry[] = [
    {
      name: "John Doe",
      completion: "90%",
      cards: "12 (10 Verified)",
      engagement: "120 / 5",
      rankIcon: "winner",
      avatarUrl: "https://i.pravatar.cc/40?img=1",
    },
    {
      name: "John Doe",
      completion: "80%",
      cards: "12 (10 Verified)",
      engagement: "120 / 5",
      rankIcon: "second",
      avatarUrl: "https://i.pravatar.cc/40?img=2",
    },
    {
      name: "John Doe",
      completion: "70%",
      cards: "12 (10 Verified)",
      engagement: "120 / 5",
      rankIcon: "third",
      avatarUrl: "https://i.pravatar.cc/40?img=3",
    },
    {
      name: "John Doe",
      completion: "90%",
      cards: "12 (10 Verified)",
      engagement: "120 / 5",
      rankIcon: "winner",
      avatarUrl: "https://i.pravatar.cc/40?img=1",
    },
    {
      name: "John Doe",
      completion: "80%",
      cards: "12 (10 Verified)",
      engagement: "120 / 5",
      rankIcon: "second",
      avatarUrl: "https://i.pravatar.cc/40?img=2",
    },
    {
      name: "John Doe",
      completion: "70%",
      cards: "12 (10 Verified)",
      engagement: "120 / 5",
      rankIcon: "third",
      avatarUrl: "https://i.pravatar.cc/40?img=3",
    },
  ];
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
      <div className="bg-[#1c1c1c] text-white rounded-[30px] p-10 shadow-lg w-full">
        <div className="flex justify-between mb-4 items-center">
          <h3 className="font-urbanist font-medium text-[24px] leading-[100%] tracking-[0%]">
            Leaderboard
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
        <div className="flex flex-col justify-end items-start mb-6 gap-4">
          <div className="w-full">
            <Table
              columns={columnsLeaderboardEntry}
              data={dataLeaderboardEntry}
              renderCell={(column, row) => {
                if (column === "rankIcon") {
                  let rankText;
                  switch (row[column]) {
                    case "winner":
                      rankText = "Winner";
                      break;
                    case "second":
                      rankText = "2nd place";
                      break;
                    case "third":
                      rankText = "3rd place";
                      break;
                    default:
                      rankText = "Winner";
                  }
                  return (
                    <span className="bg-[#F9DB6F] text-black px-3 w-full  py-3 h-[23px]  rounded-full font-bold text-[10px] max-w-[100px] flex items-center gap-1">
                      <div className="flex items-center gap-1">
                        <img
                          src="/champion.png"
                          alt="Champion"
                          className="w-5 h-5 object-contain"
                        />
                        <span>{rankText}</span>
                      </div>
                    </span>
                  );
                }
                if (column === "name")
                  return (
                    <div className="flex items-center gap-3">
                      <Image
                        src={row.avatarUrl}
                        alt="avatar"
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium text-white">
                        {row.name}
                      </span>
                    </div>
                  );
                //@ts-expect-error: column error
                return row[column];
              }}
              tableClassName="w-full text-sm"
              headerClassName="bg-[#F9DB6F] text-black text-left font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
              bodyClassName="divide-y divide-gray-700 w-[171px] h-[68px]"
              cellClassName="py-2 px-4 relative w-[171px] h-[68px] overflow-visible font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0] border-t border-[#E0EAF5]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCard;
