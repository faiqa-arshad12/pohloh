import React from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Question = {
  id: string;
  question: string;
  answer: string;
  type: "multiple" | "short";
  options?: string[];
  source_id?: string;
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
  selectedCards?: any[];
  showToast: (message: string, type: "success" | "error") => void;
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
  selectedCards = [],
  showToast,
}: QuestionModalProps) {
  // Initialize options when adding a new multiple-choice question
  React.useEffect(() => {
    if (
      isOpen &&
      !isEditing &&
      currentQuestion.type === "multiple" &&
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
    currentQuestion.type,
    currentQuestion.options,
    onOptionChange,
  ]);

  // Initialize question type from formData when opening modal for new questions
  React.useEffect(() => {
    if (isOpen && !isEditing && currentQuestion.type !== questionType) {
      handleTypeChange(questionType);
    }
  }, [isOpen, isEditing, questionType]);

  // State for managing form errors
  const [modalErrors, setModalErrors] = React.useState<
    Record<string, string | undefined>
  >({});

  // Effect to clear errors when modal is closed
  React.useEffect(() => {
    if (!isOpen) {
      setModalErrors({});
    }
  }, [isOpen]);

  const handleSourceChange = (value: string) => {
    onQuestionChange({
      target: {
        name: "source_id",
        value: value,
      },
    } as React.ChangeEvent<HTMLInputElement>);
    // Clear source_id error on change
    setModalErrors((prev) => ({...prev, source_id: undefined}));
  };

  const handleTypeChange = (type: "multiple" | "short") => {
    // Only allow type change for new questions
    if (!isEditing) {
      // Reset current question state when changing type
      const resetQuestionEvent = {
        target: {name: "question", value: ""} as any,
      } as unknown as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
      onQuestionChange(resetQuestionEvent);

      const resetAnswerEvent = {
        target: {name: "answer", value: ""} as any,
      } as unknown as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
      onQuestionChange(resetAnswerEvent);

      const resetSourceIdEvent = {
        target: {name: "source_id", value: undefined} as any,
      } as unknown as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
      onQuestionChange(resetSourceIdEvent);

      onQuestionTypeChange(type);
      // Reset options if switching to short answer
      if (type === "short") {
        // Create a synthetic event for options reset
        const event = {
          target: {
            name: "options",
            value: undefined,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onQuestionChange(event);
        // Clear options errors when switching to short answer
        setModalErrors((prev) => ({...prev, options: undefined}));
      } else {
        // Initialize options for multiple choice
        onOptionChange(0, "");
        onOptionChange(1, "");
        onOptionChange(2, "");
        onOptionChange(3, "");
      }
    }
  };

  // Handle input change and clear error
  const handleInputChangeAndClearError = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {name} = e.target;
    onQuestionChange(e);
    setModalErrors((prev) => ({...prev, [name]: undefined}));
  };

  const handleOptionChangeAndClearError = (index: number, value: string) => {
    onOptionChange(index, value);
    // Clear options error when typing in options
    setModalErrors((prev) => ({...prev, options: undefined}));
  };

  const validateQuestion = () => {
    const errors: Record<string, string | undefined> = {};

    if (!currentQuestion.question.trim()) {
      errors.question = "Question text is required";
    } else if (currentQuestion.question.length > 500) {
      errors.question = "Question cannot exceed 500 characters";
    }

    if (!currentQuestion.answer.trim()) {
      errors.answer = "Answer is required";
    } else if (currentQuestion.answer.length > 500) {
      errors.answer = "Answer cannot exceed 500 characters";
    }

    if (currentQuestion.type === "multiple") {
      if (
        !currentQuestion.options ||
        currentQuestion.options.filter((o) => o.trim()).length < 2
      ) {
        errors.options = "At least two options are required";
      } else if (currentQuestion.options.some((o) => o.length > 500)) {
        errors.options = "Each option cannot exceed 500 characters";
      }
    }

    // Source card is required for new questions
    // if (!isEditing && !currentQuestion.source_id) {
    //    errors.source_id = "Source card is required";
    // }

    setModalErrors(errors);

    return Object.keys(errors).length === 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1a1a] border-none rounded-lg w-full max-w-xl !max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl font-medium">
            {isEditing ? "Edit Question" : "Add Question"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Question Type Selection - Only show for new questions */}
          {!isEditing && (
            <div className="space-y-2">
              <label className="block text-sm mb-1 text-white">
                Question Type
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  className={`w-full h-[48px] rounded-md text-white font-urbanist font-normal transition cursor-pointer ${
                    currentQuestion.type === "multiple"
                      ? "border border-[#F9DB6F] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10"
                      : "border-0 bg-[#333435]"
                  }`}
                  onClick={() => handleTypeChange("multiple")}
                >
                  Multiple Choice
                </button>
                <button
                  type="button"
                  className={`w-full h-[48px] rounded-md text-white font-urbanist font-normal transition cursor-pointer ${
                    currentQuestion.type === "short"
                      ? "border border-[#F9DB6F] bg-[#f0d568]/10 text-[#f0d568] hover:bg-[#f0d568]/10"
                      : "border-0 bg-[#333435]"
                  }`}
                  onClick={() => handleTypeChange("short")}
                >
                  Short Answer
                </button>
              </div>
            </div>
          )}

          {/* Source Card Selection - Only show for new questions */}
          {!isEditing && (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm text-white">Source Card</label>
                <span className="text-sm text-gray-400">
                  {selectedCards.length} cards available
                </span>
              </div>
              <Select
                value={currentQuestion.source_id}
                onValueChange={handleSourceChange}
              >
                <SelectTrigger
                  className={`w-full bg-[#2a2a2a] border text-white rounded-md h-[44px] ${
                    modalErrors.source_id ? "border-red-500" : "border-0"
                  }`}
                >
                  <SelectValue placeholder="Select source card" />
                </SelectTrigger>
                <SelectContent className="bg-[#2a2a2a] border-none text-white">
                  {selectedCards.map((card) => (
                    <SelectItem
                      key={card.id}
                      value={card.id}
                      className="hover:bg-[#333333] hover:text-[#F9DB6F] focus:bg-[#333333] focus:text-[#F9DB6F]"
                    >
                      {card.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {modalErrors.source_id && (
                <p className="text-red-500 text-xs mt-1">
                  {modalErrors.source_id}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="question" className="block text-sm mb-1 text-white">
              Question
            </label>
            <textarea
              id="question"
              name="question"
              value={currentQuestion.question}
              onChange={handleInputChangeAndClearError}
              maxLength={500}
              className={`w-full bg-[#2a2a2a] border rounded-md p-2 min-h-[100px] text-white ${
                modalErrors.question ? "border-red-500" : "border-0"
              }`}
              placeholder="Enter your question here"
            />
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">
                {currentQuestion.question.length}/500
              </span>
            </div>
            {modalErrors.question && (
              <p className="text-red-500 text-xs mt-1">
                {modalErrors.question}
              </p>
            )}
          </div>

          {/* Render options only if the question type is multiple choice */}
          {currentQuestion.type === "multiple" && (
            <div className="space-y-2">
              <label className="block text-sm mb-1 text-white">Options</label>
              <div className="space-y-2">
                {currentQuestion.options?.map((option, index) => (
                  <div key={index}>
                    <Input
                      value={option}
                      onChange={(e) =>
                        handleOptionChangeAndClearError(index, e.target.value)
                      }
                      maxLength={500}
                      className={`bg-[#2a2a2a] h-[44px] border text-white rounded-md  border-transparent focus:border-[#F9DB6F]  focus:outline-none focus:!border-[#F9DB6F] ${
                        modalErrors.options ? "border-red-500" : "border-0"
                      }`}
                      placeholder={`Option ${index + 1}`}
                    />
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">
                        {option.length}/500
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {modalErrors.options && (
                <p className="text-red-500 text-xs mt-1">
                  {modalErrors.options}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="answer" className="block text-sm mb-1 text-white">
              Answer
            </label>
            <Input
              id="answer"
              name="answer"
              value={currentQuestion.answer}
              onChange={handleInputChangeAndClearError}
              maxLength={500}
              className={` bg-[#2a2a2a] h-[44px] border rounded-md text-white ${
                modalErrors.answer ? "border-red-500" : "border-0 "
              }`}
              placeholder="Enter the correct answer"
            />
            <div className="flex justify-between">
              <span className="text-xs text-gray-400">
                {currentQuestion.answer.length}/500
              </span>
            </div>
            {modalErrors.answer && (
              <p className="text-red-500 text-xs mt-1">{modalErrors.answer}</p>
            )}
          </div>

          <div className="flex justify-between flex-row">
            <Button
              variant="outline"
              className="bg-[#333333] hover:bg-[#444444] hover:text-[white] text-white border rounded-md py-2 h-[47px] w-[166px] cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#f0d568] hover:bg-[#e0c558] text-black font-medium rounded-md py-2 h-[48px] w-[210px] cursor-pointer"
              onClick={() => {
                if (validateQuestion()) {
                  onAddQuestion(currentQuestion);
                }
              }}
            >
              {isEditing ? "Save Changes" : "Add Question"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
