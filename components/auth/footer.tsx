import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Footer() {
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
          Help
        </Link>
        <div className="flex items-center md:ml-16">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-sm text-[#8996A9]">
              English
              <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>English</DropdownMenuItem>
            <DropdownMenuItem>Français</DropdownMenuItem>
            <DropdownMenuItem>Español</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      </div>
    </footer>
  );
}