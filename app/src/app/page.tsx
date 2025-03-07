import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Assistant } from "./assistant";
import { ClerkLogin } from "@/components/custom/login";

export default function Home() {

  return (
    <div className="relative">
      <SignedIn>
        <Assistant />
        <div className="absolute top-0 right-4">
          <UserButton />
        </div>
      </SignedIn>
      <SignedOut>
        <div className="h-dvh p-4 flex items-center justify-center">
          <ClerkLogin />
        </div>
      </SignedOut>
    </div>
  )

}
