"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as Dialog from "@radix-ui/react-dialog"
import { ChartNoAxesCombined,  Users, X, Briefcase, ClipboardList, MoreHorizontal, FileText, } from "lucide-react"
import { useState } from "react"


// type ItemType = "category" | "subcategory" | "file";

type CategoryItem = {
  id: string;
  name: string;
  icon?: React.ReactNode;
  expanded?: boolean;
  type: "category" | "subcategory" | "file";
  children?: CategoryItem[]; // Optional, because files won't have children
};

export function ManageCategory() {
  const [open, setOpen] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [openInput, setOpenInput] = useState(false)
  const [categories, setCategories] = useState<CategoryItem[]>([
    {
      id: "1",
      name: "Sales",
      icon: <ChartNoAxesCombined className="h-5 w-5" />,
      expanded: false,
      type: "category",
      children: [
        {
          id: "1-1",
          name: "Policy",
          icon: <ClipboardList className="h-5 w-5" />,
          expanded: false,
          type: "subcategory",
          children: [
            {
              id: "1-1-1",
              name: "Report.docx",
              icon: <FileText className="h-5 w-5" />,
              type: "file"
            },
            {
              id: "1-1-2",
              name: "Guidelines.pdf",
              icon: <FileText className="h-5 w-5" />,
              type: "file"
            }
          ]
        }
      ]
    },
    {
      id: "2",
      name: "HR",
      icon: <Users className="h-5 w-5" />,
      expanded: false,
      type: "category",
      children: [
        {
          id: "2-1",
          name: "Recruitment",
          icon: <Briefcase className="h-5 w-5" />,
          expanded: false,
          type: "subcategory",
          children: [
            {
              id: "2-1-1",
              name: "Job_Description.docx",
              icon: <FileText className="h-5 w-5" />,
              type: "file"
            }
          ]
        }
      ]
    },
    {
      id: "3",
      name: "Design",
      icon: <ChartNoAxesCombined className="h-5 w-5" />,
      expanded: false,
      type: "category",
      children: []
    },
    {
      id: "4",
      name: "Branding",
      icon: <ChartNoAxesCombined className="h-5 w-5" />,
      expanded: false,
      type: "category",
      children: []
    }
  ]);

  // Update handleAddCategory function
  const handleAddCategory = () => {
    if (isAddingSubcategory) {
      if (!selectedCategoryId) {
        alert('Please select a category first');
        return;
      }
      if (newCategory.trim()) {
        setCategories(categories.map(cat => {
          if (cat.id === selectedCategoryId) {
            // Type guard for category/subcategory items
            if (cat.type === 'file') return cat;
  
            return {
              ...cat,
              children: [
                ...(cat.children || []), // Handle optional children
                {
                  id: Date.now().toString(),
                  name: newCategory,
                  icon: <ClipboardList className="h-5 w-5" />,
                  expanded: false,
                  type: "subcategory",
                  children: []
                }
              ]
            };
          }
          return cat;
        }));
        setNewCategory("");
        setOpenInput(false);
        setIsAddingSubcategory(false);
      }
    } else {
      setOpenInput(true);
      if (newCategory.trim()) {
        const newCategoryItem: CategoryItem = {
          id: Date.now().toString(),
          name: newCategory,
          icon: <ChartNoAxesCombined className="h-5 w-5" />,
          expanded: false,
          type: "category",
          children: []
        };
  
        setCategories([
          ...categories,
          newCategoryItem
        ]);
        setNewCategory("");
      }
    }
  };
  

  const handleAddSubcategory = () => {
    if (!selectedCategoryId) {
      alert('Please select a category first');
      return;
    }
    setOpenInput(true);
    setIsAddingSubcategory(true);
  };

  // This function toggles the expanded state of a category at any nesting level
  const toggleExpand = (categoryId: string) => {
    setCategories(prevCategories => {
      return updateItemExpanded(prevCategories, categoryId);
    });
  }

  // Recursive function to update the expanded state of a category at any depth
  const updateItemExpanded = (items: CategoryItem[], targetId: string): CategoryItem[] => {
    return items.map(item => {
      if (item.id === targetId) {
        // Toggle the expanded state of the target item (if it can be expanded)
        return {
          ...item,
          expanded: item.children && item.children.length > 0 ? !item.expanded : undefined
        };
      } else if (item.children && item.children.length > 0) {
        // If the item has children, recursively search through them
        return {
          ...item,
          children: updateItemExpanded(item.children, targetId)
        };
      }
      // Return the item unchanged if it's not the target and has no children
      return item;
    });
  }


  const renderItem = (item: CategoryItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isFile = item.type === "file";
  
    // Check if this item is the selected one
    const isSelected = item.id === selectedCategoryId;
  
    return (
      <div
        key={item.id}
        className={`mb-2 pb-2 ${isFile ? "" : "border-b border-[#3A3A3A]"}`} // Border styling
        style={{
          marginLeft: depth * 16,
          marginRight: depth * 16,
          width: `calc(100% - ${depth * 32}px)` // Adjusting width for each depth
        }}
      >
        <div
          className={`flex items-center justify-between py-2 px-3 rounded-[8px] ${isFile ? "bg-[#F9DB6F]" : ""} ${!isFile && item.expanded ? "border border-[#E0EAF5] bg-[#FFFFFF14]" : ""}`}
        >
          <div className="flex items-center flex-1 ">
            <Button
              onClick={() => {
                 toggleExpand(item.id);
                 setSelectedCategoryId(item.id); // Update selected item
                 setIsAddingSubcategory(false);
              }}
              className={`w-full flex items-center justify-start gap-2 font-urbanist font-medium text-[18px] leading-[21.9px] bg-transparent hover:bg-transparent cursor-pointer ${isSelected ? "text-[#F9DB6F]" : ""}`} // Change text color when selected
              type="button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="10"
                height="15"
                viewBox="0 0 10 15"
                fill="none"
                className={`h-4 w-4 transition-transform duration-200 ease-in-out ${item.expanded ? "rotate-90" : ""}`}
              >
                <path d="M0 0L10 7.5L0 15V0Z" fill="white" />
              </svg>
              <span className={`${isFile ? "text-black font-medium" : ""}`}>{item.icon}</span>
              <span className={`${isFile ? "text-black font-medium" : ""} ${isSelected ? "text-[#F9DB6F]" : ""}`}>{item.name}</span> {/* Apply color to text */}
            </Button>
          </div>
  
          <div className={`ml-2 cursor-pointer`}>
            <MoreHorizontal className={`h-5 w-5 ${isFile ? "text-black font-medium" : "text-white hover:text-white"}`} />
          </div>
        </div>
  
        {item.expanded && hasChildren && (
          <div className="py-2 mb-2">
            {item.children && item.children.map((child) => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  
  
  


  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="w-[232px] h-[48px] flex items-center justify-center gap-1 bg-[#F9DB6F] hover:bg-[#F9DB6F]/90 text-black font-medium rounded-[8px] border border-black/10 px-4 py-3 cursor-pointer"
      >
        Manage Categories
      </Button>

    

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
          <Dialog.Content className="fixed z-[101] pt-[40px] p-6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1E1E1E] text-white rounded-lg  w-[836px] h-[80vh] overflow-y-auto  shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="font-urbanist font-bold text-[32px] leading-[100%] test-[#FFFFFF]">Manage Categories</Dialog.Title>

              <Dialog.Close asChild>
                <Button className="rounded-full h-[24px] w-[24px] bg-transparent hover:bg-transparent cursor-pointer" type="button">
                  <X className="h-[24px] w-[24px] text-[#F9DB6F]" />
                </Button>
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <h3 className="font-urbanist font-semibold text-[24px] leading-[100%] text-[#F9DB6F] tracking-[0]">
                Add Categories
              </h3>

              {openInput && (
                <div className="relative gap-2">
                  <h5 className="font-urbanist font-normal text-base leading-6 align-middle h-[24px] mb-2">
                    {isAddingSubcategory ? "Add Subcategory" : "Add Category"}
                  </h5>
                  <Input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#2A2A2A] border border-[#3A3A3A] rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                </div>
              )}

              <Button
                onClick={handleAddCategory}
                className="w-[203px] h-[60px] bg-[#F9DB6F]  text-black font-medium rounded-[90px] px-6 py-3 flex items-center justify-center gap-1 cursor-pointer"
                type="button"
              >
                {isAddingSubcategory ? "+ Add Subcategory" : "+ Add category"}
              </Button>

              <Button
                onClick={handleAddSubcategory}
                className="w-[203px] h-[60px] border border-[#CDCDCD] bg-[#333435] hover:bg-[#333435] text-white rounded-[90px] px-6 py-3 text-sm flex items-center justify-center gap-1 cursor-pointer"
                type="button"
              >
                
                <span> + Add Subcategory</span>
              </Button>


              <div className="pt-2">
                <h3 className="font-urbanist font-semibold text-[24px] leading-[100%] text-[#F9DB6F] mb-2">Manage Existing Categories</h3>

                <div className="space-y-1">
                  {categories.map(category => renderItem(category))}
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root >
    </>
  )
}