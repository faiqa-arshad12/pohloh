"use client";
import Payment from "@/components/onboarding/Payment";
import PricingPlan from "@/components/onboarding/pricing-plan";
import {ProfileSetup} from "@/components/onboarding/profile-setup";
import OrganizationSetup from "@/components/onboarding/organizationSetup";
import {Button} from "@/components/ui/button";
import {useUser} from "@clerk/nextjs";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {ShowToast} from "@/components/shared/show-toast";
import Loader from "@/components/shared/loader";
import type {
  Department,
  Organization,
  PaymentPlan,
  User,
  UserOnboardingData,
} from "@/types/types";
import {
  CURRENT_STEP_KEY,
  ONBOARDING_DATA_KEY,
  organizations,
  users,
} from "@/utils/constant";
import {UserStatus} from "@/types/enum";
import {clearOnboardingData} from "@/lib/local-storage";
const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [onboardingData, setOnboardingData] = useState<UserOnboardingData>({});
  const [priceId, setPriceId] = useState<string | null>(null);
  const [isloading, setloading] = useState(true);
  const [userOnboarding, setUserOnboarding] = useState(false);

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const router = useRouter();
  const {user, isLoaded} = useUser();
  const updateOnboardingData = (newData: Partial<UserOnboardingData>) => {
    setOnboardingData((prev) => {
      const updatedData = {...prev, ...newData};
      if (user?.id) {
        localStorage.setItem(
          `${ONBOARDING_DATA_KEY}_${user.id}`,
          JSON.stringify(updatedData)
        );
      }
      return updatedData;
    });
  };

  const updateOrganization = (
    organizationData: UserOnboardingData["organization"]
  ) => {
    updateOnboardingData({organization: organizationData});
  };

  const updateProfile = (profileData: UserOnboardingData["user"]) => {
    updateOnboardingData({user: profileData});
  };

  // Save current step to localStorage
  const saveCurrentStep = (step: number) => {
    setCurrentStep(step);
    if (user?.id) {
      localStorage.setItem(`${CURRENT_STEP_KEY}_${user.id}`, step.toString());
    }
  };

  useEffect(() => {
    const getOnboardingData = async () => {
      if (user?.id) {
        try {
          const savedData = localStorage.getItem(
            `${ONBOARDING_DATA_KEY}_${user.id}`
          );
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            setOnboardingData(parsedData);

            if (parsedData.organization) {
              setOrganization(parsedData.organization);
            }

            if (parsedData.user) {
              setUserDetails(parsedData.user);
            }
          }
        } catch (err) {}
      }
    };

    if (user) getOnboardingData();
  }, [user]);

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 0:
        return (
          !!onboardingData.organization?.name &&
          !!onboardingData.organization?.departments &&
          !!onboardingData.organization?.num_of_seat
        );
      case 1:
        return (
          !!onboardingData.user?.user_role && !!onboardingData.user?.location
        );
      case 3:
        return true;
      default:
        return false;
    }
  };

  const [loading, setLoading] = useState<boolean>(false);
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>({
    plan: "",
    billingCycle: "month",
  });

  const createPaymentIntent = async () => {
    if (!priceId) {
      return ShowToast("Select Payment Plan");
    }
    try {
      setLoading(true);
      const response = await fetch(
        `${window.location.origin}/api/stripe/payment-intent`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            price_id: priceId,
            email: user?.primaryEmailAddress?.emailAddress,
            quantity: organization?.num_of_seat || "",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to create payment intent");

      const data = await response.json();
      // setPaymentIDs(data);
      const subscriptionData = {
        customer_id: data.customerId,
        plan_type: `${paymentPlan?.plan}_${paymentPlan?.billingCycle}`,
        org_id: organization?.id || "",
        subscription_id: data.subscription.id,
        is_subscribed: false,
        client_secret: data.clientSecret,
        amount: data.amount,
        quantity: data.quantity,

        // priceId:
      };
      updateOnboardingData({subscription: subscriptionData});
      saveCurrentStep(currentStep + 1);
    } catch (err) {
      ShowToast(err instanceof Error ? err.message : "Unknown error", "error");
    } finally {
      setLoading(false);
    }
  };
  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === 2) {
        createPaymentIntent();
        return;
      }
      if (!isStepComplete(currentStep)) {
        ShowToast("Please complete all required fields", "error");
        return;
      }
      // sumbitOnboardingData();

      saveCurrentStep(currentStep + 1);
      return;
    }
  };
  const sumbitOnboardingData = async () => {
    try {
      if (user) {
        try {
          const data = {
            ...onboardingData,
            user_id: user.id,
          };
          const checkUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/${organizations}`;
          const checkResponse = await fetch(checkUrl, {
            method: "POST",
            headers: {"Content-Type": "application/json"},

            body: JSON.stringify(data),
          });

          if (!checkResponse.ok) {
            ShowToast("Error occured while onboarding", "error");
          }

          // Clear localStorage after successful completion
          if (user?.id) {
            ShowToast("User has been onboarded successfully!");

            router.push("/dashboard");
          }
        } catch (metaError) {
          console.error("Failed to update user metadata:", metaError);
          ShowToast("User update failed", "error");
        }
      } else {
        console.warn(
          "User is undefined – make sure the user is authenticated."
        );
      }
    } catch (error) {
      console.error("submitOnboardingData failed:", error);
      ShowToast("Error completing onboarding", "error");
    } finally {
    }
  };
  const handleCompleteOnboarding = async () => {
    try {
      setUserOnboarding(true);

      if (!user?.id) {
        throw new Error("User ID is missing");
      }

      const userData = {
        status: UserStatus.approved,
      };

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.id}`;

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Request failed with status ${response.status}`
        );
      }
      router.push("/dashboard");

      ShowToast("Onboarding completed successfully!");
      clearOnboardingData(user.id);
    } catch (error) {
      console.error("Onboarding completion failed:", error);

      let errorMessage = "Failed to complete onboarding";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      ShowToast(errorMessage, "error");

      // Optional: Track the error with your error monitoring service
      // trackError('onboarding_completion_error', error);
    } finally {
      setUserOnboarding(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      saveCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    {
      title: "Organization",
      component: (
        <OrganizationSetup
          organizationData={onboardingData.organization}
          updateOrganization={updateOrganization}
          onNext={() => saveCurrentStep(currentStep + 1)}
          onPrevious={() => currentStep > 0 && saveCurrentStep(currentStep - 1)}
        />
      ),
    },
    {
      title: "Profile",
      component: (
        <ProfileSetup
          profileData={onboardingData.user}
          updateProfile={updateProfile}
          role={"owner"}
          onNext={() => saveCurrentStep(currentStep + 1)}
          onPrevious={() => currentStep > 0 && saveCurrentStep(currentStep - 1)}
        />
      ),
    },
    {
      title: "Pricing",
      component: (
        <PricingPlan
          setPriceId={setPriceId}
          setPaymentPlan={setPaymentPlan}
          org_id={organization?.id}
        />
      ),
    },
    {
      title: "Payment",
      component: (
        <Payment
          onPrevious={() => currentStep > 0 && saveCurrentStep(currentStep - 1)}
          updateOnboardingData={updateOnboardingData}
          sumbitOnboardingData={sumbitOnboardingData}
        />
      ),
    },
  ];
  useEffect(() => {
    setloading(true);

    const loadOnboardingState = async () => {
      if (!user || !isLoaded) return;

      try {
        // First check localStorage for saved step
        if (user.id) {
          const savedStep = localStorage.getItem(
            `${CURRENT_STEP_KEY}_${user.id}`
          );
          const savedData = localStorage.getItem(
            `${ONBOARDING_DATA_KEY}_${user.id}`
          );

          if (savedStep !== null) {
            // If we have a saved step, use it
            setCurrentStep(Number.parseInt(savedStep, 10));
            setloading(false);

            if (savedData) {
              const parsedData = JSON.parse(savedData);
              setOnboardingData(parsedData);

              if (parsedData.organization) {
                setOrganization(parsedData.organization);
              }

              if (parsedData.user) {
                setUserDetails(parsedData.user);
              }

              // We have everything we need from localStorage
              return;
            }
          }
        }

        // If no localStorage data or incomplete, fall back to API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/onboarding-data/${user?.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            redirect: "follow",
          }
        );

        if (response) {
          const responseData = await response.json();
          setOrganization(responseData?.data.organizations);
          setUserDetails(responseData?.data);

          // Determine step based on status
          let stepToSet = 0;

          if (responseData?.data?.datastatus === UserStatus.Pending) {
            stepToSet = 0;
          } else if (
            responseData?.data?.status === UserStatus.OrganizationDetails
          ) {
            stepToSet = 1;
          } else if (responseData?.data?.status === UserStatus.SetupProfile) {
            stepToSet = 2;
          } else if (
            responseData?.data?.status === UserStatus.PlanSelected ||
            responseData?.data?.status === UserStatus.complete ||
            responseData?.data?.status === UserStatus.approved
          ) {
            stepToSet = 3;
          }

          // Save to localStorage for future visits
          if (user.id) {
            localStorage.setItem(
              `${CURRENT_STEP_KEY}_${user.id}`,
              stepToSet.toString()
            );

            // Also save the onboarding data
            const dataToSave: UserOnboardingData = {};

            if (responseData?.data) {
              dataToSave.user = {
                firstName: responseData.data.first_name,
                lastName: responseData.data.last_name,
                username: responseData.data.user_name,
                user_role: responseData.data.user_role,
                profile_picture: responseData.data.profile?.picture,
                location: responseData.data.location,
                status: responseData.data.status,
              };
            }

            if (responseData?.data.organizations) {
              dataToSave.organization = {
                name: responseData.data.organizations.name || "",
                departments: responseData.data.organizations
                  .departments as Department[],
                num_of_seat: responseData.data.organizations.num_of_seat,
                id: responseData.data.organizations.id,
              };
            }

            // localStorage.setItem(
            //   `${ONBOARDING_DATA_KEY}_${user.id}`,
            //   JSON.stringify(dataToSave)
            // );
          }

          saveCurrentStep(stepToSet);
        }
      } catch (error) {
        console.error("Error loading onboarding state:", error);
      } finally {
        setloading(false);
      }
    };

    loadOnboardingState();
  }, [user, isLoaded]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="absolute top-0 left-0 z-50 flex flex-col w-full">
        <div className="flex items-center px-4 py-3">
          <div className="mr-2 rounded-full p-2">
            <img src="/file2.png" alt="Logo" />
          </div>
          <h1
            className="text-xl font-bold"
            style={{color: currentStep === 3 ? "black" : "white"}}
          >
            Pohloh
          </h1>
        </div>
      </div>

      <div className={currentStep !== 3 ? "h-[128px]" : "h-0"} />

      <main className="flex-1">
        {isloading || !isLoaded || !userDetails ? (
          <div className="flex flex-row justify-center items-center">
            <Loader size={50} />{" "}
          </div>
        ) : (
          steps[currentStep].component
        )}
      </main>

      <footer className="flex justify-between items-center px-16 pb-8 mt-auto">
        <Button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="w-[185px] h-[48px] rounded-[8px] border border-gray-300 px-3 py-[12px] gap-4 bg-[#2C2D2E] hover:bg-[#2C2D2E] disabled:opacity-50"
        >
          Back
        </Button>
        <Button
          onClick={() => {
            if (currentStep === steps.length - 1) {
              handleCompleteOnboarding();
            } else {
              handleNext();
            }
          }}
          disabled={
            currentStep === steps.length - 1 &&
            !onboardingData.subscription?.is_subscribed
          }
          className="w-[185px] h-[48px] rounded-[8px] text-black border border-gray-300 px-3 py-[12px] gap-4 bg-[#F9DB6F] hover:bg-[#F9DB6F]"
        >
          {currentStep === 2 && loading ? (
            <Loader />
          ) : currentStep === steps.length - 1 ? (
            userOnboarding ? (
              <Loader />
            ) : (
              "Complete"
            )
          ) : (
            "Next"
          )}
        </Button>
      </footer>
    </div>
  );
};

export default OnboardingPage;
