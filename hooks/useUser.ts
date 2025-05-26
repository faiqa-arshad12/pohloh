import {apiUrl} from "@/utils/constant";
import {useUser} from "@clerk/nextjs";
import {useState, useEffect} from "react";

interface UserData {
  id: string;
  team_id: string;
  org_id: string;
  // Add other user properties as needed
}

export const useUserHook = () => {
  const {user} = useUser();
  const [userData, setUserData] = useState<any | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${apiUrl}/users/${user?.id}`, {
          method: "GET",
          headers: {"Content-Type": "application/json"},
          // credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to fetch user");
        const data = await response.json();
        setUserData(data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    if (user) fetchUserData();
  }, [user]);

  return {userData};
};
