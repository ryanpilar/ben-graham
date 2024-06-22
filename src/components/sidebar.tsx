'use client'
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import { Button } from "@/components/ui/button";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { SidebarToggle } from "@/components/sidebar-toggle";


interface SidebarProps {
  chatComponents: React.ReactNode
}

export function Sidebar({ chatComponents }: SidebarProps) {


  const sidebar = useStore(useSidebarToggle, (state) => state);

  return (
    <aside className={cn("fixed top-[2.4rem] right-0 z-30 h-100 -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300 invisible lg:visible",
        sidebar?.isOpen === false ? " lg:mr-[0px]" : "lg:w-1/2"
      )}
    >
      <SidebarToggle isOpen={sidebar?.isOpen} setIsOpen={sidebar?.setIsOpen} />

      <div className="h-full flex flex-col pt-[8px] overflow-y-auto shadow-md dark:shadow-gray-800">

        <div className={cn("transition-transform ease-in-out duration-300 mb-1",
            sidebar?.isOpen === false ? "translate-x-1" : "translate-x-0"
          )}
        >
          <div className="items-center gap-2">
            <div className={cn("font-bold text-lg transition-[transform,opacity,display] ease-in-out duration-300",
                sidebar?.isOpen === false
                  ? "-translate-x-[0px] opacity-0 hidden"
                  : "translate-x-0 opacity-100"
              )}
            >
              {chatComponents}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
