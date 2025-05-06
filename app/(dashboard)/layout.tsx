"use client";

import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import {Header} from "@/components/shared/header";
import Image from "next/image";
import NotificationsPanel from "@/components/shared/notifications";
import { useUser } from "@clerk/nextjs";
import { useRole } from "@/components/ui/Context/UserContext";
import { Role } from "@/types/types";
import { users } from "@/utils/constant";

export default function ClientLayout({children}: {children: React.ReactNode}) {
  const [showAllNotifications, setShowAllNotifications] = useState(true);
  const pathname = usePathname();
  const {user} = useUser();
  const {setRoleAccess} = useRole();
  const isDashboard = pathname === "/dashboard";

  useEffect(() => {
    const createUser = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/${users}/${user?.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to create user: ${response.status} - ${errorText}`
          );
        }

        const result = await response.json();
        // console.log("User created:", result);
        if (result.user.role) setRoleAccess(result.user.role as Role);

      } catch (err) {
        console.error("Error creating user:", err);
      }
    };

    if (user) {
      createUser();
    }
  }, [user]);


    // useEffect(() => {
    //   const fetch = async() =>{

    //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${users}/user`, {
    //             method: "POST",
    //             headers: {
    //               "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify(userData),
    //             credentials: "include", // Include credentials if needed
    //           });

    //           if (!response.ok) {
    //             const errorText = await response.text();
    //             throw new Error(
    //               `Failed to create user: ${response.status} - ${errorText}`
    //             );
    //           }

    //           const result = await response.json();


    //     if (user) {
    //       const role = user.unsafeMetadata?.role;
    //       if (role) setRoleAccess(role as Role);
    //     }
    //   }
    // }, [user]);

  return (
    <div
      className={`antialiased min-h-screen flex flex-col relative ${
        isDashboard ? "" : "bg-black"
      }`}
    >
      {/* Gradient background only on /dashboard */}
      {isDashboard && (
        <div className="gradient-background fixed inset-0 -z-10">
          <Image
            src="/Gradient.png"
            alt="Gradient background"
            fill
            style={{objectFit: "cover"}}
            quality={100}
            priority
          />
        </div>
      )}

      <div className="flex min-h-screen flex-col">
        <Header
          showAllNotifications={showAllNotifications}
          setShowAllNotifications={setShowAllNotifications}
        />

        {showAllNotifications ? (
          <main className="flex-1 px-16 pt-30 pb-10 overflow-hidden">
            <div className="h-full overflow-auto">{children}</div>
          </main>
        ) : (
          <main className="px-16 pt-30 pb-10 overflow-hidden">
            <NotificationsPanel />
          </main>
        )}
      </div>
    </div>
  );
}
