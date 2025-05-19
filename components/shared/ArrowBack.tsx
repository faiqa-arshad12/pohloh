import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface ArrowBackProps {
  link: string;
}

const ArrowBack: React.FC<ArrowBackProps> = ({ link }) => {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-7 cursor-pointer">
      <button
        onClick={() => router.push(link)}
        className="rounded-md transition-colors  cursor-pointer"
        aria-label="Go back"
      >
        <ArrowLeft className="w-6 h-6 text-white hover:text-[#F9DB6F]" style={{cursor:'pointer'}} />

      </button>
    </div>
  );
};

export default ArrowBack;
