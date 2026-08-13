"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { ChevronDown, User as UserIcon, Menu, X } from "lucide-react";
import NotificationPanel from "./NotificationPanel";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/resources", label: "Resources" },
  { href: "/schedule", label: "Schedule" },
  { href: "/potw", label: "POTW" },
];

export default function InternalNavbar() {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  if (!user) return null;

  const isStaff = user.roles.includes("officer") || user.roles.includes("sponsor");

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await fetch("/api/auth/logout");
    window.location.href = "/";
  };

  return (
    <nav className="fixed w-full z-50 bg-white border-b border-neutral-200 h-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-full flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.svg" alt="TJ Biology Olympiad logo" className="w-8 h-8 object-contain" />
          <span className="text-neutral-900 font-medium tracking-tight hidden sm:inline">
            TJ Biology Olympiad
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-neutral-700 hover:text-sage transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <NotificationPanel />
          </div>
          <div className="hidden md:flex items-center relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <UserIcon className="w-5 h-5 text-neutral-700" />
              <span className="text-neutral-900 font-medium text-sm">{user.name || "Member"}</span>
              <ChevronDown className="w-4 h-4 text-neutral-500" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-10 w-44 bg-white border border-neutral-200 py-1">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-sage transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  Profile
                </Link>
                {isStaff && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-sage transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-900"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <hr className="border-neutral-200 my-2" />
            <Link
              href="/profile"
              className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </Link>
            {isStaff && (
              <Link
                href="/admin"
                className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
