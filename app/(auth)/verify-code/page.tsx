import LeftSection from "@/components/auth/leftSection";
import VerifyOTP from "@/components/auth/verify-otp";
import React from "react";

const page = () => {
  return (
    <div className="main-content font-urbanist w-full flex lg:flex-row flex-col p-8 md:py-8 px-20 h-screen box-border overflow-y-auto no-scrollbar lg:overflow-hidden">
      {/* Left Section */}
      <div className="w-full lg:w-[30%] lg:h-full flex-shrink-0">
        <LeftSection
          welcomeMessage={{
            title: "Reset Password?",
            description:
              "Your new password should be unique and different from your previous ones.",
          }}
          ScreenMobile={VerifyOTP} 
          ClassNameScreen={"w-full mt-10 justify-center item-center"}
        />
      </div>

      {/* Main Content */}
      <div className="w-full md:w-[70%] lg:mt-0 mt-8  hidden lg:flex  flex-col justify-center flex-grow overflow-auto">
        <VerifyOTP />
      </div>

      {/* Footer removed to prevent overflow */}
    </div>
  );
};

export default page;
