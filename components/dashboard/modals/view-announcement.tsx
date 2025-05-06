import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

export default function ViewAnnouncementModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: (isSaved: boolean) => void;
}) {
  const handleCancel = () => {
    onClose(false); // Cancel action
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="overflow-y-auto w-full max-w-[864px] h-auto bg-[#222222] text-white border-none">
        <DialogHeader>
          <DialogTitle className="text-[32px] flex flex-col">Announcement

          <span className="font-urbanist font-normal text-sm leading-6 align-middle text-[#828282]">
            Invite more users to get in this platform.
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Custom layout content — moved outside DialogDescription */}
        <div className="flex flex-col gap-3 px-1 pb-4">
          <div className="h-[1px] bg-[#828282] mb-2" />

          {/* <div className="w-full">
            <Image
              src="/view-announcements.svg"
              className="w-full"
              alt="Announcements Banner"
              width={800}
              height={10}
            />
          </div> */}
          <div className="w-full h-[180px]">
            <Image
              src="/announcement.svg"
              className="w-full h-[150px] object-cover rounded-xl"
              alt="Announcement icon"
              width={10}
              height={10}
            />
          </div>
          {/* <h3 > */}
            {/* ☀️  Exciting Summer Promotions Are Here! 🔈 */}
            <div  className="flex items-center justify-center ">
              <h3 className="text-center font-normal text-[20px] mt-2">☀️ Exciting Summer Promotions Are Here!</h3>

            <Image
              src="/announIcon.jpg"
              style={{width: "25px", height: "25px", marginTop:12 ,marginLeft:'5px'}}
              width={10}
              height={10}
              alt="annoucement"
            />
              </div>
          {/* </h3> */}
          <p className="mt-2 text-[#CDCDCD]  font-light text-[20px] leading-[100%] tracking-[0] font-urbanist whitespace-pre-line">
            Dear Team,
            <span className="block mt-10 mb-10">
              Get ready for an exciting summer! We’re thrilled to introduce
              special Summer Promotions packed with exclusive deals, discounts,
              and fun activities. Stay tuned for more details on how you can
              participate and make the most of this season! Let’s make this
              summer unforgettable!
            </span>
            <span className="block my-2">
              <p>Best Regards,</p>
              <p className="mt-2">POHLOH</p>
            </span>
          </p>

          <div className="flex items-center justify-between bg-[#121212] p-4 rounded-full w-full text-white mt-2">
            <div className="flex items-center gap-2">
              <Image
                src="/placeholder-profile.svg"
                alt="User Avatar"
                width={24}
                height={24}
                className="rounded-full object-cover"
              />
              <span className="text-[14px] font-normal text-white">
                Markle James
              </span>
            </div>
            <span className="text-[14px] text-[#828282]">
              05:33 pm | 20th March, 2025
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
