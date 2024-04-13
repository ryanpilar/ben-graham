import { cookies } from "next/headers"
import Image from "next/image"

import { Mail } from "@/app/mail/components/mail"
import { accounts, mails } from "@/app/mail/data"

export default function MailPage() {
  const layout = cookies().get("react-resizable-panels:layout")
  const collapsed = cookies().get("react-resizable-panels:collapsed");
  let defaultCollapsed;
  // Check if collapsed.value is undefined or "undefined"
  if (collapsed?.value === undefined || collapsed?.value === "undefined") {
    defaultCollapsed = false;
  } else {
    // Safely parse collapsed.value, assuming it can be valid JSON or undefined
    try {
      defaultCollapsed = JSON.parse(collapsed.value);
    } catch (error) {
      console.error("Error parsing collapsed value:", error);
      defaultCollapsed = false; // Set a default or handle the error as needed
    }
  }

  let defaultLayout;
  // Similar handling for layout to prevent similar errors
  try {
    defaultLayout = layout ? JSON.parse(layout.value) : undefined;
  } catch (error) {
    console.error("Error parsing layout value:", error);
    defaultLayout = undefined; // Set a default or handle the error as needed
  }
  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/mail-dark.png"
          width={1280}
          height={727}
          alt="Mail"
          className="hidden dark:block"
        />
        <Image
          src="/examples/mail-light.png"
          width={1280}
          height={727}
          alt="Mail"
          className="block dark:hidden"
        />
      </div>
      <div className="hidden flex-col md:flex">
        <Mail
          accounts={accounts}
          mails={mails}
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
        />
      </div>
    </>
  )
}
