"use client";
import { useState } from "react";
import { Download, Trash2 } from "lucide-react";
import { AttendanceBlockType } from "./types";

const BLOCK_TYPES = ["8A", "8B"];

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AttendanceTab({
  blocks,
  onCreateBlock,
  onDeleteBlock,
  onExportCSV,
}: {
  blocks: AttendanceBlockType[];
  onCreateBlock: (type: string, date: string, code: string) => Promise<void>;
  onDeleteBlock: (id: number) => void;
  onExportCSV: (id?: number) => void;
}) {
  const [type, setType] = useState("8B");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!code.trim()) {
      setErr("Code is required");
      return;
    }
    await onCreateBlock(type, date, code.trim());
    setCode("");
  };

  return (
    <div className="space-y-6">
      <div className="border border-neutral-200 p-4">
        <h2 className="text-sm font-medium text-neutral-900 mb-3">Create Block</h2>
        <form onSubmit={submit} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border border-neutral-300 px-2 py-1.5 text-sm"
            >
              {BLOCK_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code…"
              className="border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </div>
          <button type="submit" className="px-3 py-1.5 text-sm font-semibold bg-sage text-neutral-900">
            Create
          </button>
        </form>
        {err && <p className="text-red-500 text-xs mt-2">{err}</p>}
      </div>

      <div className="border border-neutral-200">
        <div className="p-3 border-b border-neutral-200 flex justify-between items-center">
          <h2 className="text-sm font-medium text-neutral-900">Blocks</h2>
          <button
            onClick={() => onExportCSV()}
            className="flex items-center gap-1 px-2 py-1 text-xs border border-neutral-300 text-neutral-600 hover:border-sage"
          >
            <Download className="w-3 h-3" /> Export All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-200 text-xs text-neutral-500">
                <th className="p-3 font-medium">Type</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Code</th>
                <th className="p-3 font-medium">Present</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map((b) => (
                <tr key={b.id} className="border-b border-neutral-100">
                  <td className="p-3 text-sm text-neutral-900">{b.blockType}</td>
                  <td className="p-3 text-sm text-neutral-500">{fmtDate(b.date)}</td>
                  <td className="p-3 text-sm font-mono text-neutral-600">{b.code}</td>
                  <td className="p-3 text-sm">{b._count?.records || 0}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onExportCSV(b.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs border border-neutral-300 text-neutral-600 hover:border-sage"
                      >
                        <Download className="w-3 h-3" /> CSV
                      </button>
                      <button
                        onClick={() => onDeleteBlock(b.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs border border-neutral-300 text-red-500 hover:border-red-400"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {blocks.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-400 text-sm">
                    No blocks created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
