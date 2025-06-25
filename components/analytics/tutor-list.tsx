"use client";

import React, {useEffect, useState, useCallback, useMemo} from "react";
import {Ellipsis, Eye} from "lucide-react";
import {Button} from "../ui/button";
import Table from "../ui/table";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {type Tutor, tutorColumns} from "@/utils/analytic-data";
import {Icon} from "@iconify/react/dist/iconify.js";
import {useRouter} from "next/navigation";
import {fetchTutorList} from "./analytic.service";
import {useUserHook} from "@/hooks/useUser";
import {useRole} from "../ui/Context/UserContext";
import TableLoader from "../shared/table-loader";
import {Avatar} from "../shared/avatar";
import {NoData} from "../shared/NoData";
import {exportToPDF} from "@/utils/exportToPDF";

interface TutorListProps {
  departmentId: string | null;
  orgId: string;
}

const TagList = React.memo(({items}: {items?: string[]}) => {
  const tagElements = useMemo(() => {
    if (!items || items.length === 0) return [];

    return (
      <div className="py-2">
        <div
          className={`flex flex-wrap gap-1 max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[200px] ${
            items.length > 2
              ? "max-h-[40px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200"
              : ""
          }`}
        >
          {items.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="bg-[#F9DB6F66] text-[13px] sm:text-[14px] md:text-[15.93px] px-2 sm:px-3 rounded-full h-[32px] sm:h-[36px] md:h-[38px] items-center text-center flex truncate min-w-0"
              title={item}
            >
              <span className="truncate">{item}</span>
            </span>
          ))}
        </div>
      </div>
    );
  }, [items]);

  return tagElements;
});

TagList.displayName = "TagList";

const DropdownMenuContent = React.memo(
  ({
    onViewClick,
    onExportPDF,
    tutor,
  }: {
    onViewClick: (tutor: Tutor) => void;
    onExportPDF: (tutor: Tutor) => void;
    tutor: Tutor;
  }) => (
    <DropdownMenu.Content
      side="bottom"
      align="end"
      sideOffset={4}
      className="min-w-[200px] bg-[#222222] border border-[#333] rounded-md shadow-lg py-2 p-2 z-50"
    >
      <DropdownMenu.Item
        className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer"
        onClick={() => onExportPDF(tutor)}
      >
        <Icon icon="proicons:pdf" width="24" height="24" />
        <span>Export as PDF</span>
      </DropdownMenu.Item>
      <DropdownMenu.Item
        className="flex items-center gap-2 px-3 py-2 text-white hover:bg-[#F9DB6F33] hover:text-[#F9DB6F] cursor-pointer"
        onClick={() => onViewClick(tutor)}
      >
        <Eye className="h-4 w-4" />
        <span>View</span>
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  )
);

DropdownMenuContent.displayName = "DropdownMenuContent";

const TutorList = ({orgId}: TutorListProps) => {
  const {userData} = useUserHook();
  const {roleAccess} = useRole();
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadTutors = useCallback(async () => {
    if (!orgId) return;

    try {
      setLoading(true);
      setError(null);

      const tutors = await fetchTutorList(orgId);
      if (tutors) {
        let filteredTutorList = tutors;

        // Apply role-based filtering
        if (roleAccess === "admin" && userData?.team_id) {
          // Admin can only see tutors where category matches their team_id
          filteredTutorList = tutors.filter((tutor: Tutor) => {
            return tutor.category === userData.team_id;
          });
        }
        // If roleAccess === "owner", show all tutors (no additional filtering needed)

        setFilteredTutors(filteredTutorList);
      }
    } catch (error) {
      setError("Failed to load tutors. Please try again later.");
      console.error("Error loading tutors:", error);
    } finally {
      setLoading(false);
    }
  }, [orgId, roleAccess, userData]);

  useEffect(() => {
    loadTutors();
  }, [loadTutors]);

  const handleViewTutorScore = useCallback(
    (tutor: Tutor) => {
      router.push(`/analytics?id=${tutor.id}`);
    },
    [router]
  );

  const exportSingleTutorToPDF = useCallback((tutor: Tutor) => {
    const filteredTutorData = {
      name: tutor.name,
      email: tutor.email,
      averageScore: tutor.averageScore,
      strengths: tutor.strengths,
      opportunities: tutor.opportunities,
      completionRate: tutor.completionRate,
      totalPaths: tutor.totalPaths,
      completedPaths: tutor.completedPaths,
    };

    exportToPDF({
      title: "Tutor Details",
      filename: `tutor-${
        tutor.name?.replace(/\s+/g, "-").toLowerCase() || "details"
      }`,
      data: filteredTutorData,
      type: "details",
      headers: {
        name: "Name",
        email: "Email",
        averageScore: "Average Score",
        strengths: "Strengths",
        opportunities: "Opportunities",
        completionRate: "Completion Rate",
        totalPaths: "Total Paths",
        completedPaths: "Completed Paths",
      },
    });
  }, []);

  const exportAllTutorsToPDF = useCallback(() => {
    if (filteredTutors.length === 0) return;

    exportToPDF({
      title: "Tutors List",
      filename: "tutors-list",
      data: filteredTutors,
      type: "table",
      columns: [
        "name",
        "email",
        "averageScore",
        "completionRate",
        "strengths",
        "opportunities",
      ],
      headers: {
        name: "Name",
        email: "Email",
        averageScore: "Tutor Score",
        completionRate: "Completion Rate",
        strengths: "Strengths",
        opportunities: "Opportunities",
      },
    });
  }, [filteredTutors]);

  const cellRenderers = useMemo(
    () => ({
      strengths: (row: Tutor) => <TagList items={row.strengths} />,
      opportunities: (row: Tutor) => <TagList items={row.opportunities} />,
      name: (row: Tutor) => (
        <Avatar profilePicture={row.profile_picture} name={row.name} />
      ),
    }),
    []
  );

  const renderTutorCell = useCallback(
    (column: string, row: Tutor) => {
      const renderer = cellRenderers[column as keyof typeof cellRenderers];
      return renderer ? renderer(row) : row[column as keyof Tutor];
    },
    [cellRenderers]
  );

  const renderRowActionsTutor = useCallback(
    (row: Tutor) => (
      <div className="flex justify-start">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="h-[28px] w-[28px] flex items-center justify-center text-lg cursor-pointer bg-transparent hover:bg-[#333] rounded">
              <Ellipsis className="h-5 w-5 text-white" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenuContent
            onViewClick={handleViewTutorScore}
            onExportPDF={exportSingleTutorToPDF}
            tutor={row}
          />
        </DropdownMenu.Root>
      </div>
    ),
    [handleViewTutorScore, exportSingleTutorToPDF]
  );

  const tableColumns = useMemo(() => tutorColumns.slice(0, -1), []);

  const errorContent = useMemo(
    () => (
      <div className="bg-[#191919] rounded-[30px] p-10 mb-8 relative">
        <div className="text-red-500">{error}</div>
      </div>
    ),
    [error]
  );

  const headerContent = useMemo(
    () => (
      <div className="flex justify-between mb-4 flex-wrap items-center">
        <div className="flex items-center gap-4">
          <h3 className="font-urbanist text-[24px] leading-[21.9px] tracking-[0] font-medium">
            Tutors
          </h3>
        </div>
        <Button
          className="w-[52px] h-[50px] bg-[#333333] hover:bg-[#333333] rounded-lg border flex items-center justify-center gap-[10px] cursor-pointer"
          onClick={exportAllTutorsToPDF}
          disabled={loading || filteredTutors.length === 0}
        >
          <Icon
            icon="bi:filetype-pdf"
            width="24"
            height="24"
            color="white"
            className="cursor-pointer"
          />
        </Button>
      </div>
    ),
    [exportAllTutorsToPDF, loading, filteredTutors.length]
  );

  if (error) {
    return errorContent;
  }

  return (
    <div className="bg-[#191919] rounded-[30px] p-10 mb-8 relative">
      {headerContent}
      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <TableLoader />
        ) : filteredTutors.length === 0 ? (
          <NoData />
        ) : (
          <div className="min-w-[800px]">
            <Table
              columns={tableColumns}
              data={filteredTutors}
              renderCell={renderTutorCell}
              renderActions={renderRowActionsTutor}
              tableClassName="w-full text-sm table-fixed"
              headerClassName="bg-[#F9DB6F] text-black text-left font-urbanist font-medium text-[13px] sm:text-[14px] md:text-[15.93px] leading-[21.9px] tracking-[0]"
              bodyClassName="divide-y divide-gray-700"
              cellClassName="py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 border-t border-[#E0EAF5] relative overflow-hidden font-urbanist font-medium text-[13px] sm:text-[14px] md:text-[15.93px] leading-[21.9px] tracking-[0] align-top"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(TutorList);
