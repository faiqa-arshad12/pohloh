import {LoaderCircle} from "lucide-react";

interface LoaderProps {
  size?: number;
  color?: string;
}

const Loader = ({size, color = "#F9DB6F"}: LoaderProps) => {
  return (
    <div>
      <LoaderCircle size={size || 24} className={`animate-spin text-[white]`} />
    </div>
  );
};

export default Loader;
