"use client";

import {useState} from "react";
import Image from "next/image";
import AIChat from "@/components/shared/AI-chat";
import {KnowledgeBaseDraft} from "@/components/Knowledge-Base/knowledge-base-drafts";

export default function KnowledgeBasePage() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="relative">
      <KnowledgeBaseDraft />

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

      {/* Conditionally Render Chat */}
    </div>
  );
}
