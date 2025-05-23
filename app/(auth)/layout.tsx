import { Suspense } from "react";
import "../../app/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full text-white font-urbanist">
       <Suspense fallback={<div>Loading...</div>}>
      {children}
       </Suspense>
    </div>
  );
}
