import React, {useState} from "react";
import {HeadsetIcon, Users, ChartNoAxesCombined} from "lucide-react";
const CategoriesScore = () => {
  const categories = [
    {id: 1, name: "Marketing", score: 91, icon: "📢"},
    {id: 2, name: "CX", score: 55, icon: <HeadsetIcon />},
    {id: 3, name: "HR", score: 87, icon: <Users />},
    {id: 4, name: "Sales", score: 68, icon: <ChartNoAxesCombined />},
  ];
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="w-full flex flex-row  gap-4 mb-6 overflow-y-hidden">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`w-full flex items-center justify-between p-4 border border-[#828282] rounded-xl bg-[#0E0F11] hover:bg-[#0E0F11] transition-colors gap-5 cursor-pointer ${
            selectedCategory === category.id ? "ring-2 ring-[#F9DB6F]" : ""
          }`}
          //@ts-expect-error : category._id
          onClick={() => setSelectedCategory(category.id)}
        >
          <div className="flex items-center gap-5">
            <span>{category.icon}</span>
            <span className="text-[22px] font-medium">{category.name}</span>
          </div>
          <span className="bg-[#F9DB6F] text-black text-[16px] font-bold px-2 py-1 rounded-full">
            {category.score}%
          </span>
        </button>
      ))}
    </div>
  );
};

export default CategoriesScore;
