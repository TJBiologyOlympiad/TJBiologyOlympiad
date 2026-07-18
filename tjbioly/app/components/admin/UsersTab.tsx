"use client";
import { UserType } from "./types";

const ROLES = ["officer", "sponsor", "user"];

export default function UsersTab({
  users,
  onRoleToggle,
}: {
  users: UserType[];
  onRoleToggle: (userId: number, role: string, currentRoles: string[]) => void;
}) {
  return (
    <div className="border border-neutral-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-200 text-xs text-neutral-500">
              <th className="p-3 font-medium">ID</th>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Roles</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-neutral-100">
                <td className="p-3">
                  <span className="text-sm text-neutral-500">#{u.id}</span>
                </td>
                <td className="p-3">
                  <div className="text-sm text-neutral-900">{u.name || "N/A"}</div>
                  <div className="text-xs text-neutral-400">{u.username || "N/A"}</div>
                </td>
                <td className="p-3 text-sm text-neutral-500">{u.email || "N/A"}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {ROLES.map((role) => {
                      const active = u.roles.includes(role);
                      return (
                        <button
                          key={role}
                          onClick={() => onRoleToggle(u.id, role, u.roles)}
                          className={`px-2 py-0.5 text-xs border ${
                            active
                              ? "border-sage bg-sage text-neutral-900 font-semibold"
                              : "border-neutral-300 text-neutral-500"
                          }`}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-neutral-400 text-sm">
                  No users.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
