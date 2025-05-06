// app/layout.tsx
import type {Metadata} from "next";
import {ClerkProvider} from "@clerk/nextjs";
import {Urbanist} from "next/font/google";
import "./globals.css";
import Image from "next/image";
import {Toaster} from "@/components/ui/sonner";
import { UserProvider } from '@/components/ui/Context/UserContext';
const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "POHLOH",
  icons: {
    icon: "/logo/pohloh.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <ClerkProvider>
        <UserProvider>
        {/* <GoogleOneTap /> */}
        <body className={`${urbanist.variable} antialiased`}>
          <div className="relative gradient-background">
            <Image
              src="/Gradient.png"
              alt="Gradient background"
              fill
              style={{objectFit: "cover"}}
              quality={100}
              priority
            />
          </div>
          <div className="main-content">{children}</div>
          <Toaster />
        </body>
        </UserProvider>
      </ClerkProvider>
    </html>
  );
}
