import React, {useCallback} from "react";
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
  onPaymentSuccess,
}: {
  openEdit: boolean;
  handleOpenModal: () => void;
  setOpenEdit: (open: boolean) => void;
  clientSecret: string;
  onPaymentSuccess?: () => void;
}) => {
  return (
    <Dialog open={openEdit} onOpenChange={handleOpenModal}>
      <DialogContent className="overflow-y-auto w-full max-w-[864px] h-auto bg-[#222222] text-white border-none bg-[#0E0F11] max-h-[90vh] py-4">
        <DialogHeader>
          <DialogTitle className="text-[32px]">Payment Method</DialogTitle>
          <div className="bg-[#828282] h-[1px] my-2" />
        </DialogHeader>
        <div className="w-full">
          <PaymentPage
            clientSecret={clientSecret || ""}
            setOpen={setOpenEdit}
            onPaymentSuccess={() => {
              if (onPaymentSuccess) {
                console.log("Calling onPaymentSuccess after payment success");
                onPaymentSuccess();
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
