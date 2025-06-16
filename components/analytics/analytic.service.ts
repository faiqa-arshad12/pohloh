import {apiUrl} from "@/utils/constant";

export const fetchTeams = async (orgId: string) => {
  try {
    const response = await fetch(`${apiUrl}/teams/organizations/${orgId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch teams");
    }

    const teamsData = await response.json();
   return teamsData.teams;
  } catch (error) {
    console.error("Error fetching teams:", error);
  }
};
