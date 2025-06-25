import { useEffect, useState } from "react";
import { fetchCards } from "@/components/analytics/analytic.service";
import { useUserHook } from "./useUser";

export const useUnverifiedCards = () => {
  const { userData } = useUserHook();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUnverifiedCards = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (userData?.organizations?.id && userData?.id && userData?.role) {
          const allCards = await fetchCards(
            userData.organizations.id,
            userData.role,
            userData.id
          );
          if (allCards) {
            const unverified = allCards.filter((card: any) => card.is_verified === false);
            setCards(unverified);
          } else {
            setCards([]);
          }
        }
      } catch (err) {
        setCards([]);
      } finally {
        setIsLoading(false);
      }
    };
    getUnverifiedCards();
  }, [userData]);

  return { cards, isLoading, error };
};