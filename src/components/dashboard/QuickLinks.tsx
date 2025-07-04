"use client";

import Link from "next/link";
import {
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  BriefcaseIcon,
  UserIcon,
} from "lucide-react";

const links = [
  {
    href: "/deposit",
    label: "Deposit",
    icon: <ArrowDownToLineIcon className="w-5 h-5 text-blue-600" />,
    bg: "bg-blue-100 dark:bg-blue-600/20",
  },
  {
    href: "/withdraw",
    label: "Withdraw",
    icon: <ArrowUpFromLineIcon className="w-5 h-5 text-red-600" />,
    bg: "bg-red-100 dark:bg-red-600/20",
  },
  {
    href: "/investments",
    label: "Invest",
    icon: <BriefcaseIcon className="w-5 h-5 text-green-600" />,
    bg: "bg-green-100 dark:bg-green-600/20",
  },
  {
    href: "/profile",
    label: "Profile",
    icon: <UserIcon className="w-5 h-5 text-purple-600" />,
    bg: "bg-purple-100 dark:bg-purple-600/20",
  },
];

export default function QuickLinks() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 sm:p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-5">
        Quick Links
      </h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {links.map((link) => (
          <Link
            href={link.href}
            key={link.label}
            className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-transparent p-4 text-center transition-all hover:shadow-md hover:border-gray-200 dark:hover:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.05]"
          >
            <div
              className={`flex items-center justify-center rounded-full p-3 transition-transform group-hover:scale-105 group-hover:shadow-inner ${link.bg}`}
            >
              {link.icon}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-white">
              {link.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
