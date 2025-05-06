import { ForgotPassword } from "@/components/auth/forgotPassword";
import LeftSection from "@/components/auth/leftSection";
import React from "react";

const SignupPage = () => {
  return (
    <div className="main-content font-urbanist w-full flex lg:flex-row flex-col p-8 md:py-8 px-20 h-screen box-border overflow-y-auto no-scrollbar lg:overflow-hidden">
      {/* Left Side */}
      <div className="w-full lg:w-[30%] lg:h-full flex-shrink-0">
        <LeftSection
          welcomeMessage={{
            title: "Forgot Password?",
            description:
              "No problem! We'll guide you through resetting your password in no time.",
          }}

          ScreenMobile={ForgotPassword}
          ClassNameScreen={"w-full lg:w-[70%] lg:mt-0 mt-10 justify-center"}
        />
        
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-[70%] lg:mt-0 mt-10 hidden lg:flex flex-col justify-center">
        <ForgotPassword />
      </div>
    </div>
  );
};

export default SignupPage;
