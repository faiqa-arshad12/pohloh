"use client";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {useState} from "react";

export function Footer() {
  const languageMap = {
    en: "English",
  };

  type LanguageCode = keyof typeof languageMap;

  const [selectedLang, setSelectedLang] = useState<LanguageCode>("en");

  return (
    <footer className="py-16 flex justify-between items-center text-white">
      <div className="flex items-center space-x-4 text-sm text-[#8996A9] dark:text-gray-400">
        <Link href="/terms" className="hover:text-gray-100">
          Terms
        </Link>
        <span>•</span>
        <Link href="/privacy" className="hover:text-gray-100">
          Privacy
        </Link>
        <span>•</span>
        <Link href="/docs" className="hover:text-gray-100">
          Docs
        </Link>
        <span>•</span>
        <Link href="/help" className="hover:text-gray-100">
          Helps
        </Link>
        <div className="flex items-center md:ml-16">
          <Select
            value={selectedLang}
            onValueChange={(val: LanguageCode) => setSelectedLang(val)}
          >
            <SelectTrigger className="flex items-center gap-4 outline-none border-none ">
              <img src="/language.png" alt="Lang" className="w-5 h-5" />
              <span>{languageMap[selectedLang]}</span>
            </SelectTrigger>

            <SelectContent className="bg-[#2C2D2E] text-[#FFFFFF52]">
              <SelectItem value="en" className="text-[14px] text-[#8996A9]">
                English
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </footer>
  );
}
