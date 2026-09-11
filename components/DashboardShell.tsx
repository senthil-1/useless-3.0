'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getCurrentCitizen, setCurrentCitizen, type Citizen } from '@/lib/store'
import {
  LogOut, LayoutDashboard, FileWarning, Award,
  ClipboardList, User, Crown, Megaphone,
} from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/report-incident', label: 'Report Incident', Icon: FileWarning },
  { href: '/certificate', label: 'Certificate', Icon: Award },
  { href: '/track', label: 'Track', Icon: ClipboardList },
  { href: '/profile', label: 'My Profile', Icon: User },
  { href: '/leaderboard', label: 'Ranking', Icon: Crown },
  { href: '/notices', label: 'Notices', Icon: Megaphone },
]

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [citizen, setCitizen] = useState<Citizen | null>(null)

  useEffect(() => {
    const c = getCurrentCitizen()
    if (!c) { router.push('/login'); return }
    setCitizen(c)
  }, [router])

  const logout = () => {
    setCurrentCitizen(null)
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#f4efe4]">
      {/* Top strip */}
      <div className="bg-[#172235] text-[#e8c878] text-[8px] font-black uppercase tracking-[0.2em] h-7 flex items-center justify-center">
        Government of Useless Affairs · Official Citizen Portal
      </div>

      {/* Header */}
      <header className="bg-[#fffaf0] border-b-[3px] border-[#9b1c31] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-5 h-[72px] flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0">
            <img src="/mua-logo.png" alt="MUA" className="h-12 w-12 object-contain shrink-0" />
            <div className="min-w-0 hidden sm:block">
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#9b1c31]">Republic of Questionable Decisions</p>
              <h1 className="font-serif text-[16px] font-black uppercase tracking-wide text-[#172235] truncate">Ministry of Useless Affairs</h1>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV.map(({ href, label, Icon }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-black uppercase tracking-[0.08em] transition whitespace-nowrap
                  ${pathname === href ? 'bg-[#9b1c31] text-white' : 'text-[#172235] hover:bg-[#eee8dc]'}`}>
                <Icon size={12} />{label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {citizen && (
              <div className="hidden md:block text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#172235]">{citizen.name}</p>
                <p className="text-[9px] text-[#818792]">{citizen.id}</p>
              </div>
            )}
            <button onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-[#172235] bg-[#9b1c31] text-white text-[10px] font-black uppercase tracking-[0.1em] hover:bg-[#7a1525] transition">
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      <div className="lg:hidden bg-[#172235] overflow-x-auto">
        <div className="flex items-center gap-1 px-4 py-2 min-w-max">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-[0.1em] whitespace-nowrap transition
                ${pathname === href ? 'bg-white/20 text-white' : 'text-[#e8c878] hover:bg-white/10'}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-5 py-10">{children}</main>

      {/* Footer */}
      <footer className="bg-[#172235] text-white mt-16">
        <div className="max-w-7xl mx-auto px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/mua-logo.png" alt="MUA" className="h-8 w-8 object-contain opacity-80" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#e8c878]">Ministry of Useless Affairs</span>
          </div>
          <p className="text-[10px] text-slate-400 text-center">© 2026 · All proceedings are unnecessarily official · Nothing important happens here.</p>
        </div>
      </footer>
    </div>
  )
}
