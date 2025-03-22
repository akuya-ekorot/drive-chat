"use client";

import { UserButton as ClerkUserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export const UserButton: React.FC<
  React.ComponentPropsWithoutRef<typeof ClerkUserButton>
> = ({ appearance, ...props }) => {
  const { theme } = useTheme();

  return (
    <ClerkUserButton
      {...props}
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
      }}
    />
  );
};
