import type {LucideIcon} from "lucide-react";
import {useRouter} from "next/navigation";
import type {ReactNode} from "react";

interface TopPerformanceProps {
  title: string;
  subtitle: string;
  percentage: string;
  icon?: LucideIcon;
  customIcon?: ReactNode;
  iconSize?: number;
}

const TopPerformance = ({
  title,
  subtitle,
  percentage,
  icon: Icon,
  customIcon,
  iconSize = 40,
}: TopPerformanceProps) => {
  const router = useRouter();
  const handleViewAll = () => {
    router.push("/analytics/learning-path-performance");
  };
  return (
    <div className="bg-[#191919] p-6 rounded-[30px] text-white shadow-md w-full">
      <div className="flex flex-col">
        <div className="mb-4 flex justify-between items-center">
          <h4 className="font-urbanist font-bold text-[16px] leading-[140%] tracking-[0.01em] text-white">
            {title}
          </h4>
          <h4
            className="font-urbanist font-bold text-[14px] text-[#F9DB6F] font-normal cursor-pointer underline"
            onClick={() => {
              handleViewAll();
            }}
          >
            View All
          </h4>
        </div>
        <div className="mt-2 flex flex-row justify-between items-center">
          <div>
            <h5 className="text-[#F9DB6F] font-urbanist font-normal text-[20px] leading-[120%] tracking-[0] mb-1">
              {subtitle}
            </h5>
            <div className="text-[#F9DB6F] font-urbanist font-bold text-[48px] leading-[140%] tracking-[1%]">
              {percentage}
            </div>
          </div>
          <div className="bg-white rounded-full w-[80px] h-[80px] flex items-center justify-center">
            {customIcon ? (
              customIcon
            ) : Icon ? (
              <Icon size={iconSize} className="text-[#F9DB6F]" />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopPerformance;
