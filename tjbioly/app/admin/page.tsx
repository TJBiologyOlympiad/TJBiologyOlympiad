"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import UsersTab from "@/app/components/admin/UsersTab";
import AttendanceTab from "@/app/components/admin/AttendanceTab";
import ContestsTab from "@/app/components/admin/ContestsTab";
import POTWTab from "@/app/components/admin/POTWTab";
import { UserType, AttendanceBlockType } from "@/app/components/admin/types";

const TABS = ["users", "attendance", "contests", "potw"] as const;
type Tab = (typeof TABS)[number];

export default function AdminPage() {
  const { user, authenticated, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserType[]>([]);
  const [blocks, setBlocks] = useState<AttendanceBlockType[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("users");

  const isStaff = !!user && (user.roles.includes("officer") || user.roles.includes("sponsor"));

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) setUsers((await res.json()).users);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchBlocks = useCallback(async () => {
    try {
      const res = await fetch("/api/attendance/blocks");
      if (res.ok) setBlocks((await res.json()).blocks);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!authenticated || !isStaff) {
        router.push("/");
      } else {
        fetchUsers();
        fetchBlocks();
      }
    }
  }, [loading, authenticated, isStaff, router, fetchUsers, fetchBlocks]);

  const handleRoleToggle = async (userId: number, role: string, currentRoles: string[]) => {
    const newRoles = currentRoles.includes(role)
      ? currentRoles.filter((r) => r !== role)
      : [...currentRoles, role];
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, roles: newRoles } : u)));
    try {
      await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, roles: newRoles }),
      });
    } catch {
      fetchUsers();
    }
  };

  const handleCreateBlock = async (type: string, date: string, code: string) => {
    const res = await fetch("/api/attendance/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockType: type, date, code }),
    });
    if (!res.ok) throw new Error("Failed");
    fetchBlocks();
  };

  const handleDeleteBlock = async (id: number) => {
    await fetch(`/api/attendance/blocks?id=${id}`, { method: "DELETE" });
    fetchBlocks();
  };

  const handleExportCSV = (id?: number) => {
    window.open(id ? `/api/attendance/export?blockId=${id}` : "/api/attendance/export", "_blank");
  };

  if (loading || !isStaff) {
    return <div className="pt-28 text-center text-neutral-500">Loading…</div>;
  }

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Admin</h1>

        <div className="flex gap-2 mt-8 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm border capitalize ${
                activeTab === tab
                  ? "border-sage bg-sage text-neutral-900 font-semibold"
                  : "border-neutral-300 text-neutral-500"
              }`}
            >
              {tab === "potw" ? "POTW" : tab}
            </button>
          ))}
        </div>

        {activeTab === "users" && <UsersTab users={users} onRoleToggle={handleRoleToggle} />}
        {activeTab === "attendance" && (
          <AttendanceTab
            blocks={blocks}
            onCreateBlock={handleCreateBlock}
            onDeleteBlock={handleDeleteBlock}
            onExportCSV={handleExportCSV}
          />
        )}
        {activeTab === "contests" && <ContestsTab />}
        {activeTab === "potw" && <POTWTab />}
      </div>
    </div>
  );
}
