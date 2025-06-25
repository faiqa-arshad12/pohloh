"use client";
import {useEffect, useState} from "react";
import {Check, Download, FileText} from "lucide-react";
import Image from "next/image";
import Table from "../ui/table";
import {useRouter} from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {ShowToast} from "@/components/shared/show-toast";
import {useUser} from "@clerk/nextjs";
import Loader from "../shared/loader";
import {apiUrl, users, planFeatures} from "@/utils/constant";
import {getSubscriptionDetails} from "@/actions/subscription.action";
import PaymentPage from "./payment";
import {Skeleton} from "@/components/ui/skeleton";
import {Icon} from "@iconify/react/dist/iconify.js";

// Skeleton components for loading states
const SubscriptionSkeleton = () => (
  <div className="w-full lg:w-1/3 flex flex-col justify-between p-4 rounded-lg animate-pulse">
    <div className="gap-5 mt-20">
      <Skeleton className="h-8 w-3/4  mb-4" />
      <Skeleton className="h-6 w-1/2  mb-2" />
      <Skeleton className="h-8 w-2/3  mb-4" />
      <div className="flex flex-row items-center mt-5">
        <Skeleton className="h-8 w-32  mr-2" />
        <Skeleton className="h-8 w-8 " />
      </div>
    </div>
    <div className="my-15">
      <Skeleton className="h-10 w-full  mt-8" />
    </div>
  </div>
);

const PlansSkeleton = ({isCanceled = false}) => (
  <div className="w-full lg:w-2/3 flex flex-col p-6 rounded-2xl animate-pulse">
    <div className="flex justify-center w-full">
      <Skeleton className="h-16 w-full max-w-md  mb-6 rounded-2xl" />
    </div>
    <div className="w-full flex gap-6 mt-6">
      {[1, 2].map((i) => (
        <div
          key={i}
          className={`w-full h-full p-4 rounded-[23px] flex flex-col justify-between bg-[#FFFFFF0A] ${
            isCanceled ? "opacity-80" : ""
          }`}
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="w-[78.81px] h-[78.81px] rounded-full " />
              <div className="text-right">
                <Skeleton className="h-12 w-24 " />
              </div>
            </div>
            <Skeleton className="h-6 w-1/2  mb-2" />
            <Skeleton className="h-4 w-3/4  mb-4" />
            <Skeleton className="h-px w-full bg-gray-600 mb-5" />
            <div className="space-y-5">
              {[1, 2, 3, 4].map((j) => (
                <div className="flex items-center" key={j}>
                  <Skeleton className="w-4 h-4 rounded-full  mr-2" />
                  <Skeleton className="h-4 w-3/4 " />
                </div>
              ))}
            </div>
          </div>
          <Skeleton
            className={`h-[56.51px] w-full  mt-5 rounded-[9.42px] ${
              isCanceled ? "/30" : ""
            }`}
          />
        </div>
      ))}
    </div>
  </div>
);

const InvoicesSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex justify-between mb-4 flex-wrap">
      <Skeleton className="h-8 w-32 " />
    </div>
    <div className="mt-4">
      <Skeleton className="h-12 w-full  mb-2 rounded" />
      <div className="space-y-4">
        {Array.from({length: 5}).map((_, i) => {
          const widthPercent = 100 - i * 10; // 100%, 90%, 80%, ...
          return (
            <Skeleton
              key={i}
              className={`h-[28px]`}
              style={{width: `${widthPercent}%`}}
            />
          );
        })}
      </div>
    </div>
  </div>
);

const handleDownloadInvoice = (invoiceUrl: string) => {
  if (!invoiceUrl) {
    ShowToast("Invoice PDF not available", "error");
    return;
  }
  const link = document.createElement("a");
  link.href = invoiceUrl;
  link.setAttribute("download", "");
  link.setAttribute("target", "_blank");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  ShowToast("Invoice downloaing...", "success");
};

const tutorColumns = [
  {
    Header: "Invoice",
    accessor: "id",
    cell: (value: any) => (
      <span className="flex items-center gap-2">
        <Icon icon="ph:files-bold" width="24" height="24" color="white" />

        {`Inv ${value.substring(0, 8)}`}
      </span>
    ),
  },
  {
    Header: "Date",
    accessor: "created",
    cell: (value: any) => {
      const date = new Date(value * 1000);
      return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    },
  },
  {
    Header: "Amount",
    accessor: "amount_paid",
    cell: (value: any) => {
      // Format as currency
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value / 100); // Assuming amount is in cents
    },
  },
  {
    Header: "Actions",
    accessor: "invoice_pdf",
    cell: (value: any) => (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDownloadInvoice(value);
        }}
        className="hover:text-[#F9E36C] transition-colors"
      >
        <Download className="w-5 h-5" />
      </button>
    ),
  },
];

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

export default function Billing() {
  // const searchParams = useSearchParams();
  // const page = searchParams.get("page");

  const [billingCycle, setBillingCycle] = useState<"month" | "year">("month");
  const [selectedPriceId, setSelectedPriceId] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchingPlans, setIsFetchingPlans] = useState<boolean>(false);
  const router = useRouter();

  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>();
  const [plans, setPlans] = useState<Plan[]>([]);
  const {user, isLoaded} = useUser();
  const [subscription, setSubscription] = useState<any>();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSubscriptionCanceled, setIsSubscriptionCanceled] = useState(false);
  const [invoiceLoading, setIsInvoiceLoading] = useState(false);
  const [userLoading, setIsUserLoading] = useState(false);

  const createPaymentIntent = async () => {
    try {
      setIsLoading(true);
      let response;
      if (
        userData.organizations.subscriptions[0]?.subscription_id &&
        !isSubscriptionCanceled
      ) {
        response = await fetch(
          `${window.location.origin}/api/stripe/update-subscription`,
          {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
              subscriptionId:
                userData.organizations.subscriptions[0]?.subscription_id,
              currentPriceId: subscription.plan.id,
              quantity: userData.organizations.num_of_seat || 1,
              newPriceId: selectedPriceId,
            }),
          }
        );
      } else {
        response = await fetch(`${window.location.origin}/api/stripe`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            customerId: userData.organizations.subscriptions[0]?.customer_id,
            quantity: userData.organizations.num_of_seat || 1,
            priceId: selectedPriceId,
            email: userData.email,
          }),
        });
      }
      if (!response.ok) throw new Error("Failed to create payment intent");

      const data = await response.json();
      if (!data.clientSecret) {
        ShowToast("Subscription has been updated successfully!");
      } else {
        setClientSecret(data.clientSecret);
        setOpenEdit(true);
      }
    } catch (err) {
      ShowToast(err instanceof Error ? err.message : "Unknown error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function fetchCustomerInvoices(customerId: string) {
      try {
        setIsInvoiceLoading(true);
        const response = await fetch(
          `/api/stripe/invoices?customerId=${customerId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch invoices");
        }

        const data = await response.json();
        setInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        throw error;
      } finally {
        setIsInvoiceLoading(false);
      }
    }
    if (userData && userData?.organizations?.subscriptions)
      fetchCustomerInvoices(
        userData.organizations.subscriptions[0].customer_id
      );
  }, [userData]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsFetchingPlans(true);
        const res = await fetch("/api/stripe/plan");
        const data = await res.json();

        if (data && data.length > 0) {
          setPlans(data);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        ShowToast("Failed to fetch plans", "error");
      } finally {
        setIsFetchingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  const handleOpenModal = () => {
    setOpenEdit(false);
  };

  const renderTutorCell = (accessor: any, row: any) => {
    const column = tutorColumns.find((col) => col.accessor === accessor);
    const value = row[accessor];

    if (column && column.cell) {
      return column.cell(value);
    }

    return <span>{value}</span>;
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsUserLoading(true);
        const response = await fetch(
          `${apiUrl}/${users}/onboarding-data/${user?.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            // credentials: "include",
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to create user: ${response.status} - ${errorText}`
          );
        }

        const result = await response.json();
        setUserData(result?.data);
      } catch (err) {
        console.error("Error creating user:", err);
      } finally {
        setIsUserLoading(false);
      }
    };

    if (user) {
      fetchUser();
    }
  }, [user]);

  useEffect(() => {
    const getSubscriptionData = async () => {
      const subscription = await getSubscriptionDetails(
        userData?.organizations?.subscriptions[0].subscription_id
      );
      setSubscription(subscription);
      setBillingCycle((subscription?.plan?.interval as "month") || "year");
      if (subscription?.status === "canceled") {
        setIsSubscriptionCanceled(true);
        setSelectedPriceId("");
      } else {
        setIsSubscriptionCanceled(false);
        setSelectedPriceId(subscription?.plan?.id || "");
      }
    };

    if (userData && userData?.organizations?.subscriptions) {
      getSubscriptionData();
    }
  }, [userData]);

  const handleCancelPlan = async () => {
    const shouldCancel = window.confirm(
      "Are you sure you want to cancel your subscription?"
    );
    if (!shouldCancel) return;
    try {
      setIsCancelling(true);
      if (!userData?.organizations?.subscriptions?.[0]?.customer_id) {
        ShowToast("Customer ID not found", "error");
        return;
      }

      const customerId = userData.organizations.subscriptions[0].customer_id;

      const response = await fetch(`api/stripe/cancel-subscription`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({customerId}),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || response.statusText;
        throw new Error(`Failed to cancel subscription: ${errorMessage}`);
      }

      ShowToast("Subscription canceled successfully", "success");
      router.push("/settings?page=2");
      setIsSubscriptionCanceled(true);
      setSelectedPriceId("");
    } catch (err) {
      console.error("Error canceling subscription:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      ShowToast(`Failed to cancel subscription: ${errorMessage}`, "error");
    } finally {
      setIsCancelling(false);
    }
  };

  // Check if we're in a global loading state
  const isInitialLoading = !isLoaded || (isLoaded && !user);

  if (isInitialLoading) {
    return (
      <div className="bg-[#191919] rounded-[30px] w-full text-white p-4 md:p-6 mx-auto">
        <div className="flex flex-col md:flex-row gap-5 mt-2 justify-between">
          <SubscriptionSkeleton />
          <PlansSkeleton />
        </div>
        <div className="bg-[#191919] rounded-lg p-4 mb-8 relative flex flex-col justify-center mt-8">
          <InvoicesSkeleton />
        </div>
      </div>
    );
  }

  if (isLoading && plans.length === 0) {
    return (
      <div className="bg-[#191919] rounded-[30px] w-full text-white p-4 md:p-6 mx-auto flex items-center justify-center min-h-[300px]">
        <Loader size={50} />
      </div>
    );
  }

  return (
    <div className="bg-[#191919] rounded-[30px] w-full text-white p-4 md:p-6 mx-auto">
      {/* Header */}
      <div className="mb-6 text-white font-sans">
        <div
          // className={`flex flex-col md:flex-row gap-5 mt-2 ${
          //   !userData?.organizations?.subscriptions[0]?.is_subscribed ||
          //   isSubscriptionCanceled
          //     ? "justify-center"
          //     : "justify-between"
          // }`}
          className={`flex flex-col md:flex-row gap-5 mt-2 justify-center
          `}
        >
          {/* {userLoading
            ? !isSubscriptionCanceled && <SubscriptionSkeleton />
            : userData?.organizations?.subscriptions[0]?.is_subscribed &&
              !isSubscriptionCanceled && (
                <div className="w-full lg:w-1/3 flex flex-col justify-between p-4 rounded-lg">
                  <div className="gap-5 mt-20">
                    <h2 className="text-[#F9DB6F] font-urbanist font-semibold text-[30px] leading-[24px] tracking-[0]">
                      Pohloh {subscription?.plan?.name} Plan
                    </h2>
                    <div className="flex flex-row justify-between">
                      <>
                        <p className="font-urbanist font-medium text-[24px] leading-[24px] tracking-[0] mt-5">
                          Next Bill Date
                        </p>
                        <p className="text-[#F9DB6F] font-urbanist font-semibold text-[30px] leading-[24px] tracking-[0] mt-2">
                          {subscription?.nextBillingDate
                            ? new Date(
                                subscription.nextBillingDate * 1000
                              ).toDateString()
                            : "N/A"}
                        </p>
                      </>
                      <div className="flex flex-row items-center mt-5">
                        <p className="text-white font-urbanist font-semibold text-[30px] leading-[24px] tracking-[0]">
                          Total Seat:
                        </p>
                        <p className="ml-1 text-white font-urbanist font-semibold text-[30px] leading-[24px] tracking-[0]">
                          {subscription?.plan?.subscription?.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-row items-center mt-5">
                      <p className="text-white font-urbanist font-semibold text-[30px] leading-[24px] tracking-[0]">
                        Total Seat:
                      </p>
                      <p className="ml-1 text-white font-urbanist font-semibold text-[30px] leading-[24px] tracking-[0]">
                        {subscription?.plan?.subscription?.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="my-15">
                    {!isSubscriptionCanceled && (
                      <button
                        className="bg-transparent text-white border border-white rounded-[8px] py-2 px-4 font-medium w-full cursor-pointer text-center items-center justify-center flex"
                        onClick={handleCancelPlan}
                      >
                        {isCancelling ? <Loader /> : "Cancel Plan"}
                      </button>
                    )}
                  </div>
                </div>
              )} */}

          {fetchingPlans ? (
            <PlansSkeleton isCanceled={isSubscriptionCanceled} />
          ) : (
            <div className="w-full lg:w-2/3 flex flex-col justify-center p-6 rounded-2xl">
              {/* Billing Toggle */}
              <div className="flex justify-center w-full">
                <div className="bg-[#FFFFFF14] bg-opacity-10 rounded-2xl p-2 flex items-center justify-center gap-2 w-full max-w-md">
                  {["year", "month"].map((type) => (
                    <button
                      key={type}
                      className={`cursor-pointer w-full h-12 rounded-md flex items-center justify-center font-urbanist font-medium text-[22.27px] leading-[100%] tracking-[0] align-middle transition-all duration-200  ${
                        billingCycle === type
                          ? "bg-[#F9DB6F] text-black shadow-md"
                          : "text-white hover:bg-transparent hover:bg-opacity-5"
                      }`}
                      onClick={() => setBillingCycle(type as "month" | "year")}
                    >
                      {type === "year" ? "Yearly" : "Monthly"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plans */}
              <div className="w-full flex gap-6 mt-6">
                {plans.map((plan) => {
                  const price = plan.prices.find(
                    (p) => p.interval === billingCycle
                  );
                  if (!price) return null;
                  // Determine if this is the current plan
                  const isCurrent =
                    subscription?.plan?.id === price.id &&
                    userData?.organizations?.subscriptions[0]?.is_subscribed &&
                    !isSubscriptionCanceled;
                  // Determine if this is the selected plan (but not current)
                  const isSelected = selectedPriceId === price.id && !isCurrent;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        if (!isCurrent) setSelectedPriceId(price.id);
                      }}
                      className={`w-full h-full p-6 rounded-[23px] flex flex-col justify-between border transition cursor-pointer relative
                        ${
                          isCurrent
                            ? "bg-black border-none"
                            : isSelected
                            ? "bg-black  border-none shadow-md"
                            : "border-none bg-[#FFFFFF0A] hover:border-yellow-500/50 hover:bg-[#ffffff10]"
                        }
                        group
                      `}
                      style={{minHeight: 420}}
                    >
                      {/* Badge for Current/Selected */}
                      {/* {isCurrent && (
                        <span className="absolute top-4 right-4 bg-[#F9DB6F] text-black font-urbanist font-bold text-[15px] px-4 py-1 rounded-full z-10 shadow">
                          Current
                        </span>
                      )}
                      {isSelected && !isCurrent && (
                        <span className="absolute top-4 right-4 bg-[#232323] text-[#F9DB6F] font-urbanist font-bold text-[15px] px-4 py-1 rounded-full z-10 border border-[#F9DB6F] shadow">
                          Selected
                        </span>
                      )} */}
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
                                <span className="text-lg text-[#D1D1D1] px-2 pt-[-5px] text-[18px]">
                                  $
                                </span>
                                <span className="invisible">.</span>
                              </div>
                              <span className="font-urbanist font-normal text-[50px] leading-[100%] text-white">
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
                        <h3 className="font-urbanist font-semibold text-[24px] leading-[22px] mb-2 text-white">
                          {plan.name} Plan
                        </h3>
                        <p className="text-[#707070] font-urbanist text-[14px] mb-4">
                          {plan.description || "Perfect plan to check"}
                        </p>
                        {/* Show current plan info only on current plan */}
                        {isCurrent && (
                          <div className="flex flex-row justify-between py-4">
                            <div className="flex flex-col  gap-2">
                              <p className="font-urbanist font-medium text-[19.11px] leading-[24px] tracking-[0] mt-2 text-white">
                                Next Bill Date
                              </p>
                              <p className="text-[#F9DB6F] font-urbanist font-semibold text-[19.11px] leading-[24px] tracking-[0] mt-1">
                                {subscription?.nextBillingDate
                                  ? new Date(
                                      subscription.nextBillingDate * 1000
                                    ).toLocaleDateString("en-US", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })
                                  : "N/A"}
                              </p>
                            </div>
                            <div className="flex flex-col  mt-2 gap-2">
                              <p className="text-white font-urbanist font-semibold text-[19.11px] leading-[24px] tracking-[0]">
                                Total Seats
                              </p>
                              <p className="ml-1 text-[#F9DB6F] font-urbanist font-semibold text-[19px] leading-[24px] tracking-[0]">
                                {subscription?.plan?.subscription?.quantity}{" "}
                                Seats
                              </p>
                            </div>
                          </div>
                        )}
                        <div className="border-t border-[#E5E5E5] mb-5"></div>
                        <div className="space-y-5">
                          {planFeatures
                            .find((p) => p.tier === plan.name)
                            ?.features.map((feature) => (
                              <div className="flex items-center" key={feature}>
                                {/* <Check
                                  size={16}
                                  className="text-[#F9DB6F] mr-2"
                                /> */}
                                <img
                                  src="/billing-check.png"
                                  className="mr-2"
                                  alt="billing"
                                />

                                <span className="font-urbanist font-normal text-[14.13px] text-[#707070]">
                                  {feature}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                      <div className="flex flex-row justify-between gap-7">
                        {" "}
                        {/* Button logic */}
                        {isCurrent && (
                          <button
                            className={`rounded-[9.42px] h-[56.51px] w-full font-urbanist font-[600] text-[18px] mt-5 flex items-center justify-center cursor-pointer transition-all duration-200
                             ${
                               isCurrent
                                 ? "bg-[#F9DB6F] text-black border-none"
                                 : isSelected
                                 ? "bg-[#F9DB6F] text-black border-none"
                                 : "bg-transparent border border-white text-white w-full hover:bg-[#F9DB6F] hover:text-black"
                             }

                           `}
                            disabled={
                              isLoading
                              // ||
                              // isCurrent ||
                              // (isSubscriptionCanceled && !isCurrent)
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPriceId(price.id);
                              createPaymentIntent();
                            }}
                          >
                            {isSelected ? (
                              isLoading ? (
                                <Loader />
                              ) : (
                                <>Change Plan</>
                              )
                            ) : (
                              "Change Plan"
                            )}
                          </button>
                        )}
                        <button
                          className={`rounded-[9.42px] h-[56.51px] w-full font-urbanist font-semibold text-[18px] mt-5 flex items-center justify-center cursor-pointer transition-all duration-200
                          ${
                            isCurrent
                              ? "bg-transparent border border-white text-white"
                              : isSelected
                              ? "bg-[#F9DB6F] text-black border-none w-full"
                              : "bg-transparent border border-white text-white w-full hover:bg-[#F9DB6F] hover:text-black"
                          }

                        `}
                          disabled={
                            isLoading
                            // ||
                            // isCurrent ||
                            // (isSubscriptionCanceled && !isCurrent)
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isCurrent) {
                              handleCancelPlan();
                            }
                            // if (!isCurrent && !isSubscriptionCanceled) {
                            setSelectedPriceId(price.id);
                            createPaymentIntent();
                            // }
                          }}
                        >
                          {isCurrent ? (
                            isCancelling ? (
                              <Loader />
                            ) : (
                              "Cancel Plan"
                            )
                          ) : isSelected ? (
                            isLoading ? (
                              <Loader />
                            ) : plan.name === "Premium" ? (
                              `Upgrade to ${plan.name}`
                            ) : (
                              `Choose ${plan.name}`
                            )
                          ) : plan.name === "Premium" ? (
                            `Upgrade to ${plan.name}`
                          ) : (
                            `Choose ${plan.name}`
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/**Invoices */}
      <div className="bg-[#191919] rounded-lg p-4 mb-8 relative flex flex-col justify-center">
        <div className="flex justify-between mb-4 flex-wrap">
          <h3 className="text-[24px] font-urbanist">Invoices</h3>
        </div>
        {invoiceLoading || userLoading ? (
          <InvoicesSkeleton />
        ) : (
          <div className="mt-4 overflow-x-auto ">
            <Table
              columns={tutorColumns}
              data={invoices}
              renderCell={renderTutorCell}
              tableClassName="w-full text-sm cursor-pointer"
              headerClassName="bg-[#F9DB6F] text-black text-left"
              bodyClassName="divide-y divide-gray-700 cursor-pointer "
              cellClassName="py-2 px-4 w-[1084px] h-[68px] gap-[155px] pt-[11.95px] pr-[15.93px] pb-[11.95px] pl-[15.93px] border-t border-[#E0EAF5] font-sharp text-[15.93px] leading-[21.9px] tracking-[0] font-normal "
              itemsPerPageOptions={[5, 10, 20, 100]}
              defaultItemsPerPage={5}
            />
          </div>
        )}
      </div>

      <Dialog open={openEdit} onOpenChange={handleOpenModal}>
        <DialogContent className="overflow-y-auto w-full max-w-[864px] h-auto bg-[#222222] text-white border-none bg-[#0E0F11]">
          <DialogHeader>
            <DialogTitle className="text-[32px]">Payment Method</DialogTitle>
          </DialogHeader>
          <div className="w-full">
            <PaymentPage
              clientSecret={clientSecret || ""}
              setOpen={setOpenEdit}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
