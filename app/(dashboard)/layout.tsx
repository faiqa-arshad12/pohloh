"use client";

import {useEffect, useState} from "react";
import {usePathname} from "next/navigation";
import {Header} from "@/components/shared/header";
import Image from "next/image";
import NotificationsPanel from "@/components/shared/notifications";
import {useUser} from "@clerk/nextjs";
import {useRole} from "@/components/ui/Context/UserContext";
import {Role} from "@/types/types";
import {apiUrl, users} from "@/utils/constant";
import RenewSubscription from "@/components/dashboard/modals/renew-subscription";

export default function ClientLayout({children}: {children: React.ReactNode}) {
  const [showAllNotifications, setShowAllNotifications] = useState(true);
  const pathname = usePathname();
  const {user} = useUser();

  const {setRoleAccess} = useRole();
  const isDashboard = pathname === "/dashboard";
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [userData, setUserData] = useState<any>();

  useEffect(() => {
    if (user) {
      const shouldShowModal =
        !user.unsafeMetadata?.is_subscribed &&
        !user.publicMetadata?.is_subscribed;
      setShowRenewModal(shouldShowModal);
    }
  }, [user]);

  useEffect(() => {
    const createUser = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/${users}/onboarding-data/${user?.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            // credentials: "include",
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to create user: ${response.status} - ${errorText}`
          );
        }

        const result = await response.json();
        setUserData(result.data);
        if (result.data.role) setRoleAccess(result.data.role as Role);
      } catch (err) {
        console.error("Error creating user:", err);
      }
    };

    if (user) {
      createUser();
    }
  }, [user, setRoleAccess]);

  return (
    <div
      className={`font-urbanist min-h-screen flex flex-col relative font-urbanist ${
        isDashboard ? "" : "bg-black"
      }`}
    >
      {/* {showRenewModal && <RenewSubscription open={showRenewModal} />} */}

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
      <div className={`flex min-h-screen flex-col`}>
        <Header
          showAllNotifications={showAllNotifications}
          setShowAllNotifications={setShowAllNotifications}
          userData={userData}
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
