import {useState} from "react";
import {useRouter} from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
type RenewSubscriptionProps = {
  open: boolean;
};

function RenewSubscription({open}: RenewSubscriptionProps) {
  const router = useRouter();
  const [RBC, setRBC] = useState<string>("Admin");
  const [openEdit, setOpenEdit] = useState<boolean>(open);
  const handleChange = () => {
    setOpenEdit(false);
  };

  return (
    <Dialog open={openEdit} onOpenChange={handleChange}>
      <DialogContent className="overflow-y-auto w-full max-w-[864px] h-auto bg-[#222222] text-white border-none">
        <DialogHeader>
          <DialogTitle className="text-[32px]">Subscription Expired</DialogTitle>
        </DialogHeader>
        <div>
          <div className="flex flex-col items-center text-white justify-center font-urbanist font-medium text-[24px] leading-[32px] tracking-[0] align-middle">
            Your current subscription plan has expired. Please renew to regain
            access to Pohloh.
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => setOpenEdit(false)}
              className="w-full h-[44px] rounded-md border border-white text-white font-urbanist font-semibold hover:bg-[#F9DB6F1a] transition"
            >
              Cancel
            </button>
            {RBC === "Admin" ? (
              <button
                type="submit"
                className="w-full h-[44px] rounded-md bg-[#F9DB6F] text-black font-urbanist font-semibold hover:opacity-90 transition"
                onClick={() => router.replace("/settings?page=2")}
              >
                Save Payment Method
              </button>
            ) : (
              <button
                type="submit"
                className="w-full h-[44px] rounded-md bg-[#F9DB6F] text-black font-urbanist font-semibold hover:opacity-90 transition"
                onClick={() => router.replace("/settings?page=5")}
              >
                logout
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RenewSubscription;
