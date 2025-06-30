"use client";

import {ShowToast} from "@/components/shared/show-toast";
import type React from "react";
import {useEffect, useState} from "react";
import {BuildingIcon, TrashIcon} from "lucide-react";
import {useUser} from "@clerk/nextjs";
import Image from "next/image";
import {
  allowedTypes,
  apiUrl,
  DEPARTMENTS,
  organizations,
} from "@/utils/constant";
import Loader from "../../shared/loader";
import {supabase} from "@/supabase/client";
import {Button} from "@/components/ui/button";

interface OrganizationProps {
  organization: any;
}

interface Team {
  id: string;
  name: string;
  org_id: string;
  lead_id: string | null;
  user_id: string | null;
  created_at: string;
  icon: string | null;
}

export function OrganizationalDetail({organization}: OrganizationProps) {
  const {user, isLoaded} = useUser();
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [organizationName, setOrganizationName] = useState("");
  const [seats, setSeats] = useState<number>(0);
  const [customDepartment, setCustomDepartment] = useState("");
  const [profileImage, setProfileImage] = useState("/placeholder-profile.svg");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [organizationNameError, setOrganizationNameError] = useState("");
  const [customDepartmentError, setCustomDepartmentError] = useState("");
  const [departmentError, setDepartmentError] = useState("");
  const [org_loading, setOrg_loading] = useState<boolean>(false);
  const [teams, setTeams] = useState<Team[]>([]);

  // Initial state tracking for changes detection
  const [initialState, setInitialState] = useState({
    organizationName: "",
    seats: 0,
    profileImage: "/placeholder-profile.svg",
    selectedDepartments: [] as string[],
  });

  // Check if any changes have been made
  const hasChanges = () => {
    return (
      organizationName !== initialState.organizationName ||
      seats !== initialState.seats ||
      profileImage !== initialState.profileImage ||
      fileToUpload !== null ||
      JSON.stringify(selectedDepartments.sort()) !==
        JSON.stringify(initialState.selectedDepartments.sort())
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      ShowToast(
        "Please upload a valid image file (JPEG, PNG, or GIF)",
        "error"
      );
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      ShowToast("Image size should be less than 2MB", "error");
      return;
    }

    // If validations pass, set the file and preview
    setFileToUpload(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleDepartment = async (department: string) => {
    try {
      if (selectedDepartments.includes(department)) {
        // Find the team to delete
        const teamToDelete = teams.find((team) => team.name === department);
        if (!teamToDelete) return;

        // Remove department from team table
        const response = await fetch(`${apiUrl}/teams/${teamToDelete.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to remove department from team");
        }

        // Update local state
        setSelectedDepartments(
          selectedDepartments.filter((dep) => dep !== department)
        );
        setTeams(teams.filter((team) => team.name !== department));
        ShowToast("Department removed Successfully!");
      } else {
        // Add department to team table
        const response = await fetch(`${apiUrl}/teams`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: department,
            org_id: organization?.organizations?.id,
            lead_id: null,
            user_id: null,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add department to team");
        }

        const newTeam = await response.json();

        // Update local state
        setSelectedDepartments([...selectedDepartments, department]);
        setTeams([...teams, newTeam]);
        ShowToast("Department Added Successfully!");
      }
    } catch (error) {
      console.error("Error toggling department:", error);
      ShowToast("Failed to update departments", "error");
    }
  };

  const customDepartments = selectedDepartments?.filter(
    (dept) => !DEPARTMENTS.includes(dept)
  );

  const removeImage = () => {
    setProfileImage("/organization-logo.png");
    setFileToUpload(null);
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/teams/organizations/${organization?.organizations?.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch teams");
        }

        const teamsData = await response.json();
        if (teamsData.success && teamsData.teams) {
          setTeams(teamsData.teams);
          // Extract department names from teams
          const departmentNames = teamsData.teams.map(
            (team: Team) => team.name
          );
          setSelectedDepartments(departmentNames);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    if (organization?.organizations?.id) {
      fetchTeams();
    }
  }, [organization]);

  useEffect(() => {
    if (organization) {
      const orgName = organization.organizations.name || "";
      const orgSeats = organization.organizations.num_of_seat || 0;
      const orgPicture =
        organization.organizations.org_picture || "/placeholder-profile.svg";

      setOrganizationName(orgName);
      setSeats(orgSeats);
      setProfileImage(orgPicture);

      // Set initial state for change tracking
      setInitialState({
        organizationName: orgName,
        seats: orgSeats,
        profileImage: orgPicture,
        selectedDepartments: [],
      });
    }
  }, [organization]);

  // Update initial departments when teams are loaded
  useEffect(() => {
    if (teams.length > 0) {
      const departmentNames = teams.map((team: Team) => team.name);
      setInitialState((prev) => ({
        ...prev,
        selectedDepartments: departmentNames,
      }));
    }
  }, [teams]);

  const uploadFileToSupabase = async (file: File): Promise<string | null> => {
    try {
      if (!file || !user) return null;

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-pictures/${fileName}`;

      const {data, error} = await supabase.storage
        .from("images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Error uploading file:", error);
        ShowToast("Failed to upload profile picture", "error");
        return null;
      }

      const {
        data: {publicUrl},
      } = supabase.storage.from("images").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error in file upload:", error);
      return null;
    }
  };

  const submitOrganizationDetails = async () => {
    try {
      // Validate organization name first
      if (!organizationName.trim()) {
        setOrganizationNameError("Organization name is required");
        return;
      }

      if (organizationName.length < 2) {
        setOrganizationNameError(
          "Organization name must be at least 2 characters"
        );
        return;
      }

      if (organizationName.length > 50) {
        setOrganizationNameError(
          "Organization name cannot exceed 50 characters"
        );
        return;
      }

      if (!/^[a-zA-Z0-9\s&'-]+$/.test(organizationName)) {
        setOrganizationNameError(
          "Organization name contains invalid characters"
        );
        return;
      }

      setOrg_loading(true);

      if (!user) return;

      let profilePictureUrl = profileImage || "";

      if (fileToUpload) {
        const uploadedUrl = await uploadFileToSupabase(fileToUpload);
        if (uploadedUrl) {
          profilePictureUrl = uploadedUrl;
        }
      }

      const payload = {
        name: organizationName.trim(),
        num_of_seat: seats,
        org_picture: profilePictureUrl,
      };

      const totalUserData = await fetch(
        `${apiUrl}/users/count/${organization?.organizations.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!totalUserData.ok) {
        const errorText = await totalUserData.text();
        throw new Error(
          `Failed to fetch organization data: ${totalUserData.status} - ${errorText}`
        );
      }

      const totalUser = await totalUserData.json();

      if (totalUser.data.count > seats) {
        ShowToast(
          "The number of seats must be at least equal to the number of active users.",
          "error"
        );
        return;
      }

      const response = await fetch(
        `${apiUrl}/${organizations}/${organization?.organizations.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          redirect: "follow",
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const result = await response.json();
      ShowToast("Organization data has been updated successfully!");

      // Update initial state after successful save
      setInitialState({
        organizationName: organizationName,
        seats: seats,
        profileImage: profilePictureUrl,
        selectedDepartments: [...selectedDepartments],
      });
      setFileToUpload(null);

      setOrg_loading(false);
      return result;
    } catch (error) {
      setOrg_loading(false);
      ShowToast("An error occurred with updating organization", "error");
      console.error("Error updating organization:", error);
    } finally {
      setOrg_loading(false);
    }
  };

  return (
    <div>
      <div>
        <div className=" mx-auto  pb-8">
          <div
            className="bg-[#191919] rounded-lg p-6"
            style={{borderRadius: "30px"}}
          >
            {/* Profile Image */}
            <div className="flex flex-col items-start mb-8">
              <div className="flex items-center justify-start space-x-4">
                <div className="w-24 h-24 bg-[#F9DB6F] rounded-full overflow-hidden">
                  <Image
                    src={profileImage || "/placeholder.svg"}
                    alt="Organization logo"
                    width={500}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="bg-[#F9DB6F] gap-2 h-[48px] text-black px-4 py-2 rounded-[8px] flex items-center cursor-pointer font-urbanist font-medium text-[14px] leading-[100%] tracking-[0]">
                  <img src="/upload-image.png" alt="user" />
                  Upload Image
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                </label>
                <button
                  className=" border border-[#FFFFFF] h-[48px] px-4 py-2 rounded-[8px] flex items-center font-urbanist font-medium text-[14px] leading-[100%] tracking-[0] cursor-pointer"
                  onClick={removeImage}
                >
                  <TrashIcon size={16} className="mr-2" />
                  Remove Image
                </button>
              </div>
            </div>

            {/* Organization Form */}
            <div className="space-y-6">
              <div>
                <label className="block font-urbanist font-normal text-[16px] leading-[24px] tracking-[0] align-middle mb-2">
                  Organization Name
                </label>
                <div className="flex items-center border border-[#FFFFFF0F] bg-[#FFFFFF14] rounded px-3 py-2 ">
                  <BuildingIcon size={18} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Enter organization name"
                    className="bg-transparent w-full focus:outline-none text-white"
                    value={organizationName}
                    onChange={(e) => {
                      // Remove any special characters except allowed ones
                      const value = e.target.value.replace(
                        /[^a-zA-Z0-9\s&'-]/g,
                        ""
                      );
                      setOrganizationName(value);
                      setOrganizationNameError("");
                    }}
                    onBlur={() => {
                      if (!organizationName.trim()) {
                        setOrganizationNameError(
                          "Organization name is required"
                        );
                      } else if (organizationName.length < 2) {
                        setOrganizationNameError(
                          "Organization name must be at least 2 characters"
                        );
                      } else if (organizationName.length > 50) {
                        setOrganizationNameError(
                          "Organization name cannot exceed 50 characters"
                        );
                      }
                    }}
                  />
                </div>
                {organizationNameError && (
                  <p className="text-red-400 text-sm mt-1">
                    {organizationNameError}
                  </p>
                )}
              </div>

              {/* Department/Organization Categories sections */}
              <div>
                <label className="block text-[16px] leading-[24px] tracking-[0px] align-middle font-normal font-['Urbanist'] mb-2">
                  Add departments to your organization
                </label>
                <p className="text-[12px] leading-[14px] font-normal tracking-[0px] align-middle font-['Urbanist'] text-[#FFFFFF52] mb-4">
                  {
                    "This will pre-populate categories for your knowledge base. Don't worry you can always edit these later. Select all that apply."
                  }
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {DEPARTMENTS.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      className={`cursor-pointer py-2 px-4 bg-[#FFFFFF14] rounded-[6px] font-urbanist font-normal text-[14px] leading-[20px] tracking-[0] align-middle border ${
                        selectedDepartments?.includes(dept)
                          ? "border-[#F9DB6F] text-[#F9DB6F]"
                          : "border-none text-[#FFFFFF52]"
                      }`}
                      onClick={() => toggleDepartment(dept)}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
                {departmentError && (
                  <p className="text-red-400 text-sm mb-2">{departmentError}</p>
                )}
              </div>

              <div>
                <label className="text-[16px] text-[#F9DB6F] leading-[24px] font-medium tracking-[0px] align-middle font-['Urbanist'] mb-2 block">
                  Add your Custom Department
                </label>
                {customDepartments?.length > 0 && (
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

                <div className="mb-3">
                  <label className="text-[16px] leading-[24px] font-normal tracking-[0px] align-middle font-['Urbanist'] text-white mb-1 block">
                    Add Department Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter the department name"
                    className="w-full bg-[#FFFFFF14] border-none rounded p-2 focus:outline-none text-[#FFFFFFA3]"
                    value={customDepartment}
                    onChange={(e) => {
                      setCustomDepartment(e.target.value);
                      setCustomDepartmentError("");
                    }}
                    onKeyDown={async (e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const customDept = customDepartment.trim();
                        if (!customDept) {
                          setCustomDepartmentError(
                            "Department name cannot be empty"
                          );
                          return;
                        }

                        if (customDept.length > 30) {
                          setCustomDepartmentError(
                            "Department name cannot exceed 30 characters"
                          );
                          return;
                        }

                        if (selectedDepartments.includes(customDept)) {
                          setCustomDepartmentError("Department already exists");
                          return;
                        }

                        try {
                          // Add to team table
                          const response = await fetch(`${apiUrl}/teams`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              name: customDept,
                              org_id: organization?.organizations?.id,
                              lead_id: null,
                              user_id: null,
                              icon: null,
                            }),
                          });

                          if (!response.ok) {
                            throw new Error("Failed to add custom department");
                          }

                          const newTeam = await response.json();
                          setSelectedDepartments([
                            ...selectedDepartments,
                            customDept,
                          ]);
                          setTeams([...teams, newTeam]);
                          setCustomDepartment("");
                        } catch (error) {
                          console.error(
                            "Error adding custom department:",
                            error
                          );
                          ShowToast("Failed to add custom department", "error");
                        }
                      }
                    }}
                  />
                  {customDepartmentError && (
                    <p className="text-red-400 text-sm mt-1">
                      {customDepartmentError}
                    </p>
                  )}
                </div>

                <div className="mb-3">
                  <label className="text-[16px] leading-[24px] font-normal tracking-[0px] align-middle font-['Urbanist'] text-white mb-1 block">
                    Number of Seats
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSeats(seats + 1)}
                      className="px-3 py-2  bg-[#FFFFFF14] text-white rounded hover:bg-[#FFFFFF14] transition cursor-pointer"
                    >
                      +
                    </button>
                    <input
                      type="text"
                      placeholder="Enter the department name"
                      className=" w-[120px] bg-[#FFFFFF14] border-none rounded-[6px] p-2 focus:outline-none text-[#FFFFFF52] "
                      value={seats}
                      onChange={(e) => setSeats(Number(e.target.value) || 0)}
                    />
                    <button
                      type="button"
                      onClick={() => setSeats((prev) => Math.max(prev - 1, 0))}
                      className="px-3 py-2 bg-[#FFFFFF14] text-white rounded hover:bg-[#FFFFFF14] transition cursor-pointer"
                    >
                      −
                    </button>
                  </div>
                  {seats === 0 && (
                    <p className="text-red-400 text-sm mt-1">
                      At least 1 seat required
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-4 pt-4 justify-between">
                <Button className=" h-[48px] w-[370px] py-3 border bg-[#333435]  rounded-[8px] cursor-pointer">
                  Cancel
                </Button>
                <Button
                  type="button"
                  className={`py-3 w-[370px] h-[48px] rounded-[8px] cursor-pointer transition-all text-[black]

                  `}
                  onClick={(e) => {
                    e.preventDefault();
                    // Validate all fields
                    let isValid = true;

                    // Validate organization name
                    if (!organizationName.trim()) {
                      setOrganizationNameError("Organization name is required");
                      isValid = false;
                    } else if (organizationName.length < 2) {
                      setOrganizationNameError(
                        "Organization name must be at least 2 characters"
                      );
                      isValid = false;
                    } else if (organizationName.length > 50) {
                      setOrganizationNameError(
                        "Organization name cannot exceed 50 characters"
                      );
                      isValid = false;
                    } else if (!/^[a-zA-Z0-9\s&'-]+$/.test(organizationName)) {
                      setOrganizationNameError(
                        "Organization name contains invalid characters"
                      );
                      isValid = false;
                    }

                    if (selectedDepartments.length === 0) {
                      setDepartmentError(
                        "Please select at least one department"
                      );
                      isValid = false;
                    }

                    if (seats < 1) {
                      isValid = false;
                    }

                    if (isValid && hasChanges()) {
                      submitOrganizationDetails();
                    }
                  }}
                  disabled={!hasChanges() || org_loading}
                >
                  {org_loading ? (
                    <div className="flex justify-center ">
                      <Loader />
                    </div>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
