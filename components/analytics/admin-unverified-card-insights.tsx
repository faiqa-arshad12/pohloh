import {useState, useEffect, useCallback} from "react";

import {MoreHorizontal, Trash2, GraduationCap, Ellipsis} from "lucide-react";
import React from "react";
import {Button} from "../ui/button";
import Table from "../ui/table";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {Icon} from "@iconify/react/dist/iconify.js";
import {exportToPDF} from "@/utils/exportToPDF";
import {fetchCards} from "./analytic.service";
import {useUserHook} from "@/hooks/useUser";
import TableLoader from "../shared/table-loader";
import {NoData} from "../shared/NoData";
import Loader from "../shared/loader";


interface UnverifiedCard {
  id: string;
  category_id: {
    name: string;
  };
  card_owner_id: {
    first_name: string;
    last_name: string;
  };
  title: string;
  created_at: string;
}

const AdminUnverifiedCard = () => {
  const {userData} = useUserHook();
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [filteredUnverifiedCards, setFilteredUnverifiedCards] = useState<
    UnverifiedCard[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  useEffect(() => {
    const getUnverifiedCards = async () => {
      try {
        setIsLoading(true);
        if (userData?.organizations.id && userData?.id && userData?.role) {
          const cards = await fetchCards(
            userData.organizations.id,
            userData.role,
            userData.id
          );
          if (cards) {
            console.log(cards, "card");
            const unverifiedCards = cards.filter(
              (card: any) => card.is_verified === false
            );
            setFilteredUnverifiedCards(unverifiedCards);
          }
        }
      } catch (error) {
        console.error("Error fetching unverified cards:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getUnverifiedCards();
  }, [userData]);

  const exportUnverifiedCardsToPDF = useCallback(() => {
    if (filteredUnverifiedCards.length === 0 || isExportingPDF) return;

    setIsExportingPDF(true);
    try {
      const dataForPdf = filteredUnverifiedCards.map((card) => {
        const ownerName = `${card.card_owner_id.first_name} ${card.card_owner_id.last_name}`;
        const formattedDate = new Date(card.created_at).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        );

        return {
          title: card.title,
          category: card.category_id.name,
          date: formattedDate,
          owner: ownerName,
        };
      });

      exportToPDF({
        title: "Unverified Cards List",
        filename: "unverified-cards-list",
        data: dataForPdf,
        type: "table",
        columns: ["title", "category", "date", "owner"],
        headers: {
          title: "Card Name",
          category: "Category",
          date: "Date",
          owner: "Owner",
        },
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF.");
    } finally {
      setIsExportingPDF(false);
    }
  }, [filteredUnverifiedCards, isExportingPDF]);

  const exportSingleCardToPDF = useCallback(
    (card: UnverifiedCard) => {
      if (isExportingPDF) return;

      setIsExportingPDF(true);
      try {
        const ownerName = `${card.card_owner_id.first_name} ${card.card_owner_id.last_name}`;
        const formattedDate = new Date(card.created_at).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        );

        const filteredCardData = {
          title: card.title,
          category: card.category_id.name,
          date: formattedDate,
          owner: ownerName,
        };

        exportToPDF({
          title: "Unverified Card Details",
          filename: `unverified-card-${card.title
            .replace(/\s+/g, "-")
            .toLowerCase()}`,
          data: filteredCardData,
          type: "details",
          headers: {
            title: "Card Name",
            category: "Category",
            date: "Date",
            owner: "Owner",
          },
        });
      } catch (error) {
        console.error("Error exporting PDF:", error);
        alert("Failed to export PDF.");
      } finally {
        setIsExportingPDF(false);
      }
    },
    [isExportingPDF]
  );

  const handleDeletePath = (id: string) => {
    alert("deleted" + id);
  };
  const unverfiedCardColumns = [
    {Header: "Card Name", accessor: "title"},
    {Header: "Category", accessor: "category_id.name"},
    {Header: "Date", accessor: "created_at"},
    {Header: "Owner", accessor: "ownerName"},
    {Header: "Action", accessor: "action"},
  ];
  // Custom cell renderer for tutors
  const renderRowActionsPath = (row: UnverifiedCard) => {
    return (
      <div className="flex justify-start">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="h-[28px] w-[28px] flex items-center justify-center text-lg cursor-pointer bg-transparent hover:bg-[#333] rounded">
              <Ellipsis className="h-5 w-5 text-white" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            side="bottom"
            align="end"
            sideOffset={4}
            className="min-w-[200px] bg-[#222222] border border-[#333] rounded-md shadow-lg py-2 p-2 z-50"
          >
            {/* <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer">
              <GraduationCap className="h-4 w-4" />
              <span>Ressign Learning Path</span>
            </DropdownMenu.Item> */}

            <DropdownMenu.Item
              onSelect={() => exportSingleCardToPDF(row)}
              disabled={isExportingPDF}
              className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer"
            >
              <Icon icon="bi:filetype-pdf" width="24" height="24" />
              <span>Export as PDF</span>
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={() => handleDeletePath(row.id)}
              className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    );
  };

  // Custom cell renderer for learning paths
  const renderPathCell = (column: string, row: UnverifiedCard) => {
    switch (column) {
      case "title":
        return (
          <div className="flex items-center gap-2 truncate">{row.title}</div>
        );
      case "category_id.name":
        return (
          <div className="flex items-center gap-2">{row.category_id.name}</div>
        );
      case "created_at":
        return (
          <div className="flex items-center gap-2">
            {new Date(row.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        );
      case "ownerName":
        return (
          <div className="flex items-center gap-2">
            {row.card_owner_id.first_name} {row.card_owner_id.last_name}
          </div>
        );
      case "action":
        return (
          <button
            onClick={() => setShowActionMenu(!showActionMenu)}
            className="text-gray-400"
          >
            <MoreHorizontal size={16} />
          </button>
        );
      default:
        return null;
    }
  };
  return (
    <div className="bg-[#191919] rounded-[30px] p-10 mb-8 relative">
      <div className="flex justify-between mb-4 items-center">
        <h3 className="font-urbanist font-medium text-[24px] leading-[21.9px] tracking-[0]">
          Unverified Cards Insights
        </h3>
        <Button
          onClick={exportUnverifiedCardsToPDF}
          disabled={
            isLoading || filteredUnverifiedCards.length === 0 || isExportingPDF
          }
          className="w-[52px] h-[50px] bg-[#333333] hover:bg-[#333333] rounded-lg border  px-2 py-[9px] flex items-center justify-center gap-[10px] cursor-pointer"
        >
          {isExportingPDF ? (
            <Loader/>
          ) : (
            <Icon
              icon="bi:filetype-pdf"
              width="24"
              height="24"
              color="white"
              className="cursor-pointer"
            />
          )}
        </Button>
      </div>
      <div className="mt-4 overflow-x-auto">
        {isLoading ? (
          <TableLoader />
        ) : filteredUnverifiedCards.length === 0 ? (
          <NoData />
        ) : (
          <Table
            columns={unverfiedCardColumns.slice(0, -1)}
            data={filteredUnverifiedCards}
            renderCell={renderPathCell}
            renderActions={(row) => renderRowActionsPath(row as UnverifiedCard)}
            tableClassName="w-full text-sm"
            headerClassName="bg-[#F9DB6F] text-black text-left font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
            bodyClassName="divide-y divide-gray-700 w-[171px] h-[68px]"
            cellClassName="py-2 px-4 border-t border-[#E0EAF5] relative w-[171px] h-[68px] overflow-visible font-urbanist font-medium text-[15.93px] leading-[21.9px] tracking-[0]"
          />
        )}
      </div>
    </div>
  );
};

export default AdminUnverifiedCard;
