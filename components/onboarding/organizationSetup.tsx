"use client";

import type React from "react";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Checkbox} from "@/components/ui/checkbox";
import {StepIndicator} from "../shared/stepIndicator";
import {DEPARTMENTS, usernameRegex} from "@/utils/constant";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type {Department} from "@/types/types";
import {useUser} from "@clerk/nextjs";
import {ShowToast} from "../shared/show-toast";
import {Loader2} from "lucide-react";

// LocalStorage keys
const ORG_DATA_KEY = "organization_setup_data";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(50, "Organization name must not exceed 50 characters")
    .regex(usernameRegex, "Organization name must contain only letters"),
  departments: z.array(z.string()),
  customDepartment: z.string().optional(),
  wantsUpdates: z.boolean().optional(),
  num_of_seat: z.number().min(1, "At least one seat is required"),
});

interface OrganizationData {
  departments: Department[];
  name: string;
  id?: string;
  num_of_seat?: number;
}

interface OrganizationSetupProps {
  organizationData?: OrganizationData;
  updateOrganization: (data: OrganizationData) => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

const OrganizationSetup: React.FC<OrganizationSetupProps> = ({
  organizationData,
  updateOrganization,
  onNext,
  onPrevious,
}) => {
  const steps = ["Organization Details", "Setup Profile", "Choose Plan"];
  const currentStep = 1;
  const {user} = useUser();
  const [isloading, setloading] = useState(false);
  const [localData, setLocalData] = useState<OrganizationData | null>(null);

  useEffect(() => {
    if (user?.id) {
      try {
        const savedData = localStorage.getItem(`${ORG_DATA_KEY}_${user.id}`);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setLocalData(parsedData);
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
      }
    }
  }, [user?.id]);

  const saveToLocalStorage = (data: OrganizationData) => {
    if (user?.id) {
      try {
        localStorage.setItem(
          `${ORG_DATA_KEY}_${user.id}`,
          JSON.stringify(data)
        );
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }
  };

  // Determine which data to use for form initialization
  // Priority: 1. Props data (from parent) 2. localStorage data 3. Default values
  const initialData = organizationData ||
    localData || {
      name: "",
      departments: ["Customer"],
      num_of_seat: 1,
    };

  // Initialize form with existing data if available
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name || "",
      departments: initialData.departments
        ? Array.isArray(initialData.departments)
          ? initialData.departments
          : [initialData.departments]
        : ["Customer"],
      customDepartment: "",
      wantsUpdates: false,
      num_of_seat: initialData.num_of_seat || 1,
    },
  });

  const departments = form.watch("departments");
  const customDepartments = departments.filter(
    (dept) => !DEPARTMENTS.includes(dept)
  );

  const toggleDepartment = (dept: string) => {
    const updated = departments.includes(dept)
      ? departments.filter((d) => d !== dept)
      : [...departments, dept];

    form.setValue("departments", updated);
  };
  const submitOrganizationDetails = async () => {
    try {
      const values = form.getValues();
      const payload = {
        name: values.name,
        departments: values.departments,
        num_of_seat: values.num_of_seat,
        user_id: user?.id,
      };
      return payload;
    } catch (error: any) {
      setloading(false);
      console.error("Error creating organization:", error);
      ShowToast(error?.message || "Error saving organization:", "error");
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setloading(true);

    try {
      const response = await submitOrganizationDetails();

      if (response) {
        const orgData: OrganizationData = {
          name: values.name,
          departments: response.departments as Department[],
          // id: response.id,
          num_of_seat: response.num_of_seat,
        };

        updateOrganization(orgData);
        saveToLocalStorage(orgData);

        ShowToast("Organization data has been saved!");

        if (onNext) onNext();
      }
    } catch (error) {
      console.error("Error submitting organization details:", error);
    } finally {
      setloading(false);
    }
  }

  return (
    <div className="text-white flex flex-col items-center">
      <main className="w-full max-w-2xl">
        <div className="text-center mb-4">
          <h1 className="font-medium text-[40px] mb-2">Organization Details</h1>
          <p className="text-[#D1D1D1] text-[20px]">
            Let's get started by customizing your new workspace
          </p>
        </div>

        <StepIndicator steps={steps} currentStep={currentStep} />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-lg p-6 px-10 mb-8 backdrop-invert backdrop-opacity-10 shadow-sm !px-12"
          >
            {/* Org Name */}
            <FormField
              control={form.control}
              name="name"
              render={({field}) => (
                <FormItem className="mb-6">
                  <FormLabel className="mb-3">Organization name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your organization name"
                      className="bg-[#2C2D2E] border-none text-white h-[44px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Department Grid */}
            <div className="mb-6">
              <FormLabel>Add departments to your organization</FormLabel>
              <p className="text-xs text-[#D1D1D1] mb-3 mt-3">
                This will pre-populate categories for your knowledge base.
                Don't worry you can always edit these later. Select all that
                apply.{" "}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DEPARTMENTS.map((dept) => (
                  <Button
                    key={dept}
                    variant="outline"
                    type="button"
                    onClick={() => toggleDepartment(dept)}
                    className={`rounded-md py-4 text-sm h-[58px] ${
                      departments.includes(dept)
                        ? "bg-[#2C2D2E] border-[#F9DB6F] text-[#F9DB6F]"
                        : "bg-[#2C2D2E] border-[#3A3B3C] text-[#D1D1D1] !hover:text-[#D1D1D1]"
                    }`}
                  >
                    {dept}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Department */}
            <FormField
              control={form.control}
              name="customDepartment"
              render={({field}) => (
                <FormItem className="mb-6">
                  <FormLabel className="text-[#F9DB6F] mb-4">
                    Add your Custom Department
                  </FormLabel>

                  {/* Custom department tags display */}
                  {customDepartments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {customDepartments.map((department) => (
                        <div
                          key={department}
                          className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F9DB6F] text-[#2C2D2E]"
                        >
                          <span>{department}</span>
                          <button
                            type="button"
                            onClick={() => toggleDepartment(department)}
                            className="hover:text-[#ffffff] cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <FormLabel className="text-[#D1D1D1] mb-2">
                    Add Department Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter the department name"
                      className="bg-[#2C2D2E] border-none text-white h-[44px]"
                      {...field}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const customDept = field.value?.trim();
                          if (customDept && !departments.includes(customDept)) {
                            toggleDepartment(customDept);
                            field.onChange(""); // Clear the input after adding
                          }
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="num_of_seat"
              render={({field}) => (
                <FormItem className="mb-6">
                  <FormLabel className="text-[#D1D1D1] mb-2">
                    Number of seats
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      {/* Add Button */}
                      <Button
                        type="button"
                        onClick={() => field.onChange((field.value || 0) + 1)}
                        className="px-3 py-2 bg-[#FFFFFF14] text-white rounded hover:bg-[#FFFFFF14] transition cursor-pointer"
                      >
                        +
                      </Button>

                      {/* Input Field */}
                      <Input
                        type="text"
                        placeholder="Enter seat count"
                        className="w-[120px] bg-[#2C2D2E] border-none rounded-[6px] p-2 focus:outline-none text-white text-center"
                        value={field.value || 0}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                      />

                      {/* Subtract Button */}
                      <Button
                        type="button"
                        onClick={() =>
                          field.onChange(Math.max((field.value || 0) - 1, 1))
                        }
                        className="px-3 py-2 bg-[#FFFFFF14] text-white rounded hover:bg-[#FFFFFF14] transition cursor-pointer"
                      >
                        −
                      </Button>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-4 mt-8">
              <Button
                type="button"
                onClick={onPrevious}
                disabled
                className="flex-1 h-[48px] rounded-[8px] text-white border border-gray-300 bg-[#2C2D2E] hover:bg-[#2C2D2E] cursor-pointer"
              >
                Previous
              </Button>
              <Button
                type="submit"
                className="flex-1 h-[48px] rounded-[8px] bg-[#F9DB6F] text-black hover:bg-[#F9DB6F] cursor-pointer"
                disabled={isloading}
              >
                {isloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <p>Save & Continue</p>
                )}
              </Button>
            </div>

            {/* Checkbox */}
            <FormField
              control={form.control}
              name="wantsUpdates"
              render={({field}) => (
                <FormItem className="flex items-center gap-2 mt-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-gray-500 data-[state=checked]:bg-yellow-400 data-[state=checked]:border-yellow-400 cursor-pointer"
                    />
                  </FormControl>
                  <label htmlFor="updates" className="text-xs text-gray-300">
                    I'd like to get the update on new release, insights and more
                    in my inbox.{" "}
                  </label>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </main>
    </div>
  );
};

export default OrganizationSetup;
