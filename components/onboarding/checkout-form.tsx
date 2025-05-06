"use client";

import {useState, useEffect, type FormEvent} from "react";
import {loadStripe} from "@stripe/stripe-js";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import Loader from "../shared/loader";
import {ShowToast} from "../shared/show-toast";
import {useUser} from "@clerk/nextjs";
import {getLocalStorage, PAYMENT_DATA_KEY} from "@/lib/local-storage";
import {useRouter} from "next/navigation";

type PaymentFormProps = {
  clientSecret: string;
  org_id: string;
  onPaymentComplete?: () => void;
};

const STRIPE_THEME = {
  theme: "stripe" as const,
  variables: {
    colorPrimary: "white",
    colorBackground: "#111",
    colorText: "#ffffff",
    colorDanger: "#ff5252",
    fontFamily: "Inter, Arial, sans-serif",
    spacingUnit: "4px",
    borderRadius: "8px",
  },
  rules: {
    ".Input": {
      backgroundColor: "#1a1a1a",
      borderColor: "#333",
      color: "#fff",
      padding: "18px",
    },
    ".Input:focus": {
      borderColor: "white",
      boxShadow: "0 0 0 1pxrgb(228, 228, 228)",
    },
    ".Label": {
      color: "#bbb",
      marginBottom: "6px",
      fontWeight: "500",
    },
    ".Tab": {
      backgroundColor: "#1a1a1a",
      borderColor: "#333",
      padding: "12px 16px",
    },
    ".Tab:hover": {
      backgroundColor: "#222",
    },
    ".Tab--selected": {
      backgroundColor: "#222",
      borderColor: "#f0c14b",
    },
    ".Block": {
      backgroundColor: "#1a1a1a",
    },
  },
};

function StripePaymentForm({
  clientSecret,
  org_id,
  onPaymentComplete,
}: PaymentFormProps) {
  const stripe = useStripe();
  const {user, isLoaded} = useUser();

  const elements = useElements();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessage("Processing your payment...");

    try {
      const {error: stripeError, paymentIntent} = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
          receipt_email: user?.primaryEmailAddress?.emailAddress,
        },
        redirect: "if_required",
      });

      if (stripeError) {
        setError(stripeError.message || "Payment failed. Please try again.");
        return;
      }

      switch (paymentIntent?.status) {
        case "succeeded":
          setSuccess(true);
          if (onPaymentComplete) {
            onPaymentComplete();
          }
          ShowToast("Subscribed Successfully!");
          // router.push("/dashboard");
          break;
        case "processing":
          setMessage("Payment processing. We'll update you when complete.");
          break;
        case "requires_payment_method":
          setError("Payment failed. Please try another payment method.");
          break;

        default:
          setError("Payment failed. Please try again.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border border-gray-700 rounded-lg p-4 bg-transparent">
        <PaymentElement
          options={{
            layout: {
              type: "tabs",
              defaultCollapsed: false,
              spacedAccordionItems: true,
            },
            fields: {
              billingDetails: {
                name: "auto",
                email: "auto",
                phone: "auto",
                address: {
                  country: "auto",
                  postalCode: "auto",
                },
              },
            },
            wallets: {
              applePay: "never",
              googlePay: "never",
            },
          }}
        />
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}

      {message && !error && !success && (
        <div className="p-4 bg-blue-900/30 border border-blue-700 rounded-lg text-blue-300">
          <p>{message}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-3 px-4 rounded-lg font-medium ${
          loading
            ? "bg-[#F9DB6F] cursor-not-allowed"
            : "bg-[#F9DB6F] hover:bg-[#F9DB6F]"
        } text-black transition-colors flex items-center justify-center gap-2`}
      >
        {loading ? (
          <>
            <Loader />
          </>
        ) : (
          `Confirm & Subscribe`
        )}
      </button>
    </form>
  );
}

type PaymentPageProps = {
  clientSecret: string;
  org_id?: string;
  isSubscribed?: boolean;
  onPaymentComplete?: () => void;
};

export default function PaymentPage({
  clientSecret,
  org_id,
  isSubscribed,
  // paymentIds,
  onPaymentComplete,
}: PaymentPageProps) {
  const [stripePromise] = useState(() =>
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  );
  const [paymentComplete, setPaymentComplete] = useState<boolean>(false);
  const {user} = useUser();
  const router = useRouter();

  // Check if payment was already completed from localStorage
  useEffect(() => {
    if (user?.id) {
      try {
        const savedData = getLocalStorage<any>(PAYMENT_DATA_KEY, user.id);
        if (savedData?.paymentComplete) {
          setPaymentComplete(true);
        }
      } catch (error) {
        console.error(
          "Error checking payment status from localStorage:",
          error
        );
      }
    }
  }, [user?.id]);

  // Check if payment status indicates completion
  useEffect(() => {
    if (isSubscribed) {
      setPaymentComplete(true);
    }
  }, [isSubscribed]);

  if (!stripePromise) return null;

  return (
    <div className="rounded-xl shadow-lg p-6 sm:p-8">
      {isSubscribed ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Payment Completed
          </h2>
          <p className="text-gray-400 mt-2">
            Thank you! Your payment has been processed successfully. You now
            have full access to Pohloh.
          </p>
        </div>
      ) : clientSecret ? (
        <Elements
          stripe={stripePromise}
          options={{
            appearance: STRIPE_THEME,
            clientSecret,
            loader: "always",
          }}
        >
          <StripePaymentForm
            clientSecret={clientSecret}
            org_id={org_id || ""}
            onPaymentComplete={onPaymentComplete}
          />
        </Elements>
      ) : (
        <div className="flex items-center justify-center py-12">
          <Loader size={40} />
        </div>
      )}
    </div>
  );
}
