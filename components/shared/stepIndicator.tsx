import React from "react"

interface StepIndicatorProps {
  steps: string[] // List of step names
  currentStep: number // The current active step
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps = [], currentStep = 0 }) => {
  // Add default values and safety check
  if (!steps || steps.length === 0) {
    return <div className="text-white text-center py-4">No steps defined</div>
  }

  return (
    <div className="flex flex-col items-center justify-center w-full py-6 px-4">
      <div className="flex flex-col items-center w-full max-w-3xl">
        {/* Steps with connecting lines */}
        <div className="flex items-center justify-between w-full">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              {/* Step circle and label */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-[20px] h-[20px] flex items-center justify-center rounded-full font-medium text-[14px] ${
                    index < currentStep
                      ? "bg-[#F9DB6F] text-black" // Completed step
                      : index === currentStep
                        ? "border-2 border-[#4A4A35] text-white bg-[#4A4A35]" // Current step
                        : "border-2 border-[#1F2937] bg-[#1F2937] text-white" // Future step
                  }`}
                >
                  {index + 1}
                </div>

                {/* Step label */}
                <div className="mt-3 text-center">
                  <span
                    className="text-[14px] font-normal whitespace-nowrap"
                    style={{color: index === currentStep - 1 ? "white" : "#7F8286"}}
                  >
                    {step}
                  </span>
                </div>
              </div>

              {/* Line after circle (except for last circle) */}
              {index < steps.length - 1 && (
                <div
                  className={`h-[1px] flex-grow !mt-[-35px] bg-[#7F8286]`}
                  style={{ minWidth: "70px", maxWidth: "180px" }}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
