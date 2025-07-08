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
  apiUrl,
  CURRENT_STEP_KEY,
  ONBOARDING_DATA_KEY,
  organizations,
} from "@/utils/constant";
import {UserStatus} from "@/types/enum";
import {clearOnboardingData} from "@/lib/local-storage";
import {useUserHook} from "@/hooks/useUser";

const OnboardingPage = () => {
  // No error state needed for toast-only approach
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [onboardingData, setOnboardingData] = useState<UserOnboardingData>({});
  const [priceId, setPriceId] = useState<string | null>(null);
  const [isloading, setloading] = useState(true);
  const [userOnboarding, setUserOnboarding] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const router = useRouter();
  const {user, isLoaded} = useUser();

  const handleError = (error: unknown) => {
    console.error("Onboarding error:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "An unknown error occurred";

    ShowToast(errorMessage, "error");
  };

  const updateOnboardingData = (newData: Partial<UserOnboardingData>) => {
    try {
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
    } catch (error) {
      handleError(
        "Failed to update onboarding data: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
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
    try {
      setCurrentStep(step);
      if (user?.id) {
        localStorage.setItem(`${CURRENT_STEP_KEY}_${user.id}`, step.toString());
      }
    } catch (error) {
      handleError(
        "Failed to save current step: " +
          (error instanceof Error ? error.message : String(error))
      );
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
        } catch (err) {
          console.error("Error loading onboarding data:", err);
          ShowToast("Failed to load saved onboarding data", "error");
        }
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
      ShowToast("Please select a payment plan", "error");
      return false;
    }

    try {
      setLoading(true);

      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const savedData = localStorage.getItem(
        `${ONBOARDING_DATA_KEY}_${user.id}`
      );

      if (!savedData) {
        throw new Error("No onboarding data found");
      }

      const parsedData = JSON.parse(savedData);

      if (!parsedData.organization?.num_of_seat) {
        throw new Error("Number of seats is required");
      }

      if (!user?.primaryEmailAddress?.emailAddress) {
        throw new Error("User email is required");
      }

      const response = await fetch(`${window.location.origin}/api/stripe`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          priceId: priceId,
          email: user.primaryEmailAddress.emailAddress,
          quantity: parsedData.organization.num_of_seat,
          // productId: "prod_SDJXRzkYd0KnUL",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Payment request failed with status ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.customerId || !data.subscriptionId || !data.clientSecret) {
        throw new Error(data.message || "Invalid payment response data");
      }

      const subscriptionData = {
        customer_id: data.customerId,
        plan_type: `${paymentPlan?.plan}_${paymentPlan?.billingCycle}`,
        org_id: organization?.id || "",
        subscription_id: data.subscriptionId,
        is_subscribed: false,
        client_secret: data.clientSecret,
        amount: data.amount,
        quantity: data.quantity,
      };

      updateOnboardingData({subscription: subscriptionData});
      saveCurrentStep(currentStep + 1);
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown payment error";
      handleError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    try {
      if (currentStep < steps.length - 1) {
        if (currentStep === 2) {
          const success = await createPaymentIntent();
          if (!success) return;
        } else {
          if (!isStepComplete(currentStep)) {
            ShowToast("Please complete all required fields", "error");
            return;
          }
          saveCurrentStep(currentStep + 1);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const sumbitOnboardingData = async () => {
    try {
      if (!user) {
        throw new Error("User is not authenticated");
      }

      if (!onboardingData.organization || !onboardingData.user) {
        throw new Error("Missing required onboarding data");
      }

      const data = {
        ...onboardingData,
        user_id: user.id,
      };

      const apiRoute = `${apiUrl}/${organizations}`;

      if (!apiRoute) {
        throw new Error("API URL is not configured");
      }

      const response = await fetch(apiRoute, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to save onboarding data with status ${response.status}`
        );
      }
      return true;
    } catch (error) {
      handleError(
        "Failed to submit onboarding data: " +
          (error instanceof Error ? error.message : String(error))
      );
      return false;
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      setUserOnboarding(true);

      if (!user?.id) {
        throw new Error("User ID is missing");
      }

      // First submit the onboarding data
      const submitSuccess = await sumbitOnboardingData();
      if (!submitSuccess) {
        throw new Error("Failed to save onboarding data");
      }

      // Call backend API to update Clerk metadata
      const response = await fetch(`${window.location.origin}/api/complete-onboarding`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({userId: user.id}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            "Failed to update user status in authentication provider"
        );
      }

      // Update user status in your backend as before
      const userData = {
        status: UserStatus.approved,
      };

      const apiRoute = `${apiUrl}/users/${user.id}`;

      if (!apiRoute) {
        throw new Error("API URL is not configured");
      }

      const backendResponse = await fetch(apiRoute, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!backendResponse.ok) {
        const errorData = await backendResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Request failed with status ${backendResponse.status}`
        );
      }

      // Clear onboarding data before redirecting
      router.replace("/dashboard");
      clearOnboardingData(user.id);
      ShowToast("Onboarding completed successfully!");
    } catch (error) {
      handleError(
        "Onboarding completion failed: " +
          (error instanceof Error ? error.message : String(error))
      );
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
    const loadOnboardingState = async () => {
      if (!user || !isLoaded) return;

      setloading(true);
      // No need to reset error state

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
            const parsedStep = Number.parseInt(savedStep, 10);
            if (isNaN(parsedStep)) {
              throw new Error("Invalid saved step value");
            }

            setCurrentStep(parsedStep);

            if (savedData) {
              try {
                const parsedData = JSON.parse(savedData);
                setOnboardingData(parsedData);

                if (parsedData.organization) {
                  setOrganization(parsedData.organization);
                }

                if (parsedData.user) {
                  setUserDetails(parsedData.user);
                }

                // We have everything we need from localStorage
                setloading(false);
                return;
              } catch (parseError) {
                console.error(
                  "Error parsing saved onboarding data:",
                  parseError
                );
                // Continue to API fallback if localStorage data is corrupted
              }
            }
          }
        }

        // If no localStorage data or incomplete, fall back to API
        const apiRoute = `${apiUrl}/users/onboarding-data/${user?.id}`;

        if (!apiRoute) {
          throw new Error("API URL is not configured");
        }

        const response = await fetch(apiRoute, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          redirect: "follow",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `API request failed with status ${response.status}`
          );
        }

        const responseData = await response.json();

        if (!responseData || !responseData.data) {
          throw new Error("Invalid response data from API");
        }

        setOrganization(responseData?.data.organizations);
        setUserDetails(responseData?.data);

        // Determine step based on status
        let stepToSet = 0;

        if (responseData?.data?.status === UserStatus.Pending) {
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
              first_name: responseData.data.first_name,
              last_name: responseData.data.last_name,
              user_name: responseData.data.user_name,
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

          // Uncomment if you want to save the data to localStorage
          // localStorage.setItem(
          //   `${ONBOARDING_DATA_KEY}_${user.id}`,
          //   JSON.stringify(dataToSave)
          // )
        }

        saveCurrentStep(stepToSet);
      } catch (error) {
        console.error("Error loading onboarding state:", error);
        ShowToast(
          "Failed to load onboarding state: " +
            (error instanceof Error ? error.message : String(error)),
          "error"
        );

        // Set default values to allow user to continue
        if (!userDetails) {
          setUserDetails({} as User);
        }
      } finally {
        setloading(false);
      }
    };

    loadOnboardingState();
  }, [user, isLoaded]);
  const {userData} = useUserHook();

  useEffect(() => {
    if (userData && userData?.status === "approved") {
      router.replace("/dashboard");
    }
  }, [userData, router]);

  // No retry function needed for toast-only approach
  // if (userData && userData?.status === "approved") {
  //   router.replace("/dashboard");
  // }
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
        {isloading || !isLoaded ? (
          <div className="flex flex-col justify-center items-center h-full">
            <Loader size={50} />
          </div>
        ) : !userDetails ? (
          <div className="flex flex-col justify-center items-center h-full">
            <Loader size={50} />
            <p className="mt-4 text-gray-500">
              Unable to load user data. Please refresh the page.
            </p>
          </div>
        ) : (
          steps[currentStep].component
        )}
      </main>

      <footer className="flex justify-between items-center px-16 pb-8 mt-auto">
        <Button
          onClick={handleBack}
          disabled={
            currentStep === 0 ||
            isloading ||
            onboardingData.subscription?.is_subscribed ||
            !onboardingData
          }
          className="w-[185px] h-[48px] rounded-[8px] border border-gray-300 px-3 py-[12px] gap-4 bg-[#2C2D2E] hover:bg-[#2C2D2E] disabled:opacity-50 cursor-pointer"
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
            isloading ||
            (currentStep === steps.length - 1 &&
              !onboardingData.subscription?.is_subscribed)
          }
          className="w-[185px] h-[48px] rounded-[8px] text-black border border-gray-300 px-3 py-[12px] gap-4 bg-[#F9DB6F] hover:bg-[#F9DB6F] disabled:opacity-50 cursor-pointer"
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
