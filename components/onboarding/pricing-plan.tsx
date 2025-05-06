"use client";

import {StepIndicator} from "../shared/stepIndicator";
import {useEffect, useState} from "react";
import Image from "next/image";
import {Check, Loader2} from "lucide-react";
import {useUser} from "@clerk/nextjs";
import type {PaymentPlan} from "@/types/types";
import {
  getLocalStorage,
  PRICING_DATA_KEY,
  setLocalStorage,
} from "@/lib/local-storage";
import {ShowToast} from "../shared/show-toast";

type Price = {
  id: string;
  interval: "month" | "year";
  amount: number;
  currency: string;
};

type Plan = {
  id: string;
  name: string;
  description: string | null;
  prices: Price[];
};

interface PricingData {
  selectedPlan: string;
  billingCycle: "month" | "year";
  priceId: string | null;
  planDetails?: {
    name: string;
    amount: number;
    currency: string;
  };
}

type PaymentFormProps = {
  setPriceId: (price: string | null) => void;
  setPaymentPlan: (data: PaymentPlan) => void;
  org_id?: string;
};

export default function PricingPlan({
  setPriceId,
  setPaymentPlan,
  org_id,
}: PaymentFormProps) {
  const [billingCycle, setBillingCycle] = useState<"month" | "year">("month");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [localData, setLocalData] = useState<PricingData | null>(null);

  const steps = ["Organization Details", "Setup Profile", "Choose Plan"];
  const currentStep = 3;
  const {user} = useUser();

  // Load data from localStorage on component mount
  useEffect(() => {
    if (user?.id) {
      try {
        const savedData = getLocalStorage<PricingData>(
          PRICING_DATA_KEY,
          user.id
        );
        if (savedData) {
          setLocalData(savedData);
          setSelectedPlan(savedData.selectedPlan);
          setBillingCycle(savedData.billingCycle);

          // Set the price ID in the parent component
          if (savedData.priceId) {
            setPriceId(savedData.priceId);
          }

          // Set the payment plan in the parent component
          if (savedData.selectedPlan) {
            setPaymentPlan({
              plan: savedData.selectedPlan,
              billingCycle: savedData.billingCycle,
            });
          }
        }
      } catch (error) {
        console.error("Error loading pricing data from localStorage:", error);
      }
    }
  }, [user?.id, setPriceId, setPaymentPlan]);

  // Save data to localStorage
  const saveToLocalStorage = (data: PricingData) => {
    if (user?.id) {
      setLocalStorage(PRICING_DATA_KEY, user.id, data);
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/stripe/plan");
        const data = await res.json();
        setPlans(data);

        // If we have local data, use that; otherwise use the first plan
        if (!localData?.selectedPlan && data.length > 0) {
          setSelectedPlan(data[0]?.name.toLowerCase());

          // Find the price for the current billing cycle
          const price = data[0]?.prices.find(
            (p: Price) => p.interval === billingCycle
          );
          if (price) {
            setPriceId(price.id);

            // Save initial selection to localStorage
            const initialData: PricingData = {
              selectedPlan: data[0]?.name.toLowerCase(),
              billingCycle,
              priceId: price.id,
              planDetails: {
                name: data[0]?.name,
                amount: price.amount,
                currency: price.currency,
              },
            };

            if (user?.id) {
              saveToLocalStorage(initialData);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [billingCycle, localData?.selectedPlan, setPriceId, user?.id]);

  const handlePlanSelection = (plan: Plan, price: Price) => {
    setSelectedPlan(plan.name.toLowerCase());
    // Update parent component state
    setPriceId(price.id);
    setPaymentPlan({
      plan: plan.name.toLowerCase(),
      billingCycle,
    });

    // Save to localStorage
    const pricingData: PricingData = {
      selectedPlan: plan.name.toLowerCase(),
      billingCycle,
      priceId: price.id,
      planDetails: {
        name: plan.name,
        amount: price.amount,
        currency: price.currency,
      },
    };

    saveToLocalStorage(pricingData);

    // Optional: Update API
    createOrUpdateSubscription(plan.name.toLowerCase());
  };

  const handleBillingCycleChange = (cycle: "month" | "year") => {
    setBillingCycle(cycle);

    // Find the currently selected plan
    const plan = plans.find((p) => p.name.toLowerCase() === selectedPlan);
    if (plan) {
      // Find the price for the new billing cycle
      const price = plan.prices.find((p) => p.interval === cycle);
      if (price) {
        // Update parent component state
        setPriceId(price.id);
        setPaymentPlan({
          plan: selectedPlan,
          billingCycle: cycle,
        });

        // Save to localStorage
        const pricingData: PricingData = {
          selectedPlan,
          billingCycle: cycle,
          priceId: price.id,
          planDetails: {
            name: plan.name,
            amount: price.amount,
            currency: price.currency,
          },
        };

        saveToLocalStorage(pricingData);
      }
    }
  };

  const createOrUpdateSubscription = async (plan: string) => {
    if (!user) return;

    try {
      // We're just saving the selection to localStorage and parent component
      // The actual API call will happen when the user clicks Next in the parent
      setPaymentPlan({
        plan,
        billingCycle,
      });

      // ShowToast("Plan selected successfully", "success");
    } catch (error) {
      console.error("Error updating subscription:", error);
      ShowToast("Failed to select plan", "error");
    }
  };

  return (
    <div className="flex items-center justify-center text-white p-4">
      <div className="w-full max-w-screen-xl flex flex-col items-center justify-center">
        <main className="w-full max-w-2xl flex flex-col items-center">
          <div className="text-center mb-4 md:mb-4">
            <h1 className="font-medium text-3xl md:text-[40px] leading-[100%] tracking-[0%] mb-6">
              Choose Pricing Plan
            </h1>
            <p className="text-gray-400 text-sm md:text-base">
              Flexible pricing plans that best fit your needs.
            </p>
          </div>

          <div className="w-full mx-auto mb-8">
            <StepIndicator steps={steps} currentStep={currentStep} />
          </div>

          {isLoading ? (
            <div className="w-[857px] h-[430px] flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-8">
                <div className="bg-[#FFFFFF14] rounded-[14.85px] p-3 flex overflow-hidden items-center justify-center">
                  <button
                    className={`w-[194px] h-[56px] flex items-center justify-center text-center ${
                      billingCycle === "year"
                        ? "bg-[#F9DB6F] text-black rounded-[8px] font-urbanist font-medium text-[22.27px]"
                        : "text-white font-urbanist font-medium text-[22.27px]"
                    } transition-all`}
                    onClick={() => handleBillingCycleChange("year")}
                  >
                    Yearly
                  </button>
                  <button
                    className={`w-[194px] h-[56px] flex items-center justify-center text-center ${
                      billingCycle === "month"
                        ? "bg-[#F9DB6F] text-black rounded-[8px] font-urbanist font-medium text-[22.27px]"
                        : "text-white font-urbanist font-medium text-[22.27px]"
                    } transition-all`}
                    onClick={() => handleBillingCycleChange("month")}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              <div className="flex gap-5 w-[857px] h-[430px]">
                {plans.map((plan) => {
                  const price = plan.prices.find(
                    (p) => p.interval === billingCycle
                  );
                  if (!price) return null;

                  const isSelected = selectedPlan === plan.name.toLowerCase();

                  return (
                    <div
                      key={plan.id}
                      onClick={() => handlePlanSelection(plan, price)}
                      className={`w-full h-full p-4 rounded-[23px] flex flex-col justify-between border transition cursor-pointer ${
                        isSelected
                          ? "bg-black border-none"
                          : "border-none bg-[#FFFFFF0A] hover:border-yellow-500/50 hover:bg-[#ffffff10]"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <div className="w-[78.81px] h-[78.81px] flex items-center justify-center">
                            <Image
                              src="/loading-03-yellow.png"
                              alt="Loading spinner"
                              width={78.81}
                              height={78.81}
                            />
                          </div>
                          <div className="text-right">
                            <div className="flex">
                              <div className="flex flex-col items-start">
                                <span className="text-lg text-[#D1D1D1] px-2 pt-[-5px]">
                                  $
                                </span>
                                <span className="invisible">.</span>
                              </div>
                              <span className="font-urbanist font-thin text-[50px] leading-[100%] text-white">
                                {price.amount}
                              </span>
                              <div className="flex flex-col justify-end">
                                <span className="invisible">.</span>
                                <span className="text-xs text-gray-400">
                                  /{billingCycle} per seat
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <h3 className="font-urbanist font-semibold text-[24px] leading-[22px] mb-2">
                          {plan.name} Plan
                        </h3>
                        <p className="text-[#707070] font-urbanist text-[14px] mb-4">
                          {plan.description || "Flexible usage plan"}
                        </p>
                        <div className="border-t border-[#E5E5E5] mb-5"></div>

                        <div className="space-y-5">
                          {[
                            "Feature 1",
                            "Feature 2",
                            "Feature 3",
                            "Feature 4",
                          ].map((feature) => (
                            <div className="flex items-center" key={feature}>
                              <Check
                                size={16}
                                className="text-[#F9DB6F] mr-2"
                              />
                              <span className="font-urbanist font-normal text-[14.13px] text-[#707070]">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div
                        className={`rounded-[9.42px] h-[56.51px] px-[47.09px] py-[11.77px] font-medium mt-5 flex items-center justify-center ${
                          isSelected
                            ? "bg-[#F9DB6F] text-black"
                            : "bg-transparent border border-white text-white w-full"
                        }`}
                      >
                        {isSelected
                          ? "Current Plan"
                          : plan.name === "Premium"
                          ? `Upgrade to ${plan.name}`
                          : `Choose ${plan.name}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
