"use client";

import {useState, type FormEvent} from "react";
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

type PaymentFormProps = {
  clientSecret: string;
  setOpen: (open: boolean) => void;
  refetchAllData?: () => void;
  onPaymentSuccess?: () => void;
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
      backgroundColor: "#FFFFFF14",
      borderColor: "#333",
      color: "#fff",
      // padding: "18px",
      height:'40.65px',
      marginTop:'10px'
    },
    ".Input:focus": {
      borderColor: "white",
      boxShadow: "0 0 0 1pxrgb(228, 228, 228)",
    },
    ".Label": {
      color: "#FFFFFF",
      marginBottom: "6px",
      fontWeight: "500",
      fontSize:'12.38px'
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
  setOpen,
  clientSecret,
  refetchAllData,
  onPaymentSuccess,
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
        // clientSecret,
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
          ShowToast("Subscription is in progress, Please wait...");

          setTimeout(() => {
            setSuccess(true);

            if (onPaymentSuccess) onPaymentSuccess();
            setOpen(false);
            ShowToast("Subscribed Successfully!");
          }, 5000); // 3 seconds delay
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
      <div className="bg-[#FFFFFF0A] rounded-xl shadow-lg p-6 mb-4">
        <div className="space-y-4">

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
            className="rounded-lg bg-transparent  text-white"
          />
        </div>
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

      <div className="flex gap-4 py-6">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="w-1/2 py-3 px-4 rounded-lg border cursor-pointer  text-[white] bg-[#333435] font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className={`w-1/2 py-3 px-4 rounded-lg font-medium  cursor-pointer ${
            loading
              ? "bg-[#F9DB6F] cursor-not-allowed"
              : "bg-[#F9DB6F] hover:bg-[#F9DB6F]/90"
          } text-black transition-colors flex items-center justify-center gap-2`}
        >
          {loading ? <Loader /> : "Change Plan"}
        </button>
      </div>
    </form>
  );
}

type PaymentPageProps = {
  clientSecret: string;
  refetchAllData?: () => void;
  setOpen: (open: boolean) => void;
  onPaymentSuccess?: () => void;
};

export default function PaymentPage({
  clientSecret,
  setOpen,
  refetchAllData,
  onPaymentSuccess,
}: PaymentPageProps) {
  const [stripePromise] = useState(() =>
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  );

  // Check if payment was already completed from localStorage

  // Check if payment status indicates completion

  if (!stripePromise) return null;

  return (
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
        setOpen={setOpen}
        refetchAllData={refetchAllData}
        onPaymentSuccess={onPaymentSuccess}
      />
    </Elements>
  );
}
