"use client";

import type React from "react";
import {useState} from "react";
import {Send} from "lucide-react";
import {Button} from "../ui/button";
import {useUserHook} from "@/hooks/useUser";
import {ShowToast} from "../shared/show-toast";
import { apiUrl } from "@/utils/constant";

const feedbackTopics = [
  {id: "general", label: "General feedback"},
  {id: "product", label: "Product Issue"},
  {id: "feature", label: "New Feature Request"},
  {id: "other", label: "Other (specify in text)"},
];


const Feedback: React.FC = () => {
  const [feedback, setFeedback] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    topics?: string;
    feedback?: string;
  }>({});
  const {userData} = useUserHook();

  const handleTopicChange = (topicId: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((id) => id !== topicId)
        : [...prev, topicId]
    );
    if (errors.topics) {
      setErrors((prev) => ({...prev, topics: undefined}));
    }
  };

  const validateForm = () => {
    const newErrors: {
      topics?: string;
      feedback?: string;
    } = {};

    if (selectedTopics.length === 0) {
      newErrors.topics = "Please select at least one feedback topic";
    }

    if (!feedback.trim()) {
      newErrors.feedback = "Please enter your feedback";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userData) {
      ShowToast("Please log in to submit feedback");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${apiUrl}/feebacks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.id,
          team_id: userData.team_id,
          org_id: userData.org_id,
          feedback_type: selectedTopics,
          description: feedback.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      ShowToast("Thank you for your feedback!");
      setFeedback("");
      setSelectedTopics([]);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      ShowToast("Failed to submit feedback. Please try again.", "success");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center mt-16 rounded-[30px]  ">
      <div className="w-full bg-[#191919] rounded-xl py-8 px-8 relative h-[756px]">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-[32px] font-medium text-white font-urbanist">
            Help Us Improve{" "}
            <span className="text-[#F9E36C]">
              {userData?.organizations?.name}
            </span>{" "}
            by letting us know your feedback!
          </h2>
        </div>

        {/* Checkbox Group */}
        <div className="flex flex-col gap-4 mb-8">
          <p className="text-[20px] text-[#FFFFFF] mt-4 font-normal font-urbanist">
            Select the topic then type your feedback below!
          </p>
          <div className="flex flex-col gap-6">
            {feedbackTopics.map((topic) => (
              <div
                key={topic.id}
                className="text-[20px] text-[#FFFFFF] font-normal font-urbanist"
              >
                <input
                  type="checkbox"
                  id={topic.id}
                  checked={selectedTopics.includes(topic.id)}
                  onChange={() => handleTopicChange(topic.id)}
                  className="hidden"
                />
                <label
                  htmlFor={topic.id}
                  className="flex items-center cursor-pointer"
                >
                  <div
                    className={`w-5 h-5 border-2 ${
                      errors.topics ? "border-red-500" : "border-[#F9E36C]"
                    } rounded-[4px] flex items-center justify-center transition-colors ${
                      selectedTopics.includes(topic.id)
                        ? "bg-[#F9E36C]"
                        : "bg-transparent"
                    }`}
                  >
                    {selectedTopics.includes(topic.id) && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm ml-3 text-white font-medium">
                    {topic.label}
                  </span>
                </label>
              </div>
            ))}
          </div>
          {errors.topics && (
            <p className="text-red-500 text-sm mt-1">{errors.topics}</p>
          )}
        </div>

        {/* Feedback Textarea */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative flex items-center w-full">
            <textarea
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
                // Clear feedback error when user types
                if (errors.feedback) {
                  setErrors((prev) => ({...prev, feedback: undefined}));
                }
              }}
              placeholder="Type your feedback here..."
              className={`w-full min-h-[120px] bg-transparent border-2 ${
                errors.feedback ? "border-red-500" : "border-[#333333]"
              } rounded-lg p-4 text-sm text-white focus:border-[#F9DB6F6B] focus:outline-none resize-none placeholder:text-[#666666] pr-16`}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="absolute right-4 top-12 -translate-y-1/2 w-10 h-10 bg-[#F9E36C] rounded-[8px] flex items-center justify-center hover:bg-[#f8d84e] transition-colors cursor-pointer p-0 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed  mt-9"
            >
              <Send className="w-5 h-5 text-black" />
            </Button>
          </div>
          {errors.feedback && (
            <p className="text-red-500 text-sm mt-1 ml-1">{errors.feedback}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Feedback;
