import LeftSection from "@/components/auth/leftSection";
import { SignupForm } from "@/components/auth/signupForm";
import React from "react";

const SignupPage = () => {
  return (
    <div className="main-content font-urbanist w-full flex lg:flex-row flex-col p-8 md:py-8 px-20 h-screen box-border overflow-y-auto no-scrollbar lg:overflow-hidden justify-between">
      <div className="w-full lg:w-[30%] lg:h-full flex-shrink-0">
      <LeftSection
          welcomeMessage={{
            title: "Create your account",
            description:
              "Sign up to access exclusive features and personalize your experience. Get started in seconds!",
          }}

          ClassNameScreen={"w-full mt-10 justify-center items-center "}
          ScreenMobile={SignupForm}
        />
      </div>
      <div className="w-full lg:w-[50%] lg:mt-0 mt-10 hidden lg:flex flex-col justify-center">
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
