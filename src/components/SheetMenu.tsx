import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface SheetMenuProps {
  chatComponents: React.ReactNode
}

export function SheetMenu({chatComponents}: SheetMenuProps) {
  return (
    <Sheet modal={false}>

      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-10" variant="outline" size="icon">
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform ease-in-out duration-700 rotate-180 "
            )}
          />
        </Button>
      </SheetTrigger>
      <SheetContent className="px-0 lg:px-3 h-screen flex flex-col" side="rightWide">
        <SheetHeader className="flex justify-center items-center pb-1 pt-1 ">          
        </SheetHeader>
         {chatComponents}
      </SheetContent>

    </Sheet>
  );
}
