"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/usabo", label: "USABO" },
  { href: "/contact", label: "Contact" },
];

// Anchor links (e.g. "/#about") use a plain <a> so hash scrolling works from
// any page; real routes use next/link for client-side navigation.
const isRoute = (href: string) => !href.startsWith("/#");

export default function Navbar() {
  const { loading, authenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ease-in-out ${
        scrolled
          ? "bg-[#f6f6f3]/90 backdrop-blur-md border-b border-neutral-200"
          : "bg-gradient-to-b from-white/60 to-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? "h-16" : "h-20"
          }`}
        >
          <Link
            href="/"
            className={`flex items-center gap-2.5 text-lg font-medium tracking-tight transition-colors text-neutral-900
            `}
          >
            <img
              src="/logo.svg"
              alt="TJ Biology Olympiad logo"
              className={`w-8 h-8 object-contain`}
            />
            TJ Biology Olympiad
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) =>
              isRoute(link.href) ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-semibold text-neutral-700 transition-colors hover:text-sage"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-semibold text-neutral-700 transition-colors hover:text-sage"
                >
                  {link.label}
                </a>
              )
            )}
            {!loading && !authenticated && (
              <Link
                href="/api/auth/login"
                className={`group inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-sage ${
                  scrolled ? "text-neutral-700" : "text-neutral-700"
                }`}
              >
                Sign In
                <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
            {authenticated && (
              <Link
                href="/api/auth/logout"
                className={`text-sm font-semibold transition-colors hover:text-sage ${
                  scrolled ? "text-neutral-700" : "text-neutral-700"
                }`}
              >
                Sign Out
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-900 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#f6f6f3] border-t border-neutral-200">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) =>
              isRoute(link.href) ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              )
            )}
            {!loading && !authenticated ? (
              <Link
                href="/api/auth/login"
                className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            ) : (
              authenticated && (
                <Link
                  href="/api/auth/logout"
                  className="block px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Out
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
