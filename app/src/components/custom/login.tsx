'use client';

import { SignIn } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { dark } from '@clerk/themes'

export const ClerkLogin = () => {
  const { resolvedTheme } = useTheme();

  return (
    <SignIn appearance={{
      baseTheme: resolvedTheme === 'dark' ? dark : undefined
    }} />
  )
}
