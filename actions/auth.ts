"use server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { supabase } from "@/supabase/client";
import { createClerkClient } from "@clerk/backend";
import { frontend_url } from "@/utils/constant";

// export async function inviteUser(email: string, role: string, org_id: string) {
//     try {
//         const clerkClient = createClerkClient({
//             secretKey: process.env.CLERK_SECRET_KEY
//         });

//         const invitation = await clerkClient.invitations.createInvitation({
//             emailAddress: email,
//             redirectUrl: 'http://localhost:3000?setup-profile',
//             publicMetadata: { role, org_id },
//         });
//         return {
//             success: true,
//             message: 'Invitation sent successfully'
//         }
//     } catch (error: any) {
//         console.error('Error inviting user:', error);
//         return {
//             success: false,
//             error: error.message || "Failed to send invitation",
//             status: error.status,
//             clerkTraceId: error.clerkTraceId,
//             errors: error.errors
//         };
//     }
// }
// Rest of the code remains the same
export async function setUserRole(id: string, role: string) {
  const client = await clerkClient();

  try {
    const res = await client.users.updateUser(id, {
      unsafeMetadata: { role: role },
    });
    return { message: res.unsafeMetadata };
  } catch (err) {
    console.log(err, "err");
    return { message: err };
  }
}
export async function removeRole(formData: FormData) {
  const client = await clerkClient();

  try {
    const res = await client.users.updateUserMetadata(
      formData.get("id") as string,
      {
        unsafeMetadata: { role: null },
      }
    );
    return { message: res.publicMetadata };
  } catch (err) {
    return { message: err };
  }
}

export async function inviteUser(email: string, role: string, user_id: string) {
  try {
    const { userId } = await auth();
    if (userId) {
      const user = await getUserDetails(userId);
      if (user) {
        const client = await clerkClient();

        const invitation = await client.invitations.createInvitation({
          emailAddress: email,
          // redirectUrl:''
          redirectUrl: `${frontend_url}/signup-link`,

          publicMetadata: {
            role,
            org_id: user.organizations.id,
            is_subscribed: user.organizations.subscriptions[0].is_subscribed,
          },
        });
        return {
          success: true,
          invitation: {
            id: invitation.id,
            emailAddress: invitation.emailAddress,
            status: invitation.status,
            url: invitation.url,
          },
        };
      }
    }
  } catch (error) {
    // console.error("Error inviting user:", error.errors || error);
    let message = "Unknown error";
    if (
      typeof error === "object" &&
      error !== null &&
      "errors" in error &&
      Array.isArray(error.errors) &&
      error.errors[0]
    ) {
      // Prefer longMessage, then message, then JSON
      message =
        error.errors[0].longMessage ||
        error.errors[0].message ||
        JSON.stringify(error.errors[0]);
    } else if (error instanceof Error && error.message) {
      message = error.message;
    } else {
      message = JSON.stringify(error);
    }
    return { success: false, message };
  }
}

export async function updateUserProfile(
  userId: string,
  updates: {
    firstName?: string;
    lastName?: string;
  }
) {
  try {
    const client = await clerkClient();

    const updatedUser = await client.users.updateUser(userId, {
      firstName: updates.firstName,
      lastName: updates.lastName,
    });

    return {
      success: true,
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      },
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
export async function getUserDetails(userId: string) {
  try {
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const { data, error } = await supabase
      .from("users")

      .select(
        `
      *,
      organizations (
        *,
        subscriptions (
          *
        )
      )
    `
      )
      .eq("user_id", userId)
      .single();
    if (error) {
      return "User not found in Supabase: " + error.message;
    }
    return data;
  } catch (error: any) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
export async function getTotalUser(orgId: string) {
  try {
    if (!orgId) {
      throw new Error("Not authenticated");
    }

    const { count, error } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId);

    if (error) {
      return "User not found in Supabase: " + error.message;
    }
    return count;
  } catch (error: any) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
export async function deleteUser(user_id: string): Promise<{ success?: boolean; message?: string }> {
  try {
    if (!user_id) {
      throw new Error("User ID is not defined.");
    }

    const client = await clerkClient();
    const resp = await client.users.deleteUser(user_id);
    console.log("Delete response:", resp);

    return { success: true };
  } catch (err: any) {
    console.error("Error in deleteUser:", err);
    return {
      success: false,
      message: err?.message || "An unexpected error occurred while deleting the user.",
    };
  }
}
