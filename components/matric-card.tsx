import React from 'react';

interface MetricCardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ value, label, icon, className = "" }) => {
  return (
    <div className={`bg-[#191919] rounded-[20px] p-4 text-white ${className}`}>
      <div className="flex items-center gap-8 py-4">
        <div className="text-yellow-400">{icon}</div>
        <div className="text-left">
          <span className="font-urbanist font-medium text-[34px] leading-[40px] tracking-[0] align-bottom">
            {value}
          </span>
          <p className="!font-urbanist text-[#FFFFFFCC] font-medium text-[20px] leading-[24px]">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
