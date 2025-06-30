import React from "react";
import PaymentPage from "./payment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
const PaymentModal = ({
  openEdit,
  handleOpenModal,
  setOpenEdit,
  clientSecret,
}: {
  openEdit: boolean;
  handleOpenModal: () => void;
  setOpenEdit: (open: boolean) => void;
  clientSecret: string;
}) => {
  return (
    <Dialog open={openEdit} onOpenChange={handleOpenModal}>
      <DialogContent className="overflow-y-auto w-full max-w-[864px] h-auto bg-[#222222] text-white border-none bg-[#0E0F11]">
        <DialogHeader>
          <DialogTitle className="text-[32px]">Payment Method</DialogTitle>
        </DialogHeader>
        <div className="w-full">
          <PaymentPage
            clientSecret={clientSecret || ""}
            setOpen={setOpenEdit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
