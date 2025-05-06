import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { supabase } from '@/supabase/client';
import { User } from '@/types/types';
interface ClerkUserCreatedEvent {
    type: 'user.created' | 'user.updated';
    data: {
        id: string;
        email: string;
    };
}
export async function POST(req: Request) {
    const payload = await req.text();
    const headerList = await headers();
    const headerPayload = {
        'svix-id': headerList.get("svix-id") ?? '',
        'svix-signature': headerList.get("svix-signature") ?? '',
        'svix-timestamp': headerList.get("svix-timestamp") ?? '',
    };

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
    let evt: unknown;

    try {
        evt = wh.verify(payload, headerPayload);
    } catch (err) {
        return new Response("Webhook signature verification failed", { status: 400 });
    }

    // ✅ Narrow the type of `evt` to ClerkUserCreatedEvent
    if ((evt as ClerkUserCreatedEvent).type === 'user.created') {
        const user: any = (evt as ClerkUserCreatedEvent).data;
        const email = user.email_addresses[0]?.email_address;
        const role = user?.unsafe_metadata?.role || user?.public_metadata?.role || 'user';
        const org_id = user?.unsafe_metadata?.org_id || user?.public_metadata?.org_id || null

        const userData: User = {
            user_id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: email,
            status: 'pending',
            role: role,
            org_id: org_id
        };

        const { error } = await supabase.from('users').insert([userData]);


    } else if ((evt as ClerkUserCreatedEvent).type === 'user.updated') {
        const user: any = (evt as ClerkUserCreatedEvent).data;
        const email = user.email_addresses[0]?.email_address;
        const { data, error } = await supabase.from('users').update({
            first_name: user.first_name,
            last_name: user.last_name,
            // user_name: user.unsafe_metadata.user_name || "",
            // user_role: user.unsafe_metadata.user_role || "",
            // status: user.unsafe_metadata.status,
            // location: user.unsafe_metadata.location || "",
            // profile_picture: user.unsafe_metadata.profile_picture || ""
        }).eq('user_id', user.id);
        console.log("User updated:", user.id, error, data);
    } else {
        console.log("Received other event type:", (evt as { type: string }).type);
    }

    return new Response("Webhook received", { status: 200 });
}
