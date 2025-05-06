import {useEffect, useState} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  FileText,
  Pen,
  X,
} from "lucide-react";
import Image from "next/image";
import {Button} from "../ui/button";
import Table from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {useSearchParams} from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {ShowToast} from "@/components/shared/show-toast";
import {useUser} from "@clerk/nextjs";
import PaymentPage from "../onboarding/checkout-form";
import Loader from "../shared/loader";

const invoiceData = [
  {
    invoice: (
      <span className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-[#F9E36C]" />
        Inv 001
      </span>
    ),
    date: "1-March-2025",
    plan: "Basic Plan",
    amount: "$100",
    actions: <Download />,
  },
  {
    invoice: (
      <span className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-[#F9E36C]" />
        Inv 002
      </span>
    ),
    date: "2-March-2025",
    plan: "Basic Plan",
    amount: "$120",
    actions: <Download />,
  },
  {
    invoice: (
      <span className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-[#F9E36C]" />
        Inv 003
      </span>
    ),
    date: "3-March-2025",
    plan: "Premium Plan",
    amount: "$200",
    actions: <Download />,
  },
  {
    invoice: (
      <span className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-[#F9E36C]" />
        Inv 003
      </span>
    ),
    date: "4-March-2025",
    plan: "Basic Plan",
    amount: "$100",
    actions: <Download />,
  },
  {
    invoice: (
      <span className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-[#F9E36C]" />
        Inv 003
      </span>
    ),
    date: "5-March-2025",
    plan: "Premium Plan",
    amount: "$250",
    actions: <Download />,
  },
];

const tutorColumns = [
  {Header: "Invoice", accessor: "invoice"},
  {Header: "Date", accessor: "date"},
  {Header: "Plan", accessor: "plan"},
  {Header: "Amount", accessor: "amount"},
  {Header: "Actions", accessor: "actions"},
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
  const searchParams = useSearchParams();
  const page = searchParams.get("page");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsperpage] = useState(4);
  const [billingCycle, setBillingCycle] = useState<"month" | "year">("month");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [priceId, setPriceId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const totalTutors = invoiceData.length;
  const totalPages = Math.ceil(totalTutors / rowsPerPage);
  const [openEdit, setOpenEdit] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [country, setCountry] = useState("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const {user, isLoaded} = useUser();

  // Calculate the correct starting and ending indices for pagination
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalTutors);
  const paginatedData = invoiceData.slice(startIndex, endIndex);

  // Effect to update priceId when selected plan or billing cycle changes
  useEffect(() => {
    if (plans.length > 0 && selectedPlan) {
      const selectedPlanObj = plans.find(
        (plan) => plan.name.toLowerCase() === selectedPlan
      );

      if (selectedPlanObj) {
        const price = selectedPlanObj.prices.find(
          (p) => p.interval === billingCycle
        );

        if (price) {
          setPriceId(price.id);
        }
      }
    }
  }, [selectedPlan, billingCycle, plans]);

  const createPaymentIntent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${window.location.origin}/api/stripe/payment-intent`,
        {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({
            price_id: priceId,
            email: user?.primaryEmailAddress?.emailAddress,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to create payment intent");

      const data = await response.json();
      if (!data.clientSecret) {
        throw new Error("Client secret not found in response");
      }
      setClientSecret(data.clientSecret);
      setOpenEdit(true);
    } catch (err) {
      ShowToast(err instanceof Error ? err.message : "Unknown error", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/stripe/plan");
        const data = await res.json();

        if (data && data.length > 0) {
          setPlans(data);
          setSelectedPlan(data[0]?.name.toLowerCase());
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        ShowToast("Failed to fetch plans", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleOpenModal = () => {
    setOpenEdit(false);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value);
    setRowsperpage(newLimit);
    setCurrentPage(1); // Reset to first page whenever page size changes
  };

  // Function to render each cell in the table
  const renderTutorCell = (
    accessor: string,
    row: (typeof invoiceData)[number]
  ) => {
    // @ts-expect-error: Accessor type needs proper typing
    return <span>{row[accessor]}</span>;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // You can add real validation or submission logic here
    console.log({cardNumber, expiry, cvc, country});
  };

  // Loading state
  if (isLoading && plans.length === 0) {
    return (
      <div className="bg-[#191919] rounded-[30px] w-full text-white p-4 md:p-6 mx-auto flex items-center justify-center min-h-[300px]">
        <div className="w-[857px] h-[430px] flex items-center justify-center">
          <Loader size={50}/>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#191919] rounded-[30px] w-full text-white p-4 md:p-6 mx-auto">
      {/* Header */}
      <div className="mb-6 text-white font-sans">
        <div
          className={`flex flex-col md:flex-row gap-5 mt-2 ${
            parseInt(page || "0", 10) === 2
              ? "justify-center"
              : "justify-between"
          }`}
        >
          {/* LEFT SIDE: Plan Info */}
          {parseInt(page || "0", 10) !== 2 && (
            <div className="w-full lg:w-1/3 flex flex-col justify-between p-4 rounded-lg">
              <div className="gap-5 mt-20">
                <h2 className="text-[#F9DB6F] font-urbanist font-semibold text-[30px] leading-[24px] tracking-[0]">
                  Pohloh Standard Plan
                </h2>
                <p className="font-urbanist font-medium text-[24px] leading-[24px] tracking-[0] mt-5">
                  Next Bill Date
                </p>
                <p className="text-[#F9DB6F] font-urbanist font-semibold text-[30px] leading-[24px] tracking-[0] mt-2">
                  1 April 2022
                </p>

                <div className="flex flex-row items-center mt-5">
                  <p className="text-white font-urbanist font-semibold text-[30px] leading-[24px] tracking-[0]">
                    Total Seat:
                  </p>
                  <p className="ml-1 text-white font-urbanist font-semibold text-[30px] leading-[24px] tracking-[0]">
                    5
                  </p>
                  <Pen className="text-[#F9DB6F] w-4 h-4 ml-4" />
                </div>
              </div>

              <div className="my-15">
                <button className="bg-transparent text-white border border-white rounded-[8px] py-2 px-4 font-medium w-full">
                  Cancel Plan
                </button>
              </div>
            </div>
          )}

          {/* RIGHT SIDE: Plans */}
          <div className="w-full lg:w-2/3 flex flex-col justify-between p-6 rounded-2xl">
            {/* Billing Toggle */}
            <div className="flex justify-center w-full">
              <div className="bg-[#FFFFFF14] bg-opacity-10 rounded-2xl p-2 flex items-center justify-center gap-2 w-full max-w-md">
                {["year", "month"].map((type) => (
                  <button
                    key={type}
                    className={`w-full h-12 rounded-md flex items-center justify-center font-urbanist font-medium text-[22.27px] leading-[100%] tracking-[0] align-middle transition-all duration-200 ${
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
                const isSelected = selectedPlan === plan.name.toLowerCase();

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.name.toLowerCase())}
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
                                /{billingCycle}
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
                            <Check size={16} className="text-[#F9DB6F] mr-2" />
                            <span className="font-urbanist font-normal text-[14.13px] text-[#707070]">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      className={`rounded-[9.42px] h-[56.51px] px-[47.09px] py-[11.77px] font-medium mt-5 flex items-center justify-center ${
                        isSelected
                          ? "bg-[#F9DB6F] text-black"
                          : "bg-transparent border border-white text-white w-full"
                      }`}
                      disabled={isLoading}
                      onClick={() => {
                        setSelectedPlan(plan.name.toLowerCase());
                        createPaymentIntent();
                      }}
                    >
                      {isLoading && selectedPlan === plan.name.toLowerCase() ? (
                        <Loader />
                      ) : (
                        <span>
                          {isSelected
                            ? "Current Plan"
                            : plan.name === "Premium"
                            ? `Upgrade to ${plan.name}`
                            : `Choose ${plan.name}`}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/**Invoices */}
      <div className="bg-[#191919] rounded-lg p-4 mb-8 relative">
        <div className="flex justify-between mb-4 flex-wrap">
          <h3 className="text-sm font-medium">Invoices</h3>
        </div>

        {/* Table with Horizontal Scrolling */}
        <div className="mt-4 overflow-x-auto ">
          <Table
            columns={tutorColumns}
            data={paginatedData} // Use the correctly paginated data
            renderCell={renderTutorCell} // Make sure parameter order matches Table component
            tableClassName="w-full text-sm"
            headerClassName="bg-[#F9DB6F] text-black text-left"
            bodyClassName="divide-y divide-gray-700 "
            cellClassName="py-2 px-4 w-[1084px] h-[68px] gap-[155px] pt-[11.95px] pr-[15.93px] pb-[11.95px] pl-[15.93px] border-t border-[#E0EAF5] font-sharp text-[15.93px] leading-[21.9px] tracking-[0] font-normal "
          />
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center mt-4 text-xs flex-wrap gap-2">
          <div className="gap-2">
            Rows per page:
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="ml-2 bg-black hover:bg-black text-white border border-gray-700 rounded px-2 py-1 text-xs"
            >
              {[2, 4, 6, 8, 10, 20].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <div>
            {startIndex + 1}-{endIndex} of {totalTutors}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="bg-[#333435] hover:bg-[#333435] border-[#CDCDCD] border py-1 px-3 rounded-[8px] flex items-center gap-1 disabled:opacity-50"
            >
              <ArrowLeft size={14} />
              Previous
            </Button>

            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="bg-[#F9DB6F] hover:bg-[#F9DB6F] text-black py-1 px-3 rounded-[8px] flex items-center gap-1 disabled:opacity-50"
            >
              Next
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={openEdit} onOpenChange={handleOpenModal}>
        <DialogContent className="overflow-y-auto w-full max-w-[864px] h-auto bg-[#222222] text-white border-none bg-[#0E0F11]">
          <DialogHeader>
            <DialogTitle className="text-[32px]">Payment Method</DialogTitle>
          </DialogHeader>
          {/* <div className="flex-1 flex items-center justify-center  text-white  relative"> */}
          <div className="w-full">
            <PaymentPage clientSecret={clientSecret || ""} />
          </div>
          {/* </div> */}
        </DialogContent>
      </Dialog>
    </div>
  );
}

{
  /* {<div className=" ">
            <div className="h-[1px] bg-[#828282]" />

            <div className=" bg-[#FFFFFF0A]  rounded-[13px] p-4 md:p-8 mt-6 space-y-4">
              <div>
                <label className="block font-urbanist font-normal text-[12.38px] leading-[18.56px] align-middle tracking-[0] text-white mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  className="w-full bg-[#FFFFFF14] border border-gray-700 rounded p-2 text-white placeholder:text-white/50"
                  placeholder="**** **** **** ****"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                <div className="w-full sm:w-1/2">
                  <label className="block font-urbanist font-normal text-[12.38px] leading-[18.56px] align-middle tracking-[0] text-white mb-1">
                    Expiry
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#FFFFFF14] border border-gray-700 rounded p-2 text-white placeholder:text-white/50"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-1/2">
                  <label className="block font-urbanist font-normal text-[12.38px] leading-[18.56px] align-middle tracking-[0] text-white mb-1">
                    CVC
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#FFFFFF14] border border-gray-700 rounded p-2 text-white placeholder:text-white/50"
                    placeholder="***"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-urbanist font-normal text-[12.38px] leading-[18.56px] align-middle tracking-[0] text-white mb-1">
                  Country
                </label>
                <Select
                  value={country}
                  onValueChange={(value) => setCountry(value)}
                >
                  <SelectTrigger className="w-full bg-[#FFFFFF14] border border-gray-700 text-white rounded p-2 h-auto">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1C] z-[9999] border border-[#FFFFFF0F] text-white">
                    <SelectItem value="united-states">United States</SelectItem>
                    <SelectItem value="canada">Canada</SelectItem>
                    <SelectItem value="united-kingdom">
                      United Kingdom
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => setOpenEdit(false)}
                className="w-full h-[44px] rounded-md border border-white text-white font-urbanist font-semibold hover:bg-[#F9DB6F1a] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full h-[44px] rounded-md bg-[#F9DB6F] text-black font-urbanist font-semibold hover:opacity-90 transition"
                onClick={() => setOpenEdit(false)}
              >
                Save Payment Method
              </button>
            </div>
          </div>} */
}
