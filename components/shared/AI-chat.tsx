"use client";

import {useState, useRef, useEffect} from "react";
import {X, Send, Plus, Loader2} from "lucide-react";
import {Input} from "../ui/input";
import {Button} from "../ui/button";
import Image from "next/image";
import {useUserHook} from "@/hooks/useUser";
import {apiUrl_AI} from "@/utils/constant";
import {useRouter} from "next/navigation";
import Loader from "./loader";

type Message = {
  id: number;
  content: string;
  sender: "user" | "pohloh";
  avatar: string;
};

type SourceDocument = {
  id: string;
  title: string;
  organization_id: string;
  category: string;
  relevance_score: number;
};

type UserDocumentCount = {
  user_specific: number;
  public: number;
  total: number;
};

type AIResponse = {
  question: string;
  answer: string;
  source_documents: SourceDocument[];
  user_document_count: UserDocumentCount;
  knowledge_base_used: boolean;
  timestamp: string;
  success: boolean;
};

type AIChatProps = {
  onClose?: () => void;
};

export default function AIChat({onClose}: AIChatProps) {
  const {userData} = useUserHook();
  const router = useRouter();
  const userAvatar = userData?.profile_picture || "/placeholder.svg";
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  const playNotification = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.log("Error playing notification:", error);
      });
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hello! I'm Pohloh AI. How can I help you today?",
      sender: "pohloh",
      avatar: "/file.png",
    },
  ]);
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage: Message = {
        id: messages.length + 1,
        content: input,
        sender: "user",
        avatar: userAvatar,
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const response = await fetch(`${apiUrl_AI}/chat-bot/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_query: input,
            user_id: "ad2c8be5-b36a-44a2-8942-25f268ddc479",
            limit: 30,
          }),
        });

        const data: AIResponse = await response.json();
        console.log(data, "data");

        if (data.success) {
          // Format the answer with source documents
          let formattedAnswer = data.answer;
          if (data.source_documents && data.source_documents.length > 0) {
            formattedAnswer += "\n\nSources:";
            data.source_documents.forEach((doc, index) => {
              formattedAnswer += `\n${
                index + 1
              }. <a href="/knowledge-base?cardId=${
                doc.id
              }" target="_blank" rel="noopener noreferrer" class="text-yellow-400 hover:underline">${
                doc.title
              }</a> (Relevance: ${(doc.relevance_score * 100).toFixed(1)}%)`;
            });
          }

          const aiMessage: Message = {
            id: messages.length + 2,
            content: formattedAnswer,
            sender: "pohloh",
            avatar: "/file.png",
          };
          setMessages((prev) => [...prev, aiMessage]);
          playNotification();
        } else {
          // Handle error case
          const errorMessage: Message = {
            id: messages.length + 2,
            content: "Sorry, I encountered an error. Please try again.",
            sender: "pohloh",
            avatar: "/file.png",
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } catch (error) {
        const errorMessage: Message = {
          id: messages.length + 2,
          content: "Sorry, I encountered an error. Please try again.",
          sender: "pohloh",
          avatar: "/file.png",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(false);
    if (onClose) onClose();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Maximize chat");
  };

  if (!isExpanded) return null;

  return (
    <div
      className="h-[594px] w-[441px] flex items-center justify-center p-4 mb-4"
      onClick={handleClick}
    >
      <div className="w-full h-[594px] max-w-md bg-[#404040] rounded-lg shadow-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-[#F9DB6F] flex items-center justify-center mr-2 relative overflow-hidden">
              <Image
                src="/file.png"
                alt="Pohloh Avatar"
                fill
                className="object-cover rounded-full"
              />
            </div>
            <span className="font-medium text-white">Pohloh</span>
          </div>
          <div className="flex items-center space-x-2">
            {/*  */}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:bg-transparent hover:text-white"
              onClick={handleClose}
            >
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex flex-col flex-1 border border-[#F9DB6F38] bg-[#FFFFFF0A] mx-4 mb-2 rounded-2xl overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender !== "user" && (
                  <div className="w-8 h-8 rounded-full bg-[#F9DB6F] flex-shrink-0 mr-2 relative overflow-hidden">
                    <Image
                      src={message.avatar}
                      alt="Bot Avatar"
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.sender === "user"
                      ? "bg-[#F9DB6F] text-black"
                      : "bg-[#222324] text-white"
                  }`}
                  dangerouslySetInnerHTML={{__html: message.content}}
                />
                {message.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-white flex-shrink-0 ml-2 relative overflow-hidden">
                    <Image
                      src={message.avatar}
                      alt="User Avatar"
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="flex flex-col justify-end p-4">
            <div className="w-full flex-col bg-[#1E1E1E] rounded-[14.15px] px-4 py-3 flex items-center border border-[#F9DB6F38]">
              <Input
                type="text"
                placeholder="Ask Pohloh AI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !isLoading && handleSend()
                }
                className="w-full bg-transparent text-white placeholder:text-[#A0A0A0] border-none focus-visible:ring-0"
                autoFocus
                disabled={isLoading}
              />
              <div className="flex w-full justify-end mt-2">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    className="w-10 h-10 p-2 bg-[#F9DB6F] text-black hover:bg-[#F9DB6F]/90"
                    onClick={handleSend}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader />
                    ) : (
                      <Send size={20} />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
