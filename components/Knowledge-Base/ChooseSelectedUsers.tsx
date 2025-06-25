"use client";

import {Check} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {useEffect, useState} from "react";
import {apiUrl} from "@/utils/constant";
import Loader from "../shared/loader";

interface ChooseTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (users: any) => void;
  org: any;
}

export default function SelectUserModal({
  isOpen,
  onClose,
  org,
  onConfirm,
}: ChooseTeamModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!org) return;

      setIsLoading(true);
      setError(null);

      try {
        const orgResponse = await fetch(
          `${apiUrl}/users/organizations/${org}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            // // credentials: "include",
          }
        );

        if (!orgResponse.ok) {
          throw new Error("Failed to fetch users");
        }

        const {data} = await orgResponse.json();
        console.log(data, "data");
        setUsers(data || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setError("Failed to load users. Please try again.");
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (org && isOpen) {
      fetchUsers();
      setSelectedUserIds(new Set());
    }
  }, [org, isOpen]);

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      const updated = new Set(prev);
      if (updated.has(userId)) {
        updated.delete(userId);
      } else {
        updated.add(userId);
      }
      return updated;
    });
  };

  const handleConfirm = () => {
    const selected = users.filter((u: any) => selectedUserIds.has(u.id));
    onConfirm(selected);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="bg-[#1a1a1a] border-none rounded-[20px] w-full max-w-3xl p-6 max-h-[70vh] overflow-auto"
        style={{borderRadius: "20px"}}
      >
        <DialogHeader className="mb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl font-semibold">
              Choose Users
            </DialogTitle>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader />
            <p className="mt-4 text-gray-400">Loading users...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-red-400 mb-4">{error}</p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              Retry
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-gray-400">No users found in this team</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col space-y-6 mb-6">
              {users.map((user) => {
                const fullName = `${user.first_name} ${user.last_name || ""}`;
                const isSelected = selectedUserIds.has(user.id);

                return (
                  <div
                    key={user.id}
                    className={`flex justify-between items-center px-4 py-3 rounded-md  transition-all duration-200
                      ${
                        isSelected ? "bg-[#333333]" : "bg-[#2a2a2a]"
                      } hover:bg-[#444444]`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">
                        {fullName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {user?.users_team?.name || "N/A"}
                      </span>
                    </div>

                    {isSelected ? (
                      <Check className="text-[#FFD700] w-5 h-5" />
                    ) : (
                      <button
                        onClick={() => {
                          toggleUser(user.id);
                        }}
                        className="text-sm bg-[#F9DB6F] text-black font-medium font-urbanist py-1 px-3 rounded-md hover:opacity-80 opacity-100 cursor-pointer w-[125px]"
                        style={{borderRadius: "5.5px"}}
                      >
                        Add User
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between flex-row">
              <Button
                variant="outline"
                onClick={onClose}
                className="bg-[#333333] hover:bg-[#444444] hover:text-[white] text-white border rounded-md py-2 h-[47px] w-[166px] cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={selectedUserIds.size === 0 || isLoading}
                className="bg-[#f0d568] hover:bg-[#e0c558] text-black font-medium rounded-md py-2 h-[48px] w-[210px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader /> : "Submit"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
