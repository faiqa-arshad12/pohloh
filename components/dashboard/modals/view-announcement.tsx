import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {formatTimestamp} from "@/lib/dateFormat";
import {stripHtml} from "@/lib/stripeHtml";
import Image from "next/image";
import {useRouter} from "next/navigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function ViewAnnouncementModal({
  open,
  onClose,
  announcement,
  isLoading = false,
}: {
  open: boolean;
  onClose: (isSaved: boolean) => void;
  announcement: any;
  isLoading?: boolean;
}) {
  const handleCancel = () => {
    onClose(false); // Cancel action
  };
  const router = useRouter();
  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="overflow-y-auto w-full max-w-[864px] h-auto bg-[#222222] text-white border-none">
        <DialogHeader>
          <DialogTitle className="text-[32px] flex flex-col">
            Announcement
          </DialogTitle>
        </DialogHeader>

        {/* Custom layout content — moved outside DialogDescription */}
        <div className="flex flex-col gap-3 px-1 pb-4">
          <div className="h-[1px] bg-[#828282] mb-2" />

          {isLoading ? (
            // Skeleton loading state
            <>
              {/* Image skeleton */}
              <div className="w-full h-[180px]">
                <Skeleton
                  height={150}
                  className="w-full rounded-xl"
                  baseColor="#333"
                  highlightColor="#444"
                />
              </div>

              {/* Title skeleton */}
              <div className="flex items-center justify-center">
                <Skeleton
                  width={300}
                  height={30}
                  className="mt-2"
                  baseColor="#333"
                  highlightColor="#444"
                />
              </div>

              {/* Content skeleton */}
              <div className="mt-2">
                <Skeleton
                  width={100}
                  height={20}
                  className="mb-4"
                  baseColor="#333"
                  highlightColor="#444"
                />
                <Skeleton
                  count={5}
                  height={20}
                  className="my-1"
                  baseColor="#333"
                  highlightColor="#444"
                />
                <div className="my-6">
                  <Skeleton
                    width={120}
                    height={20}
                    className="mb-2"
                    baseColor="#333"
                    highlightColor="#444"
                  />
                  <Skeleton
                    width={180}
                    height={20}
                    baseColor="#333"
                    highlightColor="#444"
                  />
                </div>
              </div>

              {/* Footer skeleton */}
              <div className="bg-[#121212] p-4 rounded-full w-full mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton
                      circle
                      width={24}
                      height={24}
                      baseColor="#333"
                      highlightColor="#444"
                    />
                    <Skeleton
                      width={150}
                      height={14}
                      baseColor="#333"
                      highlightColor="#444"
                    />
                  </div>
                  <Skeleton
                    width={180}
                    height={14}
                    baseColor="#333"
                    highlightColor="#444"
                  />
                </div>
              </div>
            </>
          ) : (
            // Actual content
            <>
              <div className="w-full h-[180px]">
                <Image
                  src="/announcement.svg"
                  className="w-full h-[150px] object-cover rounded-xl"
                  alt="Announcement icon"
                  width={10}
                  height={10}
                />
              </div>

              <div className="flex items-center justify-center">
                <h3 className="text-center font-normal text-[20px] mt-2">
                  ☀️ {announcement.title}!
                </h3>

                <Image
                  src="/announIcon.jpg"
                  style={{
                    width: "25px",
                    height: "25px",
                    marginTop: 12,
                    marginLeft: "5px",
                  }}
                  width={10}
                  height={10}
                  alt="annoucement"
                />
              </div>

              <p className="mt-2 text-[#CDCDCD] font-light text-[20px] leading-[100%] tracking-[0] font-urbanist">
                Dear Team,
                <span className="block mt-10 mb-10">
                  {stripHtml(announcement.description)}
                </span>
                <span className="block mt-10 mb-10 flex justify-center">
  <a
    href={`/knowledge-base?cardId=${announcement?.card_id?.id}`}
    className="text-[#F9DB6F] hover:text-[#F9DB6F]/80 cursor-pointer underline"
    onClick={(e) => {
      e.preventDefault();
      router.push(`/knowledge-base?cardId=${announcement?.card_id?.id}`);
    }}
  >
    {announcement?.card_id?.title}
  </a>
</span>

                <span className="block my-2">
                  <p>Best Regards,</p>
                  <p className="mt-2">{announcement?.org_id.name}</p>
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
                    {`${announcement?.user_id?.first_name} ${announcement?.user_id?.last_name}`}
                  </span>
                </div>
                <span className="text-[14px] text-[#828282]">
                  {formatTimestamp(announcement?.created_at)}
                </span>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
