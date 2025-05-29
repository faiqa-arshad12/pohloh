import React from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type Question = {
  id: string;
  question: string;
  answer: string;
  type: "multiple" | "short";
  options?: string[];
};

export interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddQuestion: (question: Question) => void;
  currentQuestion: Question;
  onQuestionChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onOptionChange: (index: number, value: string) => void;
  onQuestionTypeChange: (type: "multiple" | "short") => void;
  questionType: "multiple" | "short";
  isEditing: boolean;
}

export default function QuestionModal({
  isOpen,
  onClose,
  onAddQuestion,
  currentQuestion,
  onQuestionChange,
  onOptionChange,
  onQuestionTypeChange,
  questionType,
  isEditing = false,
}: QuestionModalProps) {
  // Initialize options when adding a new multiple-choice question
  React.useEffect(() => {
    if (
      isOpen &&
      !isEditing &&
      questionType === "multiple" &&
      (!currentQuestion.options || currentQuestion.options.length === 0)
    ) {
      onOptionChange(0, ""); // Trigger a change to initialize options array
      onOptionChange(1, "");
      onOptionChange(2, "");
      onOptionChange(3, "");
    }
  }, [
    isOpen,
    isEditing,
    questionType,
    currentQuestion.options,
    onOptionChange,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-none rounded-lg w-full max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl font-medium">
            {isEditing ? "Edit Question" : "Add Question"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm mb-1">
              Question
            </label>
            <textarea
              id="question"
              name="question"
              value={currentQuestion.question}
              onChange={onQuestionChange}
              className="w-full bg-[#2a2a2a] border-0 text-white rounded-md p-2 min-h-[100px]"
              placeholder="Enter your question here"
            />
          </div>

          {/* Render options only if the question type is multiple choice */}
          {questionType === "multiple" && (
            <div>
              <label className="block text-sm mb-1">Options</label>
              <div className="space-y-2">
                {currentQuestion.options?.map((option, index) => (
                  <Input
                    key={index}
                    value={option}
                    onChange={(e) => onOptionChange(index, e.target.value)}
                    className="bg-[#2a2a2a] h-[44px] border-0 text-white rounded-md"
                    placeholder={`Option ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="answer" className="block text-sm mb-1">
              Answer
            </label>
            <Input
              id="answer"
              name="answer"
              value={currentQuestion.answer}
              onChange={onQuestionChange}
              className="bg-[#2a2a2a] h-[44px] border-0 text-white rounded-md"
              placeholder="Enter the correct answer"
            />
          </div>

          <div className="flex justify-between flex-row">
            <Button
              variant="outline"
              className="bg-[#333333] hover:bg-[#444444] hover:text-[white] text-white border-0 rounded-md py-2 h-[47px] w-[166px] cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#f0d568] hover:bg-[#e0c558] text-black font-medium rounded-md py-2 h-[48px] w-[210px] cursor-pointer"
              onClick={() => onAddQuestion(currentQuestion)}
            >
              {isEditing ? "Save Changes" : "Add Question"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
