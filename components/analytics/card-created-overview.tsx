"use client";

import {useState, useEffect} from "react";
import {getMonthlyKnowledgeCardStats} from "./analytic.service";
import {useUserHook} from "@/hooks/useUser";
import ReusableBarChart from "./BarAnalyticsChart";
import {generateChartData} from "../../utils/char-helper";
import {useRole} from "../ui/Context/UserContext";

const CardCreatedOverview = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const {userData} = useUserHook();
  const {roleAccess} = useRole();

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    setStartDate(thirtyDaysAgo);
    setEndDate(today);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.id) return;
      if (roleAccess === "admin" && !userData?.team_id) {
        setChartData(generateChartData([], "count"));
        return;
      }
      setIsLoadingData(true);
      try {
        const response = await getMonthlyKnowledgeCardStats(userData.id);
        if (response && response.success && response.data) {
          setChartData(generateChartData(response.data, "count"));
        } else {
          setChartData(generateChartData([], "count"));
        }
      } catch (error) {
        setChartData(generateChartData([], "count"));
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [userData, roleAccess]);

  return (
    <ReusableBarChart
      chartData={chartData}
      isLoading={isLoadingData}
      title="Cards Created Overview"
      tooltipSuffix="cards"
      height="h-100"
      isCard
    />
  );
};

export default CardCreatedOverview;
