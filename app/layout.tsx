import './globals.css';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Ministry of Useless Affairs',
  description: "The Republic's most unnecessarily official digital portal.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="paper-noise">

        <Navbar />

        <main>{children}</main>

        <footer className="mt-20 bg-[#10243d] text-white">
          <div className="max-w-7xl mx-auto px-5 py-12 grid md:grid-cols-3 gap-10">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/mua-logo.png" alt="MUA" className="w-10 h-10 object-contain" />
                <div className="text-sm font-bold tracking-wide">MINISTRY OF USELESS AFFAIRS</div>
              </div>
              <p className="text-sm text-slate-300 leading-6">
                Delivering highly official solutions to problems that probably did not need solving.
              </p>
            </div>

            {/* Popular services */}
            <div>
              <div className="text-xs uppercase tracking-[.16em] text-[#c9a44b] font-bold mb-4">
                Popular services
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                <Link className="block hover:text-white transition-colors" href="/report-incident">
                  Report an incident
                </Link>
                <Link className="block hover:text-white transition-colors" href="/certificate">
                  Request a certificate
                </Link>
                <Link className="block hover:text-white transition-colors" href="/track">
                  Track an application
                </Link>
              </div>
            </div>

            {/* Public notice */}
            <div>
              <div className="text-xs uppercase tracking-[.16em] text-[#c9a44b] font-bold mb-4">
                Public notice
              </div>
              <p className="text-sm text-slate-300 leading-6">
                The Ministry is currently investigating why the office biscuits have disappeared.
              </p>
            </div>

          </div>

          <div className="border-t border-white/10">
            <div className="max-w-7xl mx-auto px-5 py-5 text-xs text-slate-400 flex flex-col sm:flex-row justify-between gap-2">
              <span>© 2026 Ministry of Useless Affairs</span>
              <span>All proceedings are unnecessarily official.</span>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
