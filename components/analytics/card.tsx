import React, {useState} from "react";
import {UnverifiedCards} from "../dashboard/unverfied-card";

import {useRole} from "../ui/Context/UserContext";

import MetricCard from "../matric-card";
import AdminCard from "./admin-card";
import {UserCard} from "./user-card";
import CardCreatedOverview from "./card-created-overview";

export default function Card() {
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
          label="Trust Score"
          icon={
            <div className=" p-2 rounded-full flex items-center justify-center">
              <img src="/card-icon.png" alt="copy" />
            </div>
          }
        />
        <MetricCard
          value="3/11"
          label="Team Rank"
          icon={
            <div className=" p-2 rounded-full  flex items-center justify-center">
              <img src="/card-rank.png" alt="copy" />
            </div>
          }
        />
        <MetricCard
          value="82%"
          label="Card Goal Achieved"
          icon={
            <div className=" p-2 rounded-full">
              <img src="/card-score.png" alt="copy" />
            </div>
          }
        />
      </div>
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <CardCreatedOverview />

        <div className="w-full lg:w-1/3">
          <UnverifiedCards cards={[]} />
        </div>
      </div>

      {(roleAccess === "admin" || roleAccess === "owner") && <AdminCard />}

      {roleAccess === "user" && <UserCard />}
    </div>
  );
}
