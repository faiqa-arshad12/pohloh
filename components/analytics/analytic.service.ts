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
  category?: string | null,
  isPersonal?: boolean
) => {
  try {
    let api;
    if (category)
      api = `${apiUrl}/users/average-tutor-score/${userId}?category=${category}`;
    else api = `${apiUrl}/users/average-tutor-score/${userId}`;

    const response = await fetch(api, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        isPersonal,
      }),
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
  category?: string,
  isPersonal?: boolean
) => {
  try {
    const response = await fetch(`${apiUrl}/users/tutor-stats/${userId}`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        category,
        startDate,
        endDate,
        isPersonal,
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
    const response = await fetch(
      `${apiUrl}/learning-paths/performance/${userId}`,
      {
        method: "GET",
        headers: {"Content-Type": "application/json"},
      }
    );

    if (!response.ok) throw new Error("Failed to fetch user");

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching cards:", error);
  }
};

export const fetchLeaningPathInsightsByDept = async (userId: string) => {
  try {
    const response = await fetch(
      `${apiUrl}/learning-paths/departments-insights/${userId}`,
      {
        method: "GET",
        headers: {"Content-Type": "application/json"},
      }
    );

    if (!response.ok) throw new Error("Failed to fetch user");

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching cards:", error);
  }
};
export const reAssignUserLearningPath = async (pathId: string, data: any) => {
  try {
    const response = await fetch(`${apiUrl}/learning-paths/users/${pathId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to reassign learning path");
    }

    return await response.json();
  } catch (error) {
    console.error("Error reassigning learning path:", error);
    throw error;
  }
};
export const handleDeleteCard = async (id: string) => {
  const response = await fetch(`${apiUrl}/cards/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to Delete Knowledge Card");
  }

  return await response.json();
};
export const fetchALLSearches = async (orgId: string) => {
  const response = await fetch(`${apiUrl}/searches/organization/${orgId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to Find  search items");
  }

  return await response.json();
};
export const fetchALLSearchesByUser = async (
  orgId: string,
  userId: string,
  startDate?: string,
  endDate?: string
) => {
  const response = await fetch(
    `${apiUrl}/searches/organization/${orgId}/user/${userId}?startData=${startDate}&endDate=${endDate}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to Find  search items");
  }

  return await response.json();
};

export const fetchALLTrendingSearchesByUser = async (
  orgId: string,
  userId: string,
  startDate?: string,
  endDate?: string
) => {
  const response = await fetch(
    `${apiUrl}/searches/organization/${orgId}/user/${userId}/trending?startData=${startDate}&endDate=${endDate}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to Find  search items");
  }

  return await response.json();
};
export const fetchUserData = async (id: string) => {
  try {
    const response = await fetch(`${apiUrl}/users/${id}`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
      // credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch user");
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
};
export const fetchAllCards = async (orgId: string, userId: string) => {
  try {
    const response = await fetch(
      `${apiUrl}/cards/organizations/${orgId}/user/${userId}/last30days`,
      {
        method: "GET",
        headers: {"Content-Type": "application/json"},
        // credentials: "include",
      }
    );

    if (!response.ok) throw new Error("Failed to fetch user cards");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user cards:", error);
    throw error;
  }
};
export const getMonthlyKnowledgeCardStats = async (userId: string) => {
  try {
    const response = await fetch(`${apiUrl}/cards/monthly-stats/${userId}`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    });

    if (!response.ok) throw new Error("Failed to fetch user cards");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user cards:", error);
    throw error;
  }
};
export const getKnowledgeCardStats = async (userId: string) => {
  try {
    const response = await fetch(`${apiUrl}/cards/stats/${userId}`, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
      // credentials: "include",
    });

    if (!response.ok) throw new Error("Failed to fetch user cards");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user cards:", error);
    throw error;
  }
};
export const fetchUserGoalStatus = async (
  userId: string,
  from: string,
  to: string
) => {
  try {
    const url = `${apiUrl}/users/user-goals/${userId}?to=${to}&from=${from}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    });
    if (!response.ok) throw new Error("Failed to fetch user goal status");
    return await response.json();
  } catch (error) {
    console.error("Error fetching user goal status:", error);
    throw error;
  }
};
