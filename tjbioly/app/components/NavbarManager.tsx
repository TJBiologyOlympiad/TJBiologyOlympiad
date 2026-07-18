"use client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "./Navbar";
import InternalNavbar from "./InternalNavbar";

export default function NavbarManager() {
  const { user, authenticated, loading } = useAuth();

  if (loading) {
    return <div className="h-16 w-full fixed z-50" />;
  }

  if (!authenticated || !user) {
    return <Navbar />;
  }

  return <InternalNavbar />;
}
