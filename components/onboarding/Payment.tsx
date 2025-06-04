"use client";

import {Check} from "lucide-react";
import PaymentPage from "./checkout-form";
import {useEffect, useState} from "react";
import {ONBOARDING_DATA_KEY} from "@/lib/local-storage";
import {useUser} from "@clerk/nextjs";

type PaymentFormProps = {
  onPrevious?: () => void;
  updateOnboardingData?: (data: any) => void;
  sumbitOnboardingData?: () => void;
};

export default function PaymentForm({
  onPrevious,
  updateOnboardingData,
  sumbitOnboardingData,
}: PaymentFormProps) {
  const {user: loggedInUser, isLoaded} = useUser();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [plan, setPlan] = useState("");
  const [plan_duration, setPlanDuration] = useState("");
  const savedData = localStorage.getItem(
    `${ONBOARDING_DATA_KEY}_${loggedInUser?.id}`
  );
  const parsedData = JSON.parse(savedData!);

  useEffect(() => {
    const getOnboardingData = async () => {
      if (loggedInUser?.id) {
        try {
          const savedData = localStorage.getItem(
            `${ONBOARDING_DATA_KEY}_${loggedInUser?.id}`
          );

          if (savedData) {
            const parsedData = JSON.parse(savedData);
            console.log(parsedData, "data");

            if (parsedData.subscription) {
              console.log(parsedData.subscription, "sub");
              setPaymentData(parsedData.subscription);

              // Check if plan_type exists before splitting
              if (parsedData.subscription.plan_type) {
                const parts = parsedData.subscription.plan_type.split("_");
                if (parts.length >= 2) {
                  const [duration, standard] = parts;
                  setPlan(standard);
                  setPlanDuration(duration);
                }
              }
            }
          }
        } catch (err) {
          console.error("Error retrieving data from localStorage:", err);
        }
      }
    };

    // Actually call the function
    if (loggedInUser) {
      getOnboardingData();
    }

    // Add proper dependencies
  }, [loggedInUser?.id, isLoaded]);

  const handlePaymentComplete = async () => {
    if (loggedInUser?.id) {
      const savedDataString = localStorage.getItem(
        `${ONBOARDING_DATA_KEY}_${loggedInUser.id}`
      );
      const savedData = savedDataString ? JSON.parse(savedDataString) : {};
      const updatedSubscriptionData = {
        // ...savedData,
        subscription: {
          ...(savedData.subscription || {}),
          is_subscribed: true,
        },
      };
      if (updateOnboardingData) {
        updateOnboardingData({
          // ...savedData,
          subscription: updatedSubscriptionData.subscription,
        });
        if (sumbitOnboardingData) {
          sumbitOnboardingData();
        }
      }
    }
  };

  return (
    <div className="flex min-h-screen pb-8">
      {/* Left side - Yellow section */}
      <div className="flex-1 bg-[#F9DB6F] flex flex-col max-w-2xl">
        <div className="mb-8 flex items-center p-8"></div>

        <div className="flex flex-col items-center text-center p-8 w-[450px] mx-auto">
          <h2 className="text-3xl font-bold">
            You&apos;re only one click away from something great!
          </h2>
          <p className="mt-4 text-lg">
            Enter your payment details to start using Pohloh.
          </p>
        </div>

        <div className="p-8 bg-[#222324] text-white flex-1 mt-12">
          <div className="rounded-full bg-black p-4 text-white -mt-16 relative z-10 w-[420px] h-[82px] mx-auto flex items-center justify-center">
            <div className="flex items-center justify-between gap-20">
              <div className="flex items-center">
                <div className="mr-4 flex items-center justify-center rounded-full border border-white">
                  <img
                    src="/loading-03.png"
                    alt=""
                    className="h-[61px] w-[61px]"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    ${paymentData?.amount / 100}/{plan} per seat
                  </h3>
                  <p className="text-sm text-gray-300">{plan_duration} Plan</p>
                </div>
              </div>
              <div
                className="text-[#F9DB6F] font-urbanist font-semibold text-lg leading-[22px] tracking-[0%] cursor-pointer"
                onClick={onPrevious}
              >
                Choose Plan
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-2">
              {/* <div className="w-[20px] h-[20px] bg-[#F9DB6F] rounded-full flex items-center justify-center mt-1">
                <Check className="w-4 h-4 text-gray-800" />
              </div> */}
              <p className="text-[20px]">
                {/* Complete access to Pohloh (Knowledge Base, Tutor, etc)
                 */}
                Additional features include:
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-[20px] h-[20px] bg-[#F9DB6F] rounded-full flex items-center justify-center mt-1">
                <Check className="w-4 h-4 text-gray-800" />
              </div>
              <p className="text-[20px]">
                1 Organization Base + 2 Admin roles included.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-[20px] h-[20px] bg-[#F9DB6F] rounded-full flex items-center justify-center mt-1">
                <Check className="w-4 h-4 text-gray-800" />
              </div>
              <p className="text-[20px]">
                Team Management + Role based permissions
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-[20px] h-[20px] bg-[#F9DB6F] rounded-full flex items-center justify-center mt-1">
                <Check className="w-4 h-4 text-gray-800" />
              </div>
              <p className="text-[20px]">
                Access to our customer experience team + help desk
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Payment form */}

      <div className="flex-1 flex items-center justify-center p-8 text-white relative">
        <div className="w-full max-w-3xl">
          <PaymentPage
            clientSecret={parsedData?.subscription?.client_secret}
            onPaymentComplete={handlePaymentComplete}
            isSubscribed={parsedData?.subscription?.is_subscribed}
          />
        </div>
      </div>
    </div>
  );
}
