"use client";

import {useEffect, useState, useCallback} from "react";
import {Download} from "lucide-react";
import Image from "next/image";
import Table from "../ui/table";
import {useRouter} from "next/navigation";
import {ShowToast} from "@/components/shared/show-toast";
import {useUser} from "@clerk/nextjs";
import Loader from "../shared/loader";
import {apiUrl, users, planFeatures} from "@/utils/constant";
import {getSubscriptionDetails} from "@/actions/subscription.action";
import {Icon} from "@iconify/react/dist/iconify.js";
import {PlansSkeleton} from "../shared/plans-skeleton";
import {SubscriptionSkeleton} from "../shared/subscription-skeleton";
import InvoicesSkeleton from "../shared/invoices-skeleton";
import PaymentModal from "./payment-modal";
import type {Plan} from "@/types/billings.types";
import CancelConfirmationModal from "../shared/logout-popup";

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
  ShowToast("Invoice downloading...", "success");
};

const getPlanTypeFromInvoice = (invoice: any) => {
  if (invoice.lines && invoice.lines.data && invoice.lines.data.length > 0) {
    const lineItem = invoice.lines.data[0];
    if (
      lineItem.price &&
      lineItem.price.product &&
      typeof lineItem.price.product === "object"
    ) {
      return lineItem.price.product.name || "Unknown";
    }
    if (lineItem.description) {
      const match = lineItem.description.match(/(Standard|Premium)/i);
      if (match) {
        return match[1];
      }
    }
  }
  return "Unknown";
};

const invoiceColumns = [
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
    Header: "Plan",
    accessor: "planType",
    cell: (value: any, row: any) => {
      const planType = getPlanTypeFromInvoice(row);
      return <p>{planType} Plan</p>;
    },
  },
  {
    Header: "Amount",
    accessor: "amount_paid",
    cell: (value: any) => {
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

export default function Billing() {
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
  const [refetchTrigger, setRefetchTrigger] = useState(0); // Add trigger for refetching
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Memoized fetch functions to prevent unnecessary re-renders
  const fetchCustomerInvoices = useCallback(async (customerId: string) => {
    try {
      setIsInvoiceLoading(true);
      const response = await fetch(
        `/api/stripe/invoices?customerId=${customerId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch invoices");
      }
      const data = await response.json();
      console.log(data, "invoices data");
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      ShowToast("Failed to fetch invoices", "error");
    } finally {
      setIsInvoiceLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsUserLoading(true);
      const response = await fetch(
        `${apiUrl}/${users}/onboarding-data/${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch user: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      setUserData(result?.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      ShowToast("Failed to fetch user data", "error");
    } finally {
      setIsUserLoading(false);
    }
  }, [user?.id]);
  const getSubscriptionData = useCallback(async () => {
    if (!userData?.organizations?.subscriptions?.[0]?.subscription_id) return;

    try {
      const subscription = await getSubscriptionDetails(
        userData.organizations.subscriptions[0].subscription_id
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
    } catch (error) {
      console.error("Error fetching subscription:", error);
      ShowToast("Failed to fetch subscription data", "error");
    }
  }, [userData?.organizations?.subscriptions, refetchTrigger]);

  // Function to trigger refetch of all data
  const refetchAllData = useCallback(() => {
    // getSubscriptionData();
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  const createPaymentIntent = async (priceId?: string) => {
    try {
      setIsLoading(true);
      // Prevent empty priceId
      if (!priceId && !selectedPriceId) {
        ShowToast("Please select a plan before subscribing.", "error");
        setIsLoading(false);
        return;
      }

      const effectivePriceId = priceId || selectedPriceId;
      if (
        subscription?.status !== "incomplete" ||
        subscription?.status !== "past_due"
      ) {
      }
      if (
        userData.organizations.subscriptions[0]?.subscription_id &&
        !isSubscriptionCanceled &&
        subscription?.status === "active"
      ) {
        // Compare current plan and quantity
        const currentPlanId = subscription?.plan?.id;
        const currentQuantity = subscription?.plan?.subscription?.quantity;
        if (
          effectivePriceId === currentPlanId &&
          (userData.organizations.num_of_seat || 1) === currentQuantity
        ) {
          ShowToast(
            "You are already on this plan with the same seats.",
            "warning"
          );
          setIsLoading(false);
          return;
        }
      }

      let response;

      // If updating an existing subscription (change plan or quantity), allow directly
      if (
        userData.organizations.subscriptions[0]?.subscription_id &&
        subscription?.status === "active"
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
              newPriceId: effectivePriceId,
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
            priceId: effectivePriceId,
            email: userData.email,
          }),
        });
      }

      if (!response.ok) throw new Error("Failed to create payment intent");

      const data = await response.json();

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setOpenEdit(true);
      } else {
        ShowToast("Subscription has been updated successfully!");
        // Refetch all data after successful update
        refetchAllData();
      }
    } catch (err) {
      ShowToast(err instanceof Error ? err.message : "Unknown error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmCancelPlan = async () => {
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
      setIsSubscriptionCanceled(true);
      setSelectedPriceId("");

      // Refetch all data after successful cancellation
      refetchAllData();

      router.push("/settings?page=2");
    } catch (err) {
      console.error("Error canceling subscription:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      ShowToast(`Failed to cancel subscription: ${errorMessage}`, "error");
    } finally {
      setIsCancelling(false);
      setShowCancelModal(false);
    }
  };

  const handleOpenModal = () => {
    refetchAllData();
    setOpenEdit(false);
  };

  // Initial data fetching
  useEffect(() => {
    if (user) {
      fetchUser();
    }
  }, [user, fetchUser, refetchTrigger]); // Add refetchTrigger as dependency

  useEffect(() => {
    if (userData && userData?.organizations?.subscriptions) {
      fetchCustomerInvoices(
        userData.organizations.subscriptions[0].customer_id
      );
      getSubscriptionData();
    }
  }, [userData, fetchCustomerInvoices, getSubscriptionData, refetchTrigger]); // Add refetchTrigger as dependency

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
  }, [refetchTrigger]); // Add refetchTrigger as dependency

  const renderTutorCell = (accessor: any, row: any) => {
    const column = invoiceColumns.find((col) => col.accessor === accessor);
    const value = row[accessor];
    if (column && column.cell) {
      return column.cell(value, row);
    }
    return <span>{value}</span>;
  };

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
      <div className="mb-6 text-white font-sans">
        <div className={`flex flex-col md:flex-row gap-5 mt-2 justify-center`}>
          {fetchingPlans ? (
            <PlansSkeleton isCanceled={isSubscriptionCanceled} />
          ) : (
            <div className="w-full lg:w-2/3 flex flex-col justify-center p-6 rounded-2xl">
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
                    !isSubscriptionCanceled && subscription?.status==='active';

                  // Determine if this is the selected plan (but not current)
                  const isSelected = selectedPriceId === price.id && !isCurrent;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => {
                        setSelectedPriceId(price.id);
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
                            disabled={isLoading}
                            onClick={(e) => {
                              e.stopPropagation();
                              createPaymentIntent(price.id);
                            }}
                          >
                            {isLoading && selectedPriceId === price.id ? (
                              <Loader />
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
                          disabled={isLoading || isCancelling}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isCurrent) {
                              setShowCancelModal(true);
                            } else {
                              setSelectedPriceId(price.id);
                              createPaymentIntent(price.id);
                            }
                          }}
                        >
                          {isCurrent ? (
                            isCancelling ? (
                              <Loader />
                            ) : (
                              "Cancel Plan"
                            )
                          ) : isLoading && selectedPriceId === price.id ? (
                            <Loader />
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

      {invoiceLoading || userLoading ? (
        <InvoicesSkeleton />
      ) : (
        <div className="bg-[#191919] rounded-lg p-4 mb-8 relative flex flex-col justify-center">
          <div className="flex justify-between mb-4 flex-wrap">
            <h3 className="text-[24px] font-urbanist">Invoices</h3>
          </div>
          <div className="mt-4 overflow-x-auto ">
            <Table
              columns={invoiceColumns}
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
        </div>
      )}

      <PaymentModal
        handleOpenModal={handleOpenModal}
        setOpenEdit={setOpenEdit}
        openEdit={openEdit}
        clientSecret={clientSecret}
        onPaymentSuccess={refetchAllData}
      />
      <CancelConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancelPlan}
        title="Cancel Plan"
        isLoading={isCancelling}
        confirmText="Confirm"
      />
    </div>
  );
}
