// components/modules/dashboard/LogoutButton.tsx
"use client";

import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export const LogoutButton = () => {
  const { signOut } = useClerk();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Button className="text-center mt-20 text-red-600" onClick={handleLogout}>
      Unauthorized
    </Button>
  );
};
