"use client"

import * as React from "react"
import {
  AlertCircle,
  Archive,
  ArchiveX,
  File,
  Inbox,
  MessagesSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  ShoppingCart,
  Trash2,
  Users2,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AccountSwitcher } from "@/app/mail/components/account-switcher"
import { Nav } from "@/app/mail/components/nav"
import { Button } from "./ui/button"
import { Button as NUIButton } from '@nextui-org/button';

import { ImperativePanelHandle } from "react-resizable-panels"

interface ResizableLayoutProps {
  accounts: {
    label: string
    email: string
    icon: React.ReactNode
  }[]
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
}
export function ResizableLayout({
  accounts,
  defaultLayout = [.15, .2, .2],
  defaultCollapsed = true,
  navCollapsedSize,
}: ResizableLayoutProps) {

  const leftPanelRef = React.useRef<ImperativePanelHandle>(null);
  const rightPanelRef = React.useRef<ImperativePanelHandle>(null);


  const [isLeftCollapsed, setIsLeftCollapsed] = React.useState(defaultCollapsed)
  const [isRightCollapsed, setIsRightCollapsed] = React.useState(defaultCollapsed)


  const toggleLeftCollapse = () => {
    if (leftPanelRef.current) {
      if (leftPanelRef.current.isCollapsed()) {
        // panelRef.current.expand();
        leftPanelRef.current.resize(40)
      } else {
        leftPanelRef.current.collapse();
      }
    }
  }

  const toggleRightCollapse = () => {
    if (rightPanelRef.current) {
      rightPanelRef.current.isCollapsed() ?
        rightPanelRef.current.expand() : rightPanelRef.current.collapse();
    }
  }

  const handleResize = (newSize: number) => {
    if (leftPanelRef.current) {
      leftPanelRef.current.resize(newSize);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>

      <ResizablePanelGroup
        className="h-full max-h-[800px] items-stretch"
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`
        }}
      >
        <ResizablePanel
          id='left'
          ref={leftPanelRef}
          className={`transition-all duration-300 ease-in-out ${isLeftCollapsed ? 'w-[50px]' : 'w-full'} mx-2 px-3`}
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={20}
          maxSize={40}

          // onCollapse={() => togglePanel()}
          // onExpand={() => togglePanel()}
          onCollapse={() => {
            setIsLeftCollapsed(true)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}`
          }}
          onExpand={() => {
            setIsLeftCollapsed(false)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}`
          }}
        >

          {/* SIDE PANEL OPEN/CLOSE BUTTON */}
          <div className={cn(`flex ${isLeftCollapsed ? 'flex-col ' : 'justify-end'} h-[82px] justify-center items-center `, isLeftCollapsed ? "h-[82px]" : "")}>

            {/* <Button onClick={toggleCollapse} variant='none' className={`${isCollapsed ? 'order-2' : 'order-2'}`}> */}
            <Button onClick={toggleLeftCollapse} variant='none' className=''>
              {isLeftCollapsed ? <PanelLeftOpen size={25} strokeWidth={1} absoluteStrokeWidth /> : <PanelLeftClose size={25} strokeWidth={1.5} absoluteStrokeWidth />}
            </Button>


            {/* <div className={cn(`${isCollapsed ? 'order-2' : 'order-2'}`, 'w-full')}> */}
            <div className={cn('w-full flex justify-center')}>
              <AccountSwitcher isCollapsed={isLeftCollapsed} accounts={accounts} />
            </div>


          </div>

          <Separator />

          <Nav isCollapsed={isLeftCollapsed}
            links={[
              {
                title: "Inbox",
                label: "128",
                icon: Inbox,
                variant: "default",
              },
              {
                title: "Drafts",
                label: "9",
                icon: File,
                variant: "ghost",
              },
              {
                title: "Sent",
                label: "",
                icon: Send,
                variant: "ghost",
              },
              {
                title: "Junk",
                label: "23",
                icon: ArchiveX,
                variant: "ghost",
              },
              {
                title: "Trash",
                label: "",
                icon: Trash2,
                variant: "ghost",
              },
              {
                title: "Archive",
                label: "",
                icon: Archive,
                variant: "ghost",
              },
            ]} />

          <Separator />

          <Nav isCollapsed={isLeftCollapsed} links={[
            {
              title: "Social",
              label: "972",
              icon: Users2,
              variant: "ghost",
            },
            {
              title: "Updates",
              label: "342",
              icon: AlertCircle,
              variant: "ghost",
            },
            {
              title: "Forums",
              label: "128",
              icon: MessagesSquare,
              variant: "ghost",
            },
            {
              title: "Shopping",
              label: "8",
              icon: ShoppingCart,
              variant: "ghost",
            },
            {
              title: "Promotions",
              label: "21",
              icon: Archive,
              variant: "ghost",
            },
          ]} />

        </ResizablePanel>

        <ResizableHandle withHandle

        />
        {/* MIDDLE PANEL */}
        <ResizablePanel
          id='middle'
          defaultSize={defaultLayout[1]}
          className="flex justify-center mt-52"
        >

          <NUIButton>LEFT VIEW!</NUIButton>


        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* RIGHT PANEL */}
        <ResizablePanel
          id='right'
          ref={rightPanelRef}
          // className={`relative flex justify-center mt-52 transition-all duration-300 ease-in-out ${isRightCollapsed ? 'w-[50px]' : 'w-full'} mx-2 px-3`}
          className={`relative transition-all duration-300 ease-in-out ${isRightCollapsed ? 'w-[50px]' : 'w-full'} mx-2 px-3`}

          defaultSize={defaultLayout[2]}
          // collapsedSize={50}  // Set a collapsed size for the icon only
          collapsible={true}
          onCollapse={() => setIsRightCollapsed(true)}
          onExpand={() => setIsRightCollapsed(false)}
        >

          <NUIButton>RIGHT VIEW!</NUIButton>

          {/* Floating Icon */}
          <div className="absolute top-0 right-0 mt-2 mr-2">
            <Button onClick={toggleRightCollapse} variant='outline'>
              {isRightCollapsed ? <PanelLeftOpen size={25} strokeWidth={1} absoluteStrokeWidth /> : <PanelLeftClose size={25} strokeWidth={1.5} absoluteStrokeWidth />}
            </Button>
          </div>

          {/* Panel content */}
          {!isRightCollapsed && <div className="p-10"></div>}

        </ResizablePanel>

      </ResizablePanelGroup>
    </TooltipProvider>
  )
}
