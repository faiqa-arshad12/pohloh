import React, {useEffect, useState} from "react";


import TutorScoreCard from "./tutor-score";
import {CompletedLearningPaths} from "./completed-path";
import CategoriesScore from "./categories-score";
import StrengthWeekness from "./strength-weekness";
import MetricCard from "@/components/matric-card";
import {Flame} from "lucide-react";
import {useRole} from "@/components/ui/Context/UserContext";
import AdminTutorAnalyticGraph from "./tutor-analytic-graph";

export default function TutorAnalytics({id}: {id?: string | null}) {

  const {roleAccess} = useRole();


  return (
    <div className="">
      {/* <AnalyticsDashboard/> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          value="08"
          label="Learning Paths Completed"
          icon={
            <div className="">
              <img src="/check-icon.png" alt="check" />
            </div>
          }
        />

        <MetricCard
          value="160"
          label="Total Questions Answered"
          icon={
            <div className="">
              <img src="/total_question.png" alt="questions" />
            </div>
          }
        />
        {roleAccess !== "user" ? (
          <MetricCard
            value="3/11"
            label="Team Rank"
            icon={
              <div className="">
                <img src="/rank.png" alt="rank" />
              </div>
            }
          />
        ) : (
          <MetricCard
            value="#14"
            label="Leaderboard"
            icon={
              <div className="">
                <img src="/goal.png" alt="goal" />
              </div>
            }
          />
        )}
        <MetricCard
          value="82%"
          label="Daily Goal Achieved"
          icon={
            <div className="bg-[#6B91D933] p-2 rounded-full">
              <Flame className="text-[#EFBE0F] w-10 h-10" />
            </div>
          }
        />
      </div>
      {/* Top Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {/* Overall Tutor Score Card */}
        <TutorScoreCard />

        {/* Tutor Analytics Card */}
      <AdminTutorAnalyticGraph/>
      </div>

      {/* Bottom Section Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Completed Learning Paths */}
        <div className="w-full max-w-2xl">
          <CompletedLearningPaths />
        </div>

        {/* Insights Section */}
        <div className="w-full">
          <div className="bg-[#1c1c1c] rounded-2xl p-6 shadow-lg">


            {/* Category Scores */}
            <CategoriesScore />

            {/* Strengths & Opportunities */}
            <StrengthWeekness />
          </div>
        </div>
      </div>
    </div>
  );
}
