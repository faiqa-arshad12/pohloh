"use client";
import {Search, X} from "lucide-react";
import {useCallback, useEffect, useMemo, useState} from "react";
import {Input} from "../ui/input";
import {Button} from "../ui/button";
import Image from "next/image";
import Loader from "../shared/loader";
import {ShowToast} from "../shared/show-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiUrl } from "@/utils/constant";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  user_role: string;
  profile_picture?: string;
  users_team?: {
    name: string;
  };
}

interface ReassignUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  cardId: string;
  currentAssigneeId?: string;
}


export function ReassignUserModal({
  isOpen,
  onClose,
  orgId,
  cardId,
  currentAssigneeId,
}: ReassignUserModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!orgId) return;

    setIsLoadingUsers(true);
    try {
      const response = await fetch(
        `${apiUrl}/users/organizations/${orgId}`,
        {
          method: "GET",
          headers: {"Content-Type": "application/json"},
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch user details");

      const {data} = await response.json();
      const filteredUsers = currentAssigneeId
        ? data.filter((user: User) => user.id !== currentAssigneeId)
        : data;
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [orgId, currentAssigneeId]);

  const handleAssignUser = useCallback(
    async (userId: string) => {
      setAssigningUserId(userId);
      try {
        await fetch(`${apiUrl}/cards/${cardId}`, {
          method: "PUT",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({card_owner_id: userId}),
          credentials: "include",
        });

        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        ShowToast("User has been successfully assigned", "success");
        onClose();
      } catch (error) {
        console.error("Error assigning user:", error);
        ShowToast("Error assigning user", "error");
      } finally {
        setAssigningUserId(null);
      }
    },
    [cardId, onClose]
  );

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.user_role.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#121212] text-white rounded-lg w-[90vw] max-w-[836px] max-h-[571px] overflow-y-auto border-none">
        <DialogHeader>
          <div className="flex justify-between items-center mb-6">
            <DialogTitle className="text-2xl font-medium">
              Reassign User
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-[#828282] rounded-full py-3 pl-12 pr-4 text-white focus:outline-none h-[60px]"
          />
        </div>

        {isLoadingUsers ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F9DB6F]" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchQuery ? "No matching users found" : "No users available"}
          </div>
        ) : (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-7">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="border-b border-[#E0EAF5] pb-4 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#222] flex items-center justify-center">
                      <Image
                        src={user.profile_picture || "/pic1.png"}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-full h-full object-cover"
                        width={48}
                        height={48}
                      />
                    </div>
                    <div>
                      <div className="font-medium">{`${user.first_name} ${user.last_name}`}</div>
                      <div className="text-sm text-[#F9DB6F]">
                        {user.user_role}
                      </div>
                    </div>
                    <div className="text-[14px] text-[#F9DB6F] px-3 bg-[#FFFFFF0A] rounded-[20px] h-[35px] items-center flex flex-row justify-center">
                      {user.users_team?.name || "N/A"}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAssignUser(user.id)}
                    disabled={assigningUserId === user.id}
                    className="bg-[#F9DB6F] hover:bg-[#F9DB6F]/90 text-black px-4 py-2 rounded-md text-sm font-medium min-w-[100px] cursor-pointer"
                  >
                    {assigningUserId === user.id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2" />
                        <Loader />
                      </div>
                    ) : (
                      "Assign"
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
