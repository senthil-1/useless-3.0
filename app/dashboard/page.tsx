'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DashboardShell from '@/components/DashboardShell'
import {
  getCurrentCitizen, refreshCitizen, getCitizenIncidents,
  getCitizenCertificates, getRankedCitizens, getTitle, NOTICES,
  type Citizen, type Incident, type Certificate,
} from '@/lib/store'
import { FileWarning, Award, ClipboardList, Star, Trophy, Bell, Megaphone, ArrowRight } from 'lucide-react'

export default function Dashboard() {
  const router = useRouter()
  const [citizen, setCitizen] = useState<Citizen | null>(null)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [certs, setCerts] = useState<Certificate[]>([])
  const [rank, setRank] = useState(0)

  useEffect(() => {
    const c = getCurrentCitizen()
    if (!c) { router.push('/login'); return }
    const fresh = refreshCitizen(c.id) ?? c
    setCitizen(fresh)
    setIncidents(getCitizenIncidents(fresh.id))
    setCerts(getCitizenCertificates(fresh.id))
    const ranked = getRankedCitizens()
    setRank(ranked.find(x => x.id === fresh.id)?.rank ?? ranked.length + 1)
  }, [router])

  if (!citizen) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4efe4]">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">⏳</div>
        <p className="font-black uppercase tracking-widest text-[#172235] text-sm">Verifying Citizen Identity...</p>
        <p className="text-xs text-[#818792] mt-2">The Ministry is checking its records.</p>
      </div>
    </div>
  )

  const stats = [
    { label: 'Incidents Reported', value: incidents.length, icon: FileWarning, color: 'text-[#9b1c31]', bg: 'bg-[#fde8e8]' },
    { label: 'Certificates', value: certs.length, icon: Award, color: 'text-[#7a5a12]', bg: 'bg-[#efe6ce]' },
    { label: 'Applications', value: incidents.length + certs.length, icon: ClipboardList, color: 'text-[#172235]', bg: 'bg-[#e4ebf2]' },
    { label: 'Useless Points', value: citizen.points, icon: Star, color: 'text-[#c9a44b]', bg: 'bg-[#fdf6e3]' },
    { label: 'Current Rank', value: `#${rank}`, icon: Trophy, color: 'text-[#6f1020]', bg: 'bg-[#f3e1e3]' },
  ]

  const recentActivity = [
    ...incidents.slice(-4).map(i => ({ text: `Reported: ${i.type}`, id: i.id, date: i.submittedAt, color: 'border-[#9b1c31]', badge: 'bg-[#fde8e8] text-[#9b1c31]', badgeText: 'Incident' })),
    ...certs.slice(-4).map(c => ({ text: `Certificate: ${c.achievement}`, id: c.id, date: c.requestedAt, color: 'border-[#c9a44b]', badge: 'bg-[#efe6ce] text-[#7a5a12]', badgeText: 'Certificate' })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  const latestNotice = NOTICES[0]

  return (
    <DashboardShell>
      {/* Welcome banner */}
      <div className="bg-[#172235] rounded-2xl p-7 mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-full opacity-5 bg-[radial-gradient(circle,#e8c878_1px,transparent_1px)] bg-[length:16px_16px]" />
        <div className="relative">
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#e8c878]">Citizen Dashboard · {citizen.id}</p>
          <h2 className="font-serif text-3xl md:text-4xl font-black text-white mt-2">
            Welcome, <span className="text-[#e8c878]">{citizen.name}.</span>
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            {getTitle(citizen.points)} · Joined {citizen.joinedAt}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-[#fffaf0] border border-[#ded6c9] rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-4`}>
              <Icon size={20} className={color} />
            </div>
            <div className="font-serif text-3xl font-black text-[#172235]">{value}</div>
            <div className="text-[10px] uppercase tracking-[0.12em] text-[#818792] mt-1 leading-4">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: 2 cols */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Incidents */}
          <div className="bg-[#fffaf0] border border-[#ded6c9] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#ded6c9] bg-[#f9f6ef]">
              <h3 className="font-black uppercase tracking-[0.12em] text-sm flex items-center gap-2">
                <FileWarning size={16} className="text-[#9b1c31]" /> Recent Incidents
              </h3>
              <Link href="/report-incident" className="text-[10px] font-black uppercase tracking-widest text-[#9b1c31] hover:underline">+ Report New</Link>
            </div>
            <div className="p-6">
              {incidents.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-sm text-[#818792] italic">No incidents reported yet. The Ministry is waiting.</p>
                  <Link href="/report-incident" className="mt-3 inline-block text-[11px] font-black uppercase tracking-widest text-[#9b1c31] underline">Report your first incident →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {incidents.slice(-4).reverse().map(inc => (
                    <div key={inc.id} className="flex items-center justify-between border border-[#ded6c9] rounded-xl px-4 py-3 bg-white hover:bg-[#fafaf8] transition">
                      <div>
                        <p className="font-bold text-sm text-[#172235]">{inc.type}</p>
                        <p className="text-[10px] text-[#818792] mt-0.5">{inc.id} · {inc.department}</p>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-[#fde8e8] text-[#9b1c31] px-2 py-1 rounded-full shrink-0 ml-3">{inc.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Certificates */}
          <div className="bg-[#fffaf0] border border-[#ded6c9] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#ded6c9] bg-[#f9f6ef]">
              <h3 className="font-black uppercase tracking-[0.12em] text-sm flex items-center gap-2">
                <Award size={16} className="text-[#7a5a12]" /> Recent Certificates
              </h3>
              <Link href="/certificate" className="text-[10px] font-black uppercase tracking-widest text-[#9b1c31] hover:underline">+ Request New</Link>
            </div>
            <div className="p-6">
              {certs.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">🏆</div>
                  <p className="text-sm text-[#818792] italic">No certificates issued yet. Your mediocrity awaits recognition.</p>
                  <Link href="/certificate" className="mt-3 inline-block text-[11px] font-black uppercase tracking-widest text-[#7a5a12] underline">Request your first certificate →</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {certs.slice(-4).reverse().map(cert => (
                    <div key={cert.id} className="flex items-center justify-between border border-[#ded6c9] rounded-xl px-4 py-3 bg-white hover:bg-[#fafaf8] transition">
                      <div>
                        <p className="font-bold text-sm text-[#172235]">{cert.achievement}</p>
                        <p className="text-[10px] text-[#818792] mt-0.5">{cert.id} · {cert.requestedAt}</p>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-[#efe6ce] text-[#7a5a12] px-2 py-1 rounded-full shrink-0 ml-3">{cert.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#fffaf0] border border-[#ded6c9] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#ded6c9] bg-[#f9f6ef]">
              <h3 className="font-black uppercase tracking-[0.12em] text-sm flex items-center gap-2">
                <Bell size={16} className="text-[#172235]" /> Recent Activity
              </h3>
            </div>
            <div className="p-6">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-[#818792] italic text-center py-4">No activity yet. The Ministry is watching and waiting.</p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((a, i) => (
                    <div key={i} className={`border-l-4 ${a.color} pl-4`}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm text-[#172235]">{a.text}</p>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${a.badge}`}>{a.badgeText}</span>
                      </div>
                      <p className="text-[10px] text-[#818792] mt-0.5">{a.id} · {a.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-[#172235] rounded-2xl p-6 text-white">
            <h3 className="font-black uppercase tracking-[0.15em] text-[11px] text-[#e8c878] mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { href: '/report-incident', label: 'Report an Incident', bg: 'bg-[#9b1c31] hover:bg-[#7a1525]' },
                { href: '/certificate', label: 'Request Certificate', bg: 'bg-[#7a5a12] hover:bg-[#5a4010]' },
                { href: '/track', label: 'Track Application', bg: 'bg-[#1e3a5f] hover:bg-[#162d4a]' },
                { href: '/leaderboard', label: 'View Rankings', bg: 'bg-[#2d4a2d] hover:bg-[#1f341f]' },
              ].map(({ href, label, bg }) => (
                <Link key={href} href={href}
                  className={`flex items-center justify-between w-full ${bg} rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] transition`}>
                  {label} <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </div>

          {/* Rank card */}
          <div className="bg-[#fffaf0] border border-[#ded6c9] rounded-2xl p-6">
            <h3 className="font-black uppercase tracking-[0.12em] text-[11px] flex items-center gap-2 mb-4">
              <Trophy size={15} className="text-[#c9a44b]" /> Your Standing
            </h3>
            <div className="text-center py-2">
              <div className="font-serif text-6xl font-black text-[#172235]">#{rank}</div>
              <div className="text-[10px] uppercase tracking-widest text-[#818792] mt-1">National Rank</div>
              <div className="mt-3 bg-[#efe6ce] rounded-xl px-4 py-2 text-sm font-bold text-[#7a5a12]">
                {getTitle(citizen.points)}
              </div>
              <div className="mt-2 text-lg font-black text-[#172235]">{citizen.points} <span className="text-sm font-bold text-[#818792]">pts</span></div>
            </div>
            <Link href="/leaderboard"
              className="mt-4 flex items-center justify-center gap-2 w-full border-2 border-[#172235] rounded-xl py-2.5 text-[11px] font-black uppercase tracking-[0.1em] hover:bg-[#eee8dc] transition">
              Full Leaderboard <ArrowRight size={13} />
            </Link>
          </div>

          {/* Latest Notice */}
          <div className="bg-[#fffaf0] border border-[#ded6c9] rounded-2xl overflow-hidden">
            <div className="bg-[#172235] text-white px-5 py-3 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2">
                <Megaphone size={13} /> Latest Notice
              </span>
              <Link href="/notices" className="text-[9px] text-[#e8c878] hover:underline font-bold">View all →</Link>
            </div>
            <div className="p-5">
              <span className="text-[9px] font-black uppercase tracking-widest bg-[#efe6ce] text-[#6f1020] px-2 py-1 rounded-full">
                Notice No. {latestNotice.number}
              </span>
              <h4 className="font-serif text-lg font-bold text-[#172235] mt-3">{latestNotice.title}</h4>
              <p className="text-sm text-[#818792] mt-2 leading-6 line-clamp-3">{latestNotice.body}</p>
              <p className="text-[10px] text-[#818792] mt-3 font-bold">{latestNotice.department} · {latestNotice.date}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}
