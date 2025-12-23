"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Brain, 
  FileText, 
  Activity, 
  Search,
  Home
} from "lucide-react";

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: Activity },
  { href: '/analyze', label: 'Analyze', icon: Brain },
  { href: '/documents', label: 'Documents', icon: FileText },
  { href: '/findings', label: 'Findings', icon: Search },
];

export function Navbar() {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${isLandingPage ? 'bg-white/80' : 'bg-black/80'} backdrop-blur-md border-b ${isLandingPage ? 'border-gray-200' : 'border-gray-800'}`}>
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className={`text-xl font-bold ${isLandingPage ? 'text-gray-900' : 'text-white'}`}>
          ASPERA
        </Link>
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <button 
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isActive 
                      ? 'bg-black text-white' 
                      : isLandingPage
                        ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
