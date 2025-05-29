"use client";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Loader from "./loader";

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title?: string;
  question?: string;
  isLoading?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export default function QuestionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  question,
  isLoading = false,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
}: QuestionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-[#1a1a1a] border-none rounded-lg w-full max-w-2xl h-[298px]"
        style={{borderRadius: "30px"}}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-2xl font-medium">
              {title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="mb-8">
          <p className="text-[#F9DB6F] text-[32px]">{question}</p>
        </div>

        <div className="flex justify-between flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-[#333333] hover:bg-[#444444] hover:text-[white] text-white border-0 rounded-md py-2 h-[47px] w-[166px] cursor-pointer"
            disabled={isLoading}
          >
            {cancelButtonText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-[#f0d568] hover:bg-[#e0c558] text-black font-medium rounded-md py-2 h-[48px] w-[full] w-[210px] cursor-pointer"
          >
            {isLoading ? <Loader /> : confirmButtonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
