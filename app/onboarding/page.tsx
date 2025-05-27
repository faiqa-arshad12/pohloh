"use client";
import {ProfileSetup} from "@/components/onboarding/profile-setup";
import Loader from "@/components/shared/loader";
import {Role, User} from "@/types/types";
import {apiUrl, users} from "@/utils/constant";
import {useUser} from "@clerk/nextjs";
import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";

const OnboardingPage = () => {
  const [userData, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {user} = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `${apiUrl}/${users}/${user.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            // credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUser(data.user);

        // Redirect to dashboard if status is approved
        if (data.user.status === "approved") {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader size={50} />
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div className="absolute top-0 left-0 z-50 flex items-center px-4 py-3 w-full">
        <div className="mr-2 rounded-full p-2">
          <img src="/file2.png" alt="Logo" className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-white">Pohloh</h1>
      </div>

      <div className="flex h-full w-full justify-center items-center">
        <ProfileSetup
          role={(userData?.role as Role) || "user"}
          org_id={userData?.org_id || ""}
        />
      </div>
    </div>
  );
};

export default OnboardingPage;
