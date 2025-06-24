"use client";

import {useEffect, Suspense} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {useClerk} from "@clerk/nextjs";

function SSOCallbackContent() {
  const {handleRedirectCallback, setActive} = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const finalizeSSO = async () => {
      try {
        if (searchParams) {
          const params = Object.fromEntries(searchParams?.entries());

          // safely cast the result
          const {createdSessionId} = (await handleRedirectCallback(params)) as {
            createdSessionId: string;
          };
          await setActive({session: createdSessionId});
          router.replace("/dashboard");
        }
      } catch (error) {
        console.error(error);
        router.replace("/login");
      }
    };

    finalizeSSO();
  }, [handleRedirectCallback, setActive, router, searchParams]);

  return <div className="text-white p-6">Processing SSO callback...</div>;
}

export default function SSOCallback() {
  return (
    <Suspense fallback={<div className="text-white p-6">Loading...</div>}>
      <SSOCallbackContent />
    </Suspense>
  );
}
