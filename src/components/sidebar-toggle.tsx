import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarToggleProps {
  isOpen: boolean | undefined;
  setIsOpen?: () => void;
}

export function SidebarToggle({ isOpen, setIsOpen }: SidebarToggleProps) {
  return (
    <div className={`invisible lg:visible absolute top-[3rem] ${isOpen === false ? "-left-[45px]" : "-left-[16px]"}  z-20 bg-white dark:bg-primary-foreground`}>
      <Button
        onClick={() => setIsOpen?.()}
        className="rounded-md w-10 h-10"
        variant="outline"
        size="icon"
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 transition-transform ease-in-out duration-700",
            isOpen === false ? "rotate-180" : "rotate-0"
          )}
        />
      </Button>
    </div>
  );
}
