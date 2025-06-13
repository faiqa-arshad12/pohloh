import React, {useState} from "react";
import {UnverifiedCards} from "../dashboard/unverfied-card";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {useRole} from "../ui/Context/UserContext";

import MetricCard from "../matric-card";
import AdminCard from "./admin-card";
import {UserCard} from "./user-card";

export default function Card() {
  const [interval, setInterval] = useState("monthly");
  const {roleAccess} = useRole();

  return (
    <div className="">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 ">
        <MetricCard
          value="08"
          label="Cards Created"
          icon={
            <div className="p-2 rounded-full  flex items-center justify-center">
              <img src="/copy-icon.png" alt="copy" />
            </div>
          }
        />

        <MetricCard
          value="160"
          label="Total Cards Uses"
          icon={
            <div className=" p-2 rounded-full flex items-center justify-center">
              <img src="/card-icon.png" alt="copy" />
            </div>
          }
        />
        <MetricCard
          value="3/11"
          label="Card Creation Rank"
          icon={
            <div className=" p-2 rounded-full  flex items-center justify-center">
              <img src="/card-rank.png" alt="copy" />
            </div>
          }
        />
        <MetricCard
          value="82%"
          label="Daily Goal Achieved"
          icon={
            <div className=" p-2 rounded-full">
              <img src="/card-score.png" alt="copy" />
            </div>
          }
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="bg-[#191919] rounded-[30px] p-4 pt-8 lg:w-2/3 w-full">
          <div className="flex flex-col sm:flex-row justify-between mb-4">
            <h3 className="font-urbanist font-medium text-[24px] px-2 leading-[100%] tracking-[0%]">
              Cards Created on Weekly Basis
            </h3>
            <div className="flex items-center gap-2">
              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger
                  className="bg-black hover:bg-black rounded-[80px] w-[114px] text-white px-4 flex items-center gap-1 border-0"
                  style={{height: "40px"}}
                >
                  <SelectValue placeholder="Monthly" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white dark:bg-gray-800 rounded-lg">
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="relative h-48 sm:h-56 lg:h-64">
            <Image
              src="/Frame 5.png"
              alt="Analytics Chart"
              fill
              className="rounded-lg object-contain"
              quality={100}
              priority
            />
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <UnverifiedCards cards={[]} />
        </div>
      </div>

      {(roleAccess === "admin" || roleAccess === "owner") && <AdminCard />}

      {roleAccess === "user" && <UserCard />}
    </div>
  );
}
