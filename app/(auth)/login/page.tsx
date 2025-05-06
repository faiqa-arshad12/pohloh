import LeftSection from "@/components/auth/leftSection";
import {LoginForm} from "@/components/auth/loginForm";
import React from "react";

const LoginPage = () => {
  return (
    <div className="main-content font-urbanist w-full flex lg:flex-row flex-col p-8 md:py-8 px-20 h-screen box-border overflow-y-auto no-scrollbar lg:overflow-hidden">
      <div className="w-full lg:w-[30%] lg:h-full flex-shrink-0">
      <LeftSection
          welcomeMessage={{
            title: "Welcome back!",
            description:
              "Enter your details to continue using Pohloh. Securely log in to access your account and pick up where you left off.",
          }}
          ClassNameScreen={"w-full mt-10 "}
          ScreenMobile={LoginForm}
        />
      </div>
      <div className="w-full lg:w-[70%] lg:mt-0 mt-10 hidden lg:flex flex-col justify-center ">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
