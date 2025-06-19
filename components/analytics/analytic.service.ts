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
export const fetchTutorList = async (orgId: string) => {
  try {
    const response = await fetch(`${apiUrl}/users/tutors/${orgId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch teams");
    }

    const tutors = await response.json();
    return tutors.tutors;
  } catch (error) {
    console.error("Error fetching teams:", error);
  }
};
export const fetchLearningPathsInsights = async (orgId: string) => {
  try {
    const response = await fetch(
      `${apiUrl}/users/learning-paths-insights/${orgId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch teams");
    }

    const res = await response.json();
    return res.paths;
  } catch (error) {
    console.error("Error fetching teams:", error);
  }
};
export const fetchCards = async (orgId: string, role: string, id: string) => {
  try {
    const cardsRes = await fetch(`${apiUrl}/cards/organizations/${orgId}`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        role: role,
        userId: id,
      }),
    });

    if (!cardsRes.ok) throw new Error("Failed to fetch cards");

    const {cards} = await cardsRes.json();
    return cards;
  } catch (error) {
    console.error("Error fetching cards:", error);
  }
};
export const fetchTutorScore = async (
  userId: string,
  category?: string | null
) => {
  try {
    let api;
    if (category)
      api = `${apiUrl}/users/average-tutor-score/${userId}?category=${category}`;
    else api = `${apiUrl}/users/average-tutor-score/${userId}`;

    const response = await fetch(api, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    });

    if (!response.ok) throw new Error("Failed to fetch cards");

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching cards:", error);
  }
};
export const fetchUserStats = async (userId: string) => {
  try {
    const response = await fetch(`${apiUrl}/users/stats/${userId}`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    });

    if (!response.ok) throw new Error("Failed to fetch user");

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching cards:", error);
  }
};
export const getUserCompletedCards = async (
  userId: string,
  orgId: string,
  team?: string,
  startDate?: string,
  endDate?: string
) => {
  try {
    const response = await fetch(
      `${apiUrl}/learning-paths/completed-path/${userId}`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          orgId,
          team,
          startDate,
          endDate,
        }),
      }
    );

    if (!response.ok) throw new Error("Failed to fetch user");

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching cards:", error);
  }
};
export const fetchTutorStats = async (
  userId: string,

  startDate?: string,
  endDate?: string,
  category?: string
) => {
  try {
    const response = await fetch(`${apiUrl}/users/tutor-stats/${userId}`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        category,
        startDate,
        endDate,
      }),
    });

    if (!response.ok) throw new Error("Failed to fetch user");

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching cards:", error);
  }
};
export const fetchLeaderBoard = async (
  userId: string,

  startDate?: string,
  endDate?: string,
  category?: string
) => {
  try {
    const response = await fetch(`${apiUrl}/users/leaderboard/${userId}`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        category,
        startDate,
        endDate,
      }),
    });

    if (!response.ok) throw new Error("Failed to fetch user");

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching cards:", error);
  }
};
export const fetchLeaningPathPerformance = async (userId: string) => {
  try {
    const response = await fetch(`${apiUrl}/learning-paths/performance/${userId}`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},

    });

    if (!response.ok) throw new Error("Failed to fetch user");

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching cards:", error);
  }
};

