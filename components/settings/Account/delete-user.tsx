import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {ShowToast} from "@/components/shared/show-toast";
import Loader from "@/components/shared/loader";
import {AlertTriangle} from "lucide-react";
import {deleteUser} from "@/actions/auth";

interface DeleteUserModalProps {
  open: boolean;
  UserDetails: any;
  onOpenChange: (open: boolean) => void;
}

export function DeleteUserModal({
  open,
  onOpenChange,
  UserDetails,
}: DeleteUserModalProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!UserDetails?.user_id) {
      ShowToast("Invalid user ID.", "error");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteUser(UserDetails.user_id);
      console.log("Delete Response:", res);
      console.log("User Details:", UserDetails);
      if (res.success) {
        ShowToast("User deleted successfully", "success");
        onOpenChange(false);
      } else {
        ShowToast(res.message || "Failed to delete user", "error");
      }

      // ShowToast("User deleted successfully", "success");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error deleting user:", error?.message || error);
      ShowToast("Failed to delete user. Please try again.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-[#1a1a1a] border-none rounded-lg w-full max-w-2xl h-[298px]"
        style={{borderRadius: "30px"}}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-2xl font-medium">
              Delete {UserDetails?.role === "admin" ? "Lead" : "User"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="mb-8">
          <p className="text-[#F9DB6F] text-[32px]">
            Do you want to delete this user?
          </p>
        </div>

        {/* <p className="text-center text-[#FFFFFF80] mb-6 max-w-md">
            You are about to delete{" "}
            <span className="font-semibold text-white">
              {UserDetails?.user_name}
            </span>
            . This action cannot be undone and will remove all associated data.
          </p>

          {UserDetails?.role === "admin" && (
            <div className="bg-[#FF4D4F20] p-4 rounded-md mb-6 text-[#FF4D4F] text-sm">
              Warning: This user is an admin. Deleting them may affect team
              leadership.
            </div>
          )} */}

        {/* Action Buttons */}
        <div className="flex justify-between flex-row">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
            className="bg-[#333333] hover:bg-[#444444] hover:text-[white] text-white border-0 rounded-md py-2 h-[47px] w-[166px] cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDeleteUser}
            className="bg-[#f0d568] hover:bg-[#e0c558] text-black font-medium rounded-md py-2 h-[48px] w-[full] w-[210px] cursor-pointer"
            disabled={isDeleting}
          >
            {isDeleting ? <Loader /> : "Delete User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
