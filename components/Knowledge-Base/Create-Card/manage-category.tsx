"use client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Tabs from "@radix-ui/react-tabs";
import {
  X,
  ClipboardList,
  MoreHorizontal,
  FileText,
  Plus,
  Trash2,
  Edit,
  Search,
  ChevronRight,
} from "lucide-react";
import {useState, useEffect, useMemo} from "react";
import {useUser} from "@clerk/nextjs";
import {ShowToast} from "@/components/shared/show-toast";
import {iconCategories, iconComponents, renderIcon} from "@/lib/renderIcon";
import {IconName} from "@/types/types";
import {Skeleton} from "@/components/ui/skeleton";
import {apiUrl} from "@/utils/constant";

// Types
type KnowledgeCard = {
  id: string;
  title: string;
  type: string;
  content: string;
  card_status: string;
  tags: any;
  org_id: string;
};

type Subcategory = {
  id: string;
  name: string;
  knowledge_card: KnowledgeCard[];
  team_id: string;
};

type Team = {
  id: string;
  name: string;
  subcategories: Subcategory[];
  org_id: string;
  icon: string;
};

type ApiResponse = {
  success: boolean;
  teams: Team[];
};

type CategoryItem = {
  id: string;
  name: string;
  icon?: React.ReactNode;
  iconName?: IconName;
  expanded?: boolean;
  type: "category" | "subcategory" | "file";
  children?: CategoryItem[];
  originalData?: Team | Subcategory | KnowledgeCard;
  parentId?: string;
};

const convertApiDataToCategoryItems = (data: ApiResponse): CategoryItem[] => {
  if (!data?.teams) return [];

  return data.teams.map((team) => ({
    id: team.id,
    name: team.name,
    icon: renderIcon(team.icon || "Folder"),
    iconName: team.icon || "Folder",
    expanded: false,
    type: "category",
    originalData: team,
    children: team.subcategories.map((subcategory) => ({
      id: subcategory.id,
      name: subcategory.name,
      icon: <ClipboardList className="h-5 w-5" />,
      expanded: false,
      type: "subcategory",
      originalData: subcategory,
      parentId: team.id,
      children: subcategory.knowledge_card.map((card) => ({
        id: card.id,
        name: card.title,
        icon: <FileText className="h-5 w-5" />,
        type: "file",
        originalData: card,
        parentId: subcategory.id,
      })),
    })),
  }));
};

export function ManageCategory({
  onCategoriesChanged,
}: {
  onCategoriesChanged?: () => void;
}) {
  // State management
  const [open, setOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [openInput, setOpenInput] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showEditIconPicker, setShowEditIconPicker] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const [editIconSearch, setEditIconSearch] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<IconName>("Folder");
  const [isLoading, setIsLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<any>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState<string | null>(null);
  const {user, isLoaded: isUserLoaded} = useUser();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [editingItem, setEditingItem] = useState<CategoryItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState<IconName>("Folder");
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeIconTab, setActiveIconTab] = useState("all");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CategoryItem | null>(null);

  // Memoized filtered icons
  const filteredIcons = useMemo(() => {
    let icons = Object.keys(iconComponents);

    if (activeIconTab !== "all") {
      const category = iconCategories.find(
        (cat) => cat.name.toLowerCase() === activeIconTab.toLowerCase()
      );
      if (category) {
        icons = category.icons;
      }
    }

    if (iconSearch) {
      const searchTerm = iconSearch.toLowerCase();
      icons = icons.filter(
        (icon) =>
          icon.toLowerCase().includes(searchTerm) ||
          icon.toLowerCase().replace(/-/g, " ").includes(searchTerm)
      );
    }

    return icons;
  }, [iconSearch, activeIconTab]);

  const filteredEditIcons = useMemo(() => {
    if (!editIconSearch) return Object.keys(iconComponents);
    const searchTerm = editIconSearch.toLowerCase();
    return Object.keys(iconComponents).filter(
      (icon) =>
        icon.toLowerCase().includes(searchTerm) ||
        icon.toLowerCase().replace(/-/g, " ").includes(searchTerm)
    );
  }, [editIconSearch]);

  // Data fetching
  const fetchData = async () => {
    if (!user || !open) return;

    setIsLoading(true);
    try {
      // Fetch user details
      const response = await fetch(`${apiUrl}/users/${user?.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch user details");
      const userData = await response.json();
      setUserDetails(userData);

      // Fetch teams/categories
      const res = await fetch(
        `${apiUrl}/teams/organizations/categories/${userData.user.organizations?.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // credentials: "include",
          body: JSON.stringify({
            role: userData.user.role,
            userId: userData.user.id,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to fetch teams");
      const teamsData = await res.json();
      setTeams(teamsData.teams || []);
      setCategories(convertApiDataToCategoryItems(teamsData));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      ShowToast(
        err instanceof Error ? err.message : "Failed to load categories",
        "error"
      );
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  // Effects
  useEffect(() => {
    if (isUserLoaded && open) {
      fetchData();
    }
  }, [user, isUserLoaded, open]);

  useEffect(() => {
    if (!open) {
      resetStates();
    }
  }, [open]);

  // Helper functions
  const resetStates = () => {
    setNewItemName("");
    setSelectedCategoryId(null);
    setIsAddingSubcategory(false);
    setOpenInput(false);
    setShowIconPicker(false);
    setShowEditIconPicker(false);
    setIconSearch("");
    setEditIconSearch("");
    setSelectedIcon("Folder");
    setEditingItem(null);
    setEditName("");
    setEditIcon("Folder");
    setIsEditMode(false);
    setError(null);
    setActiveIconTab("all");
    setDeleteConfirmationOpen(false);
    setItemToDelete(null);
  };

  const validateInput = (value: string, fieldName: string): boolean => {
    if (!value.trim()) {
      setError(`${fieldName} cannot be empty`);
      return false;
    }
    return true;
  };

  // CRUD operations
  const handleAddCategory = async () => {
    if (!validateInput(newItemName, "Category name")) return;
    if (!userDetails) {
      setError("User details not available");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // credentials: "include",
        body: JSON.stringify({
          name: newItemName,
          org_id: userDetails.user.organizations?.id,
          icon: selectedIcon,
        }),
      });

      if (!response.ok) throw new Error("Failed to add category");
      const teamData = await response.json();
      const newTeam = teamData?.team[0];
      setCategories((prev) => [
        ...prev,
        {
          id: newTeam.id,
          name: newTeam.name,
          icon: renderIcon(newTeam.icon || selectedIcon),
          iconName: newTeam.icon || selectedIcon,
          expanded: false,
          type: "category",
          children: [],
          originalData: newTeam,
        },
      ]);

      resetStates();
      ShowToast("Category has been added successfully", "success");
      if (onCategoriesChanged) onCategoriesChanged();
    } catch (err) {
      console.error("Error adding category:", err);
      setError(err instanceof Error ? err.message : "Failed to add category");
      ShowToast(
        err instanceof Error ? err.message : "Failed to add category",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubcategory = async () => {
    if (!validateInput(newItemName, "Subcategory name")) return;
    if (!selectedCategoryId) {
      setError("Please select a parent category first");
      ShowToast("Please select a parent category first", "error");
      return;
    }
    if (!userDetails) {
      setError("User details not available");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/sub-categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // credentials: "include",
        body: JSON.stringify({
          name: newItemName,
          team_id: selectedCategoryId,
          org_id: userDetails.user.org_id,
        }),
      });

      if (!response.ok) throw new Error("Failed to add subcategory");

      fetchData();
      resetStates();
      ShowToast("Subcategory has been added successfully", "success");
      if (onCategoriesChanged) onCategoriesChanged();
    } catch (err) {
      console.error("Error adding subcategory:", err);
      setError(
        err instanceof Error ? err.message : "Failed to add subcategory"
      );
      ShowToast(
        err instanceof Error ? err.message : "Failed to add subcategory",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (item: CategoryItem) => {
    setItemToDelete(item);
    setDeleteConfirmationOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      setIsLoading(true);
      let endpoint = "";

      if (itemToDelete.type === "category") {
        endpoint = `${apiUrl}/teams/${itemToDelete.id}`;
      } else if (itemToDelete.type === "subcategory") {
        endpoint = `${apiUrl}/sub-categories/${itemToDelete.id}`;
      } else {
        return;
      }

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        // credentials: "include",
      });

      if (!response.ok)
        throw new Error(`Failed to delete ${itemToDelete.type}`);

      // Update local state
      if (itemToDelete.type === "category") {
        setCategories(categories.filter((cat) => cat.id !== itemToDelete.id));
      } else if (itemToDelete.type === "subcategory") {
        setCategories(
          categories.map((cat) => ({
            ...cat,
            children:
              cat.children?.filter((child) => child.id !== itemToDelete.id) ||
              [],
          }))
        );
      }

      ShowToast(
        `${itemToDelete.type === "category" ? "Department" : "Subcategory"} "${
          itemToDelete.name
        }" has been deleted successfully`
      );
      if (onCategoriesChanged) onCategoriesChanged();
    } catch (err) {
      console.error(`Error deleting ${itemToDelete.type}:`, err);
      setError(
        err instanceof Error
          ? err.message
          : `Failed to delete ${itemToDelete.type}`
      );
      ShowToast(
        err instanceof Error
          ? err.message
          : `Failed to delete ${itemToDelete.type}`,
        "error"
      );
    } finally {
      setIsLoading(false);
      setDeleteConfirmationOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) {
      setError("No item selected for editing");
      return;
    }
    if (!validateInput(editName, "Name")) return;

    try {
      setIsLoading(true);
      setError(null);
      let endpoint = "";
      const body: any = {name: editName};

      if (editingItem.type === "category") {
        endpoint = `${apiUrl}/teams/update/${editingItem.id}`;
        body.icon = editIcon;
      } else if (editingItem.type === "subcategory") {
        endpoint = `${apiUrl}/sub-categories/${editingItem.id}`;
        body.team_id = editingItem.parentId;
      } else {
        return;
      }

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        // credentials: "include",
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error(`Failed to update ${editingItem.type}`);

      fetchData();
      setEditingItem(null);
      setIsEditMode(false);
      ShowToast(
        `${
          editingItem.type === "category" ? "Category" : "Subcategory"
        } has been updated successfully`,
        "success"
      );
      if (onCategoriesChanged) onCategoriesChanged();
    } catch (err) {
      console.error(`Error updating ${editingItem.type}:`, err);
      setError(
        err instanceof Error
          ? err.message
          : `Failed to update ${editingItem.type}`
      );
      ShowToast(
        err instanceof Error
          ? err.message
          : `Failed to update ${editingItem.type}`,
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // UI helpers
  const toggleExpand = (categoryId: string) => {
    setCategories((prevCategories) =>
      prevCategories.map((item) => ({
        ...item,
        expanded:
          item.id === categoryId
            ? item.children && item.children.length > 0
              ? !item.expanded
              : undefined
            : item.expanded,
        children: item.children
          ? item.children.map((child) => ({
              ...child,
              expanded:
                child.id === categoryId
                  ? child.children && child.children.length > 0
                    ? !child.expanded
                    : undefined
                  : child.expanded,
            }))
          : undefined,
      }))
    );
  };

  const handleEdit = (item: CategoryItem) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditIcon(item.iconName || "Folder");
    setIsEditMode(true);
  };

  const renderDropdownMenu = (item: CategoryItem) => (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="ml-2 cursor-pointer outline-none hover:bg-gray-700/50 p-1 rounded">
          <MoreHorizontal className="h-5 w-5 text-gray-400 hover:text-white" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[120px] bg-[#2A2A2A] rounded-md p-1 shadow-lg border border-[#3A3A3A] z-[110]"
          sideOffset={5}
        >
          <DropdownMenu.Item
            className="text-white flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-[#3A3A3A] outline-none cursor-pointer"
            onClick={() => handleEdit(item)}
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-[#3A3A3A] outline-none cursor-pointer text-red-400 hover:text-red-300"
            onClick={() => handleDelete(item)}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );

  const renderIconPicker = () => (
    <div className="w-full">
      <Button
        type="button"
        className="w-full flex items-center gap-2 py-2 px-3 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md text-left h-10"
        onClick={() => setShowIconPicker(!showIconPicker)}
      >
        {renderIcon(selectedIcon, "h-5 w-5")}
        <span>Select Icon</span>
      </Button>

      {showIconPicker && (
        <div className="mt-1 p-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md w-full max-h-[350px] overflow-y-auto">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search icons..."
              value={iconSearch}
              onChange={(e) => setIconSearch(e.target.value)}
              className="pl-10 bg-[#1E1E1E] border-[#3A3A3A]"
            />
          </div>

          <Tabs.Root value={activeIconTab} onValueChange={setActiveIconTab}>
            <Tabs.List className="flex overflow-x-auto mb-2 border-b border-[#3A3A3A] pb-1">
              <Tabs.Trigger
                value="all"
                className={`px-3 py-1 text-sm rounded-t-md mr-1 ${
                  activeIconTab === "all"
                    ? "bg-[#3A3A3A] text-[#F9DB6F]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                All
              </Tabs.Trigger>
              {iconCategories.map((category) => (
                <Tabs.Trigger
                  key={category.name}
                  value={category.name.toLowerCase()}
                  className={`px-3 py-1 text-sm rounded-t-md mr-1 ${
                    activeIconTab === category.name.toLowerCase()
                      ? "bg-[#3A3A3A] text-[#F9DB6F]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {category.name}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-6 gap-2">
                {filteredIcons.map((iconName) => (
                  <button
                    key={iconName}
                    className={`flex flex-col items-center justify-center p-2 rounded-md cursor-pointer hover:bg-[#3A3A3A] ${
                      selectedIcon === iconName
                        ? "bg-[#3A3A3A] border border-[#F9DB6F]"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedIcon(iconName);
                      setIconSearch("");
                    }}
                    title={iconName.split(/(?=[A-Z])/).join(" ")}
                  >
                    {renderIcon(iconName, "h-5 w-5 mb-1")}
                    <span className="text-xs truncate w-full text-center">
                      {iconName.split(/(?=[A-Z])/).join(" ")}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                No icons found matching your search
              </div>
            )}
          </Tabs.Root>
        </div>
      )}
    </div>
  );

  const renderEditIconPicker = () => (
    <div className="relative">
      <Button
        type="button"
        className="flex items-center justify-center p-1 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md cursor-pointer h-8 w-8 hover:bg-[#3A3A3A]"
        onClick={() => setShowEditIconPicker(!showEditIconPicker)}
      >
        {renderIcon(editIcon, "h-4 w-4")}
      </Button>
      {showEditIconPicker && (
        <div className="absolute z-50 mt-1 p-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md w-[280px] max-h-[300px] overflow-y-auto right-0">
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search icons..."
              value={editIconSearch}
              onChange={(e) => setEditIconSearch(e.target.value)}
              className="pl-10 bg-[#1E1E1E] border-[#3A3A3A]"
            />
          </div>
          {filteredEditIcons.length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {filteredEditIcons.map((iconName) => (
                <button
                  key={iconName}
                  className={`flex flex-col items-center justify-center p-2 rounded-md cursor-pointer hover:bg-[#3A3A3A] ${
                    editIcon === iconName
                      ? "bg-[#3A3A3A] border border-[#F9DB6F]"
                      : ""
                  }`}
                  onClick={() => {
                    setEditIcon(iconName);
                    setShowEditIconPicker(false);
                    setEditIconSearch("");
                  }}
                  title={iconName.split(/(?=[A-Z])/).join(" ")}
                >
                  {renderIcon(iconName, "h-4 w-4 mb-1")}
                  <span className="text-xs truncate w-full text-center">
                    {iconName.split(/(?=[A-Z])/).join(" ")}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">
              No icons found matching your search
            </div>
          )}
        </div>
      )}
    </div>
  );
  const hasExpandedSubcategories = (item: CategoryItem): boolean => {
    if (!item.children || item.children.length === 0) return false;
    return item.children.some(
      (child) => child.expanded && child.type === "subcategory"
    );
  };
  const renderItem = (item: CategoryItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isFile = item.type === "file";
    const isSelected = item.id === selectedCategoryId;
    const isEditing = editingItem?.id === item.id && isEditMode;
    const shouldHighlight =
      item.type === "category" &&
      item.expanded &&
      !hasExpandedSubcategories(item);

    return (
      <div
        key={item.id}
        className="pb-4"
        style={{
          marginLeft: depth * 16,
          marginRight: depth * 16,
          width: `calc(100% - ${depth * 32}px)`,
        }}
      >
        {isEditing ? (
          <div className="flex items-center gap-2 w-full bg-[#2A2A2A] p-2 rounded-md">
            <Input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className={`flex-1 bg-[#2A2A2A] border ${
                !editName?.trim() && error
                  ? "border-red-500"
                  : "border-[#3A3A3A]"
              } rounded-md py-1 px-2 text-sm focus:outline-none focus:ring-1 ${
                !editName?.trim() && error
                  ? "focus:ring-red-500"
                  : "focus:ring-yellow-500"
              }`}
              onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
              required
            />
            {item.type === "category" && renderEditIconPicker()}
            <Button
              onClick={handleSaveEdit}
              className="h-8 px-2 bg-[#F9DB6F] text-black text-sm"
              disabled={isLoading || !editName?.trim()}
            >
              Save
            </Button>
            <Button
              onClick={() => {
                setEditingItem(null);
                setError(null);
                setShowEditIconPicker(false);
                setIsEditMode(false);
              }}
              className="h-8 px-2 bg-[#333435] text-white text-sm"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div
            className={`flex items-center justify-between py-2 px-3 h-[68px] ${
              isFile
                ? "bg-[#F9DB6F] hover:bg-[#F9DB6F]/90 rounded-md h-[68px]"
                : "hover:bg-[#2A2A2A]"
            } ${
              shouldHighlight
                ? "border border-[#E0EAF5] bg-[#333435] rounded-md"
                : !isFile && item.expanded && item.type === "category"
                ? "border-t border-[white]"
                : ""
            }`}
          >
            <div className="flex items-center flex-1">
              <button
                onClick={() => {
                  if (!isEditing) {
                    toggleExpand(item.id);
                    setSelectedCategoryId(item.id);
                    setIsAddingSubcategory(false);
                  }
                }}
                className={`w-full flex items-center justify-start gap-2 font-medium text-[16px] leading-[21.9px] bg-transparent hover:bg-transparent cursor-pointer ${
                  isSelected
                    ? "text-[#F9DB6F]"
                    : isFile
                    ? "text-black"
                    : "text-white"
                }`}
                type="button"
              >
                {!isFile && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="10"
                    height="15"
                    viewBox="0 0 10 15"
                    fill="none"
                    className={`h-4 w-4 transition-transform duration-200 ease-in-out ${
                      item.expanded ? "rotate-90" : ""
                    }`}
                  >
                    <path d="M0 0L10 7.5L0 15V0Z" fill="white" />
                  </svg>
                )}

                {item.type === "category" && item.iconName ? (
                  <span className={isFile ? "text-black" : ""}>
                    {renderIcon(item.iconName)}
                  </span>
                ) : (
                  <span className={isFile ? "text-black" : ""}>
                    {item.icon}
                  </span>
                )}
                <span
                  className={`truncate ${isFile ? "text-black" : ""} ${
                    isSelected ? "text-[#F9DB6F]" : ""
                  }`}
                >
                  {item.name}
                </span>
              </button>
            </div>

            {!isFile && renderDropdownMenu(item)}
          </div>
        )}

        {item.expanded && hasChildren && (
          <div className="pl-4 mt-1">
            {item.children?.map((child) => renderItem(child, depth + 1))}
          </div>
        )}
        {!item.expanded && !isFile && (
          <div className="h-[1px] bg-[#E0EAF5] mt-2" />
        )}
      </div>
    );
  };
  // Main render
  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full min-w-[232px] h-[48px] flex items-center justify-center gap-1 bg-[#F9DB6F] hover:bg-[#F9DB6F]/90 text-black font-medium rounded-[8px] border border-black/10 px-4 py-3 cursor-pointer"
      >
        Manage Departments
      </Button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
          <Dialog.Content className="fixed z-[101] pt-[40px] p-6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1E1E1E] text-white rounded-lg w-[90vw] max-w-[836px] h-[90vh] max-h-[800px] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <Dialog.Title className="font-bold text-2xl md:text-3xl text-white">
                Manage Departments
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <X className="h-5 w-5 text-[#F9DB6F]" />
                </button>
              </Dialog.Close>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-md mb-4 flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="p-1 h-auto bg-transparent hover:bg-red-500/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-xl text-[#F9DB6F] mb-3">
                  Add Departments
                </h3>

                {openInput ? (
                  <div className="bg-[#2A2A2A] p-4 rounded-md">
                    <div className="space-y-3">
                      <Input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className={`w-full bg-[#2A2A2A] border ${
                          !newItemName.trim() && error
                            ? "border-red-500"
                            : "border-[#3A3A3A]"
                        } rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 ${
                          !newItemName.trim() && error
                            ? "focus:ring-red-500"
                            : "focus:ring-yellow-500"
                        }`}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (isAddingSubcategory
                            ? handleAddSubcategory()
                            : handleAddCategory())
                        }
                        placeholder={`Enter ${
                          isAddingSubcategory ? "subcategory" : "category"
                        } name`}
                        autoFocus
                        required
                      />
                      {!newItemName.trim() && error && (
                        <p className="text-red-500 text-xs mt-1">
                          This field is required
                        </p>
                      )}

                      {!isAddingSubcategory && renderIconPicker()}

                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          onClick={
                            isAddingSubcategory
                              ? handleAddSubcategory
                              : handleAddCategory
                          }
                          className="px-4 py-2 bg-[#F9DB6F] hover:bg-[#F9DB6F]/90 text-black font-medium rounded-md flex items-center justify-center gap-1 cursor-pointer"
                          type="button"
                          disabled={isLoading || !newItemName.trim()}
                        >
                          {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
                          ) : (
                            <>
                              <span>Save</span>
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setOpenInput(false);
                            setNewItemName("");
                            setSelectedIcon("Folder");
                            setShowIconPicker(false);
                            setIsAddingSubcategory(false);
                            setError(null);
                          }}
                          className="px-4 py-2 bg-[#333435] hover:bg-[#333435]/90 text-white rounded-md cursor-pointer"
                          type="button"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      onClick={() => {
                        setOpenInput(true);
                        setIsAddingSubcategory(false);
                      }}
                      className="h-[48px] bg-[#F9DB6F] hover:bg-[#F9DB6F]/90 text-black font-medium rounded-[90px] px-6 py-3 flex items-center justify-center gap-1 cursor-pointer"
                      type="button"
                      disabled={isLoading || isEditMode}
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Department</span>
                    </Button>

                    <Button
                      onClick={() => {
                        if (!selectedCategoryId) {
                          setError("Please select a parent category first");
                          ShowToast(
                            "Please select a parent category first",
                            "error"
                          );
                          return;
                        }
                        setOpenInput(true);
                        setIsAddingSubcategory(true);
                      }}
                      className="h-[48px] border border-[#3A3A3A] bg-[#333435] hover:bg-[#333435]/90 text-white rounded-[90px] px-6 py-3 flex items-center justify-center gap-1 cursor-pointer"
                      type="button"
                      disabled={isLoading || isEditMode}
                    >
                      <Plus className="h-5 w-5" />
                      <span>Add Subcategory</span>
                    </Button>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <h3 className="font-semibold text-xl text-[#F9DB6F] mb-3">
                  Manage Existing Departments
                </h3>

                {isInitialLoad ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full bg-[#2A2A2A]" />
                    ))}
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-gray-400 py-4 text-center">
                    No categories found. Add your first category above.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {categories.map((category) => renderItem(category))}
                  </div>
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root
        open={deleteConfirmationOpen}
        onOpenChange={setDeleteConfirmationOpen}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[102] rounded-[30px]" />
          <Dialog.Content className="fixed z-[103] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1E1E1E] text-white rounded-lg w-[90vw] max-w-[400px] p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="font-bold text-xl text-white">
                Confirm Deletion
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="rounded-full h-8 w-8 flex items-center justify-center hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <X className="h-5 w-5 text-[#F9DB6F]" />
                </button>
              </Dialog.Close>
            </div>

            <div className="mb-6">
              {itemToDelete?.type === "category" &&
              itemToDelete.children &&
              itemToDelete.children.length > 0 ? (
                <p>
                  This department has sub-departments. Deleting it will remove
                  all associated data. Are you sure you want to continue?
                </p>
              ) : (
                <p>
                  Are you sure you want to delete "{itemToDelete?.name}"? This
                  action cannot be undone.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setDeleteConfirmationOpen(false)}
                className="px-4 py-2 bg-[#333435] hover:bg-[#333435]/90 text-white rounded-md cursor-pointer"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="px-4 py-2 bg-[#F9DB6F] opacity-100 hover:opacity-80 text-black rounded-md flex items-center gap-2 cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    {/* <Trash2 className="h-4 w-4" /> */}
                    <span>Delete</span>
                  </>
                )}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
