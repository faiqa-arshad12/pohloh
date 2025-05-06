import Image from "next/image";
import React from "react";
import { Footer } from "./footer";

interface LeftSectionProps {
  welcomeMessage: {
    title: string;
    description: string;
  };
  ScreenMobile: React.ComponentType;
  ClassNameScreen: string;
}

const LeftSection = ({
  welcomeMessage = {
    title: "",
    description: "",
  }, ScreenMobile,
  ClassNameScreen,
}: LeftSectionProps) => {
  return (
    <div className="text-white flex flex-col min-h-screen w-full">
      {/* Top Section */}
      <div className="flex-1 flex flex-col items-center justify-center lg:items-start lg:justify-start">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <Image
            src="/file.png"
            alt="logo"
            width={181}
            height={181}
            className="w-[181px] h-[181px]"
          />
          <p className="font-urbanist font-normal text-[40px] leading-[100%] tracking-[0px]">
            POHLOH
          </p>
        </div>

        <div className="flex flex-col gap-2 mt-10 w-full ">
          <p className="font-urbanist font-bold text-[32px] leading-[36px] tracking-[0px] whitespace-nowrap text-[#FFFFFF] text-center lg:text-left">
            {welcomeMessage.title}
          </p>
          <p className="font-urbanist font-normal text-[14px] leading-[20px] tracking-[0px]  text-[#FFFFFF] text-center lg:text-left">
            {welcomeMessage.description}
          </p>
        </div>
      <div className={`block lg:hidden ${ClassNameScreen} `}>
        <ScreenMobile />
      </div>
      </div>


      {/* Footer (only on lg and up, positioned fixed at the bottom) */}
      <div className="lg:block w-full  bottom-0 mt-auto mb-5">
        <Footer />
      </div>
    </div>
  );
};

export default LeftSection;
