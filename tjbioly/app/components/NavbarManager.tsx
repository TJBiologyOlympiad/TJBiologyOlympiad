"use client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "./Navbar";
import InternalNavbar from "./InternalNavbar";

export default function NavbarManager() {
  const { user, authenticated } = useAuth();

  if (!authenticated || !user) {
    return <Navbar />;
  }

  return <InternalNavbar />;
}
