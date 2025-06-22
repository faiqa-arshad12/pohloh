export const generateChartData = (monthlyData: any[], valueKey: string = 'count') => {
  const currentMonth = new Date().getMonth();
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = (currentMonth - i + 12) % 12;
    return monthNames[monthIndex];
  }).reverse();

  const maxValue = Math.max(...monthlyData.map((item) => item[valueKey]), 0);

  const chartData = last12Months.map((month) => {
    const monthData = monthlyData.find((item) => {
      const apiMonth = item.month.split(" ")[0];
      return apiMonth === month;
    }) || { month, [valueKey]: 0, count: 0 };
    
    const isHighestValue = monthData[valueKey] === maxValue && maxValue > 0;

    return {
      month: monthData.month.split(" ")[0] || month,
      value: monthData[valueKey] || 0.1,
      actualValue: monthData[valueKey],
      count: monthData.count || 0,
      isHighlighted: isHighestValue,
      hasData: monthData[valueKey] > 0,
    };
  });

  return chartData;
};
