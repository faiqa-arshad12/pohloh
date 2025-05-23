"use client";
import {X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Loader from "../shared/loader";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  title?: string;
  isLoading?: boolean;
  id: string | null;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  isLoading = false,
  id,
}: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-[#1a1a1a] border-none rounded-lg w-full max-w-2xl h-[298px]"
        style={{borderRadius: "30px"}}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-2xl font-medium">
              {`Delete ${title}`}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="mb-8">
          <p className="text-[#F9DB6F] text-[32px]">{`  Do you want to delete
 ${title}?`}</p>
        </div>

        <div className="flex justify-between flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-[#333333] hover:bg-[#444444] hover:text-[white] text-white border-0 rounded-md py-2 h-[47px] w-[166px] cursor-pointer"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (onConfirm && id!==null) onConfirm(id);
            }}
            disabled={isLoading}
            className="bg-[#f0d568] hover:bg-[#e0c558] text-black font-medium rounded-md py-2 h-[48px] w-[full] w-[210px] cursor-pointer"
          >
            {isLoading ? <Loader /> : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
