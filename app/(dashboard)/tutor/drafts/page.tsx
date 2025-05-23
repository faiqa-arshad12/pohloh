"use client";

import AIChat from "@/components/shared/AI-chat";
import Drafts from "@/components/tutor/draft";
import Image from "next/image";
import React, {useState} from "react";

export default function Page() {
  const [showChat, setShowChat] = useState(false);
  return (
    <div>
      <Drafts />
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
