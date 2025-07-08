import { clerkClient } from "@clerk/nextjs/server";
import { UserStatus } from "@/types/enum";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId } = body;
        if (!userId) {
            return new Response(JSON.stringify({ error: "Missing userId" }), { status: 400 });
        }

        const clerk = await clerkClient();
        await clerk.users.updateUser(userId, {
            unsafeMetadata: {
                status: UserStatus.approved,
                isProfileComplete: true,
            },
        });

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to update user status" }), { status: 500 });
    }
}