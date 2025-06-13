import {useEffect, useState, Suspense} from "react";
import {Filter} from "lucide-react";
import React from "react";
import {Button} from "../ui/button";
import TutorAnalytics from "./tutor";
import Card from "./card";
import {useRole} from "../ui/Context/UserContext";
import AdminAanalytic from "./admin-tutor";
import {useRouter, useSearchParams} from "next/navigation";

function AnalyticsContent() {
  const {roleAccess} = useRole();
  const [activeTab, setActiveTab] = useState("tutor");
  const [tutorId, setTutuorId] = useState<string | null | undefined>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams?.get("id");
    setTutuorId(id);
    if (id) {
      setActiveTab("tutor");
    }
  }, [searchParams]);

  return (
    <div className=" text-white min-h-screen">
      {/* Main Content */}
      <div className="py-6">
        {/* Main Content */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-white text-[36px] font-semibold">Analytics</h1>

            <div className="flex gap-4">
              {roleAccess !== "user" && (
                <Button className="bg-[#F9DB6F] text-black w-[52px] h-[50px] rounded-[8px] cursor-pointer">
                  <Filter size={16} />
                </Button>
              )}

              <div className="border border-[#FFFFFF] rounded-full overflow-hidden h-[56px] w-[full] px-3 flex items-center  justify-center text-center gap-2">
                <Button
                  onClick={() => setActiveTab("tutor")}
                  className={`w-[64px] h-[40px] px-3 cursor-pointer ${
                    activeTab === "tutor"
                      ? "bg-[#F9DB6F] hover:bg-[#F9DB6F] text-black rounded-[90px]"
                      : "bg-transparent hover:bg-transparent text-white"
                  }`}
                >
                  Tutor
                </Button>
                <Button
                  onClick={() => setActiveTab("Card")}
                  className={`w-[64px] h-[40px] px-3 cursor-pointer ${
                    activeTab === "Card"
                      ? "bg-[#F9DB6F] hover:bg-[#F9DB6F] text-black rounded-[90px]"
                      : "bg-transparent hover:bg-transparent text-white"
                  }`}
                >
                  Card
                </Button>
              </div>
            </div>
          </div>
        </div>

        {activeTab === "tutor" && (roleAccess == "user" || tutorId !== null) ? (
          <TutorAnalytics id={tutorId} />
        ) : activeTab === "tutor" && roleAccess !== "user" && !tutorId ? (
          <AdminAanalytic />
        ) : (
          ""
        )}

        {activeTab === "Card" && <Card />}
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
