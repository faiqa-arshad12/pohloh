"use client";

import {X, ArrowRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ChooseTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: any;
  onTeamSelect?: (teamId: string) => void;
  selectedTeam:any
}

export default function ChooseTeamModal({
  isOpen,
  onClose,
  teams,
  onTeamSelect,
  selectedTeam
}: ChooseTeamModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-[#1a1a1a] border-none rounded-[20px] w-full max-w-3xl p-6 max-h-[70vh] overflow-auto"
        style={{borderRadius: "20px"}}
      >
        <DialogHeader className="mb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl font-semibold">
              Choose Team
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="flex flex-col space-y-4 mb-6">
  {teams.map((team: any) => (
    <button
      key={team.id}
      onClick={() => onTeamSelect && onTeamSelect(team)}
      className={`flex justify-between items-center px-4 py-3 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded-md transition-all duration-200 cursor-pointer ${
        selectedTeam?.id === team.id ||selectedTeam === team.id ? "border " : ""
      }`}
    >
      <span>{team.name} Team</span>
      <ArrowRight className="text-[#FFD700]" />
    </button>
  ))}
</div>


        <Button
          variant="outline"
          onClick={onClose}
          className="bg-[#333333] hover:bg-[#444444] hover:text-[white] text-white border  rounded-md py-2 h-[47px] w-[full] cursor-pointer"

        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}
