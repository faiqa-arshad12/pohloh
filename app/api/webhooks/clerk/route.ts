import {headers} from "next/headers";
import {Webhook} from "svix";
import {supabase} from "@/supabase/client";
import {User} from "@/types/types";
import {clerkClient} from "@clerk/nextjs/server";

interface ClerkEvent {
  type: "user.created" | "user.updated" | "user.deleted";
  data: any;
}

export async function POST(req: Request) {
  const payload = await req.text();
  const headerList = await headers();
  const headerPayload = {
    "svix-id": headerList.get("svix-id") ?? "",
    "svix-signature": headerList.get("svix-signature") ?? "",
    "svix-timestamp": headerList.get("svix-timestamp") ?? "",
  };

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");
  let evt: ClerkEvent;

  try {
    evt = wh.verify(payload, headerPayload) as ClerkEvent;
  } catch (err) {
    return new Response("Webhook signature verification failed", {status: 400});
  }

  const user = evt.data;

  if (evt.type === "user.created") {
    const email = user.email_addresses?.[0]?.email_address || user.email;
    console.log(user, "user");

    // Check if user has unsafe metadata or if it's an empty object
    if (
      !user.unsafe_metadata ||
      Object.keys(user.unsafe_metadata).length === 0
    ) {
      const client = await clerkClient();

      const res = await client.users.updateUser(user.id, {
        unsafeMetadata: {role: "owner", status: "pending"},
      });
      console.log("inafe");
      // Set default metadata
    }

    const role =
      user?.unsafe_metadata?.role || user?.public_metadata?.role || "owner";
    const org_id =
      user?.unsafe_metadata?.org_id || user?.public_metadata?.org_id || null;

    const userData: any = {
      user_id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email,
      status: "pending",
      role,
      org_id,
    };

    const {error} = await supabase.from("users").insert([userData]);
    if (error) console.error("Supabase insert error:", error);
  } else if (evt.type === "user.updated") {
    const email = user.email_addresses?.[0]?.email_address || user.email;

    const {error} = await supabase
      .from("users")
      .update({
        first_name: user.first_name,
        last_name: user.last_name,
        // Include any other fields you want to update
      })
      .eq("user_id", user.id);

    if (error) console.error("Supabase update error:", error);
  } else if (evt.type === "user.deleted") {
    const {error} = await supabase
      .from("users")
      .delete()
      .eq("user_id", user.id);

    if (error) console.error("Supabase delete error:", error);
    else console.log(`Deleted user ${user.id} from Supabase`);
  } else {
    console.log("Unhandled Clerk event type:", evt.type);
  }

  return new Response("Webhook received", {status: 200});
}
