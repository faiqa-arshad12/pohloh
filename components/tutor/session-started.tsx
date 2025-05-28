import React, {ReactNode} from "react";
import {Send} from "lucide-react";
import Image from "next/image";

const sessionData = [
  {
    id: 1,
    question:
      "A customer is experiencing difficulties with our mobile application. What is the first step you should do?",
    options: [
      "Alert your manager",
      "Create a Tech ticket",
      "Collect Information",
    ],
    answer:
      "You know your stuff nailed! The first step is to always collect necessary information like what issues the customer is experiencing, what device they are using, and customer details.",
  },
  {
    id: 2,
    question:
      "A user reports a bug that crashes the app when uploading photos. What should you do first?",
    options: ["Type answer"],
    answer: [
      <span key="1">
        Not quite!{" "}
        <span className="text-[#F9DB6F]">The correct answer is 24.</span>
      </span>,
      <span key="2">You can learn more about this in the card warranty.</span>,
    ],
  },
  {
    id: 2,
    question:
      "A user reports a bug that crashes the app when uploading photos. What should you do first?",
    options: ["Type answer"],
    answer: [
      <span key="1">
        Not quite!{" "}
        <span className="text-[#F9DB6F]">The correct answer is 24.</span>
      </span>,
      <span key="2">You can learn more about this in the card warranty.</span>,
    ],
  },
  {
    id: 2,
    question:
      "A user reports a bug that crashes the app when uploading photos. What should you do first?",
    options: ["Type answer"],
    answer: [
      <span key="1">
        Not quite!{" "}
        <span className="text-[#F9DB6F]">The correct answer is 24.</span>
      </span>,
      <span key="2">You can learn more about this in the card warranty.</span>,
    ],
  },
  {
    id: 3,
    question:
      "A user reports a bug that crashes the app when uploading photos. What should you do first?",
    options: ["Type answer"],
    answer: [
      <span key="1">
        Not quite!{" "}
        <span className="text-[#F9DB6F]">The correct answer is 24.</span>
      </span>,
      <span key="2">You can learn more about this in the card warranty.</span>,
    ],
  },
];

interface SessionQuestion {
  id: number;
  question: string;
  options: string[];
  answer: string | ReactNode[];
}

export default function SessionStarted() {
  console.log(sessionData);

  return (
    <div className="h-[725px] w-full bg-[#191919] flex flex-col text-white overflow-auto">
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none]">
        {sessionData.map((q: SessionQuestion) => (
          <div key={q.id} className="mb-10">
            {/* Question Card */}
            <div className="bg-[#222222] rounded-[20px] p-6 mb-6">
              <h2 className=" font-urbanist font-extrabold text-[24px] leading-[100%] mb-4">
                Question {q.id}:
              </h2>
              <p className="font-urbanist font-medium text-[24px] leading-[100%] tracking-[0.1px] mb-6">
                {q.question}
              </p>

              {/* Answer Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-center">
                {q.options.map((option: string, idx: number) => (
                  <div
                    key={idx}
                    className="py-3 px-4   bg-[#0E0F11] border-l border-[#F9DB6F] rounded-md text-center hover:bg-[#F9DB6F1A] cursor-pointer font-roboto flex font-medium text-[16px] leading-[20px] tracking-[0.1px] justify-center items-center"
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Sections */}
            {q.options.some((option: string) => option === "Type answer") && (
              <div className="flex justify-end items-center gap-4 mb-6">
                <div className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0.1px] text-center p-3 rounded-lg">
                  12month
                </div>
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#F9DB6F] flex items-center justify-center">
                  <Image
                    src="/placeholder-profile.svg"
                    alt="Avatar"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                </div>
              </div>
            )}

            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#F9DB6F] flex items-center justify-center">
                <Image
                  src="/file.png"
                  alt="Avatar"
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
              <div className="flex-1">
                {Array.isArray(q.answer) ? (
                  q.answer.map((line: ReactNode, i: number) =>
                    typeof line === "string" ? (
                      <p
                        key={i}
                        className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0.1px] text-gray-300"
                      >
                        {line}
                      </p>
                    ) : (
                      <div
                        key={i}
                        className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0.1px] text-gray-300"
                      >
                        {line}
                      </div>
                    )
                  )
                ) : (
                  <p className="font-urbanist font-medium text-[20px] leading-[100%] tracking-[0.1px] text-gray-300">
                    {q.answer}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Chat Input - stays fixed at bottom */}
      <div className="w-full relative bottom-0 pt-4 pb-6 px-4 ">
        <div className="relative flex items-center gap-4">
          <input
            type="text"
            placeholder="Enter your text here"
            className="w-full h-[58px] bg-[#0E0F11] border border-gray-700 rounded-[20px] py-3 px-4 pr-14 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
          <div className="w-10 h-10 rounded-full bg-[#F9DB6F] flex items-center justify-center cursor-pointer">
            <Send className="h-5 w-5 text-black" />
          </div>
        </div>
      </div>
    </div>
  );
}
