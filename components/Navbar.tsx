'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Search, ShieldCheck, Menu, X, LogOut } from 'lucide-react';

const nav = [
  ['Services', '/#services'],
  ['Track', '/track'],
  ['Citizens', '/profile'],
  ['Rankings', '/leaderboard'],
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    alert('LOGOUT\n\nYou have been officially dismissed.\nFirebase sign-out will be connected here.');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#f7f3ea]/95 backdrop-blur border-b border-[#ded6c9]">

      {/* Government strip */}
      <div className="gov-strip px-5 py-2 text-[11px] tracking-[.16em] uppercase flex items-center justify-center gap-2">
        <ShieldCheck size={13} />
        Official digital portal of the Ministry of Useless Affairs
      </div>

      {/* Gold rule */}
      <div className="gold-rule" />

      {/* Main navbar row */}
      <div className="max-w-7xl mx-auto px-5 h-20 flex items-center justify-between gap-5">

        {/* Logo + wordmark */}
        <Link href="/" className="flex items-center gap-3 min-w-0 shrink-0">
          <img
            src="/mua-logo.png"
            alt="Ministry of Useless Affairs"
            className="w-12 h-12 object-contain shrink-0"
          />
          <div className="min-w-0 hidden sm:block">
            <div className="font-bold text-sm tracking-wide truncate">MINISTRY OF USELESS AFFAIRS</div>
            <div className="text-[11px] text-slate-500">Department of Completely Unnecessary Governance</div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold">
          {nav.map(([label, href]) => (
            <Link key={label} href={href} className="hover:text-[#6f1020] transition-colors">
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-2">
          <button className="p-2 rounded-full border border-[#ded6c9] bg-white hover:bg-[#f1eee7] transition-colors">
            <Search size={17} />
          </button>
          <button className="p-2 rounded-full border border-[#ded6c9] bg-white hover:bg-[#f1eee7] transition-colors">
            <Bell size={17} />
          </button>
          <Link href="/profile" className="btn btn-primary py-2.5 px-4">
            Citizen Portal
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[.65rem] border border-[#ded6c9] bg-white text-sm font-bold text-slate-600 hover:text-[#6f1020] hover:border-[#6f1020] transition-colors"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-full border border-[#ded6c9] bg-white"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#ded6c9] bg-[#f7f3ea] px-5 py-4 space-y-1">
          {nav.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="block py-3 px-4 rounded-xl text-sm font-semibold hover:bg-[#efe6ce] hover:text-[#6f1020] transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#ded6c9] mt-3 flex flex-col gap-2">
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="btn btn-primary py-3 w-full"
            >
              Citizen Portal
            </Link>
            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-[.65rem] border border-[#ded6c9] bg-white text-sm font-bold text-slate-600 hover:text-[#6f1020] hover:border-[#6f1020] transition-colors"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
