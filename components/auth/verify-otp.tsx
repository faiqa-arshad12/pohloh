"use client";

import React, {useState, useRef, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useRouter} from "next/navigation";

export default function VerifyOTP() {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (idx: number, val: string) => {
    if (/^\d?$/.test(val)) {
      const newCode = [...code];
      newCode[idx] = val;
      setCode(newCode);
      if (val && idx < 5) {
        inputRefs.current[idx + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    idx: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const verificationCode = code.join("");
  const allFilled = verificationCode.length === 6;

  const handleVerify = () => {
    if (allFilled) {
      router.push(`reset-password?code=${verificationCode}`);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center lg:items-end text-white h-full rounded-2xl">
      <div className="max-w-2xl w-full px-8 py-8 rounded-2xl shadow-2xl backdrop-invert backdrop-opacity-10 relative z-10">
        <h2 className="text-2xl font-semibold text-white text-center">
          Enter the 6‑digit code
        </h2>
        <p className="mt-2 text-sm text-gray-400 text-center">
          We’ve sent a code to your email.
        </p>

        <div className="mt-6 grid grid-cols-6 gap-5">
          {code.map((digit, index) => (
            <Input
              name="otp"
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1} // Only allow 1 character per input field
              className="w-20 h-12 text-center text-lg"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        <Button
          className="mt-6 w-full"
          disabled={!allFilled}
          onClick={handleVerify}
        >
          Verify Code
        </Button>

        {/* <div className="mt-4 text-center">
          <button
            onClick={handleResend}
            className="text-sm text-indigo-400 hover:underline"
          >
            Resend code
          </button>
        </div> */}
      </div>
    </div>
  );
}
