"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f7f3ea]">
        <img src="/mua-logo.png" alt="MUA" className="w-16 h-16 object-contain animate-pulse" />
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#10243d]">
          Ministry is verifying your credentials...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
