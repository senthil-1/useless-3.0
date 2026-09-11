import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  accentColor?: string;
}

export default function ServiceCard({
  title,
  description,
  buttonLabel,
  href,
  icon: Icon,
  badge,
  accentColor = "bg-[#172235] text-[#e8c878]",
}: ServiceCardProps) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#172235] bg-[#fffaf0] p-6 shadow-[5px_5px_0_#172235] transition-all duration-200 hover:-translate-y-1 hover:shadow-[7px_7px_0_#172235] sm:p-7">
      {/* Top row with icon & optional badge */}
      <div>
        <div className="flex items-center justify-between">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#172235] ${accentColor} shadow-[2px_2px_0_#172235]`}
          >
            <Icon size={24} />
          </div>

          {badge && (
            <span className="rounded border border-[#172235] bg-[#e8c878] px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#172235]">
              {badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-5 font-serif text-2xl font-black text-[#172235] group-hover:text-[#9b1c31] transition-colors sm:text-[26px]">
          {title}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs leading-5 text-[#687386]">
          {description}
        </p>
      </div>

      {/* Button link */}
      <div className="mt-6 pt-4 border-t border-[#d8cfbd]">
        <Link
          href={href}
          className="inline-flex w-full items-center justify-between rounded-lg border-2 border-[#172235] bg-[#172235] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-[2px_2px_0_#e8c878] transition hover:bg-[#9b1c31] active:translate-x-[1px] active:translate-y-[1px]"
        >
          <span>{buttonLabel}</span>
          <span className="text-sm font-black transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </div>
  );
}
