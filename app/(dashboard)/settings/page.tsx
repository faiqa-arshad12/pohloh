"use client";
import Account from "@/components/settings/accounts";
import AIChat from "@/components/shared/AI-chat";
import Image from "next/image";
import React, {Suspense, useState} from "react";

export default function SettingsPage() {
  // Changed component name to PascalCase
  const [showChat, setShowChat] = useState(false);
  
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Account />
      </Suspense>
      <div
        className="fixed bottom-4 right-4 z-50 cursor-pointer hover:scale-105 transition-transform"
        onClick={() => setShowChat((prev) => !prev)}
        title="Open Chat"
      >
        {!showChat && (
          <Image
            src="/file.png"
            alt="Open Chat"
            width={80}
            height={80}
            className="rounded-full"
          />
        )}
        {showChat && <AIChat onClose={() => setShowChat(false)} />}
      </div>
    </div>
  );
}
