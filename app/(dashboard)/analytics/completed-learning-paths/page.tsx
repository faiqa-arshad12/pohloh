"use client";

import CompletedLearningPathsList from "@/components/analytics/completed-learning-path-list";
import AIChat from "@/components/shared/AI-chat";
import Image from "next/image";
import React, {useEffect, useState} from "react";

export default function CompletedLearnignPath() {
  const [showChat, setShowChat] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUserId(params.get("userId"));
  }, []);
  return (
    <div>
      <CompletedLearningPathsList userId={userId} />
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
