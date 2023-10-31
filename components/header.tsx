import * as React from 'react'

import { currentUser, UserButton } from '@clerk/nextjs'

export async function Header() {
  const user = await currentUser()
  if (!user) return null

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
        <div className="flex items-center">
          <p className="font-semibold text-xl font-lg">Sales simulator</p>
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2 gap-4">
        <p className="text-sm">
          Welcome, <span className="font-bold">{user.firstName}</span>
        </p>
        <UserButton />
      </div>
    </header>
  )
}
