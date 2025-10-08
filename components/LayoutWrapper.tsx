'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Pages sans header/footer
  const noLayoutPages = ['/login', '/signup', '/dashboard']
  const hideLayout = noLayoutPages.some(page => pathname?.startsWith(page))

  if (hideLayout) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
