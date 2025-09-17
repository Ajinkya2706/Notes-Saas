"use client";
import React, { useEffect, useState } from "react";

// Removed unused Note type
type FullNote = { _id: string; title: string; content: string; category?: string; createdByEmail?: string };

export default function DashboardPage() {
  const [notes, setNotes] = useState<FullNote[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<string>("");
  const [openNote, setOpenNote] = useState<FullNote | null>(null);
  const [tenant, setTenant] = useState<{ slug: string; plan: string; name: string } | null>(null);
  const [role, setRole] = useState<string | null>(null);

  function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` } as HeadersInit;
  }

  async function loadNotes() {
    const res = await fetch("/api/notes", { headers: getAuthHeaders() });
    const data = await res.json();
    if (res.ok) setNotes(data.notes || []);
  }

  async function createNote(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ title, content, category: category || undefined }),
    });
    if (res.status === 402) {
      alert("Free plan limit reached. Upgrade to Pro.");
      return;
    }
    if (res.ok) {
      setTitle("");
      setContent("");
      await loadNotes();
      await refreshTenant();
    }
  }

  async function deleteNote(id: string) {
    const res = await fetch(`/api/notes/${id}`, { method: "DELETE", headers: getAuthHeaders() });
    if (res.ok) loadNotes();
  }

  async function refreshTenant() {
    const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setTenant(data.tenant);
      setRole(data.role);
      localStorage.setItem("tenant", JSON.stringify(data.tenant));
      localStorage.setItem("role", data.role);
    }
  }

  async function upgrade() {
    if (!tenant) return;
    const res = await fetch(`/api/tenants/${tenant.slug}/upgrade`, { method: "POST", headers: getAuthHeaders() });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("tenant", JSON.stringify(data.tenant));
      await refreshTenant();
    }
  }

  async function invite(email: string, role: string = "member") {
    if (!tenant) return;
    const res = await fetch(`/api/tenants/${tenant.slug}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ email, role })
    });
    if (res.ok) alert("Invited successfully (password: password)");
    else {
      const j = await res.json();
      alert(j?.error || "Invite failed");
    }
  }

  function logout() {
    localStorage.clear();
    window.location.href = "/login";
  }

useEffect(() => {
  refreshTenant();
  loadNotes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const atLimit = tenant?.plan === "free" && notes.length >= 3;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl p-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold">Notes</h1>
            <p className="text-xs text-gray-500">{tenant?.name} · Plan: {tenant?.plan}</p>
          </div>
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <button onClick={upgrade} className="px-3 py-2 bg-white text-black rounded">Upgrade</button>
                <button onClick={() => { const email = prompt("Invite user email"); if (email) invite(email); }} className="px-3 py-2 border border-gray-800 rounded">Invite</button>
              </>
            )}
            <button onClick={logout} className="px-3 py-2 border border-gray-800 rounded">Logout</button>
          </div>
        </div>

        {atLimit && role === "admin" && (
          <div className="border border-gray-800 rounded-xl p-4 text-sm text-gray-300 mb-6">Free plan limit reached. Upgrade for unlimited notes.</div>
        )}

        {/* Toolbar */}
        <div className="mb-4 flex items-center gap-3 text-sm">
          <button onClick={() => setCategory("")} className={`px-2 py-1 rounded border ${category? 'border-gray-900 text-gray-500':'border-gray-800 bg-black'}`}>All Notes</button>
          
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Notes + Composer */}
          <div className="lg:col-span-3 space-y-4">
            <form onSubmit={createNote} className="bg-black border border-gray-800 rounded-xl p-4 space-y-3">
              <div className="flex gap-2">
                <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="New Note title" className="flex-1 border border-gray-800 bg-black text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-700" />
                <button disabled={atLimit} className="bg-white text-black px-4 rounded">Add</button>
              </div>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content (optional)" className="w-full border border-gray-800 bg-black text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-gray-700" />
              {atLimit && <p className="text-sm text-red-500">Free plan limit reached. Upgrade for unlimited notes.</p>}
            </form>

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {notes.filter(n => !category || n.category === category).map((n) => (
            <div key={n._id} className="bg-black border border-gray-800 rounded-xl p-4 flex flex-col gap-2 hover:border-gray-600 transition" onClick={() => setOpenNote(n)}>
              <div className="flex items-center justify-between">
                <p className="font-medium text-white">{n.title}</p>
                {n.category && <span className="text-xs text-gray-500 border border-gray-800 px-2 py-1 rounded">{n.category}</span>}
              </div>
              {n.content && <p className="text-sm text-gray-400 line-clamp-4">{n.content}</p>}
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-gray-600">by {(n.createdByEmail === 'admin@acme.test') ? 'Admin' : (n.createdByEmail === 'user@acme.test') ? 'User' : (n.createdByEmail || 'user')}</span>
                <button onClick={(e) => { e.stopPropagation(); deleteNote(n._id); }} className="text-red-500">Delete</button>
              </div>
            </div>
          ))}
              {notes.filter(n => !category || n.category === category).length === 0 && (
                <div className="border border-dashed border-gray-800 rounded-xl p-6 text-center">
                  <p className="text-gray-400 mb-3">No notes in {category || 'this view'}.</p>
                  <button onClick={() => setTitle(category ? `${category} note` : 'Untitled')} className="px-4 py-2 bg-white text-black rounded">Add note</button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-3">
            <div className="border border-gray-800 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2 text-sm text-gray-400"><span>Notebooks</span><span>All</span></div>
              <div className="space-y-2 text-sm">
                {['Shopping','Recipes','Thoughts','Books','Work'].map(x => (
                  <button key={x} onClick={() => setCategory(prev => prev === x ? "" : x)} className={`w-full flex items-center justify-between px-2 py-2 rounded border border-transparent hover:border-gray-800 transition text-left ${category===x? 'bg-gray-900/60':''}`}>
                    <span className="text-gray-300">{x}</span>
                    <span className="text-gray-600">›</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {openNote && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-[10%]" onClick={() => setOpenNote(null)}>
          <div className="w-full h-full bg-black border border-gray-800 rounded-2xl p-6 relative overflow-auto" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 border border-gray-800 px-3 py-1 rounded" onClick={() => setOpenNote(null)}>Close</button>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-semibold">{openNote.title}</h2>
              {openNote.category && <span className="text-xs text-gray-500 border border-gray-800 px-2 py-1 rounded">{openNote.category}</span>}
            </div>
            <p className="text-xs text-gray-600 mb-4">by {openNote.createdByEmail || 'user'}</p>
            <p className="whitespace-pre-wrap text-gray-300">{openNote.content}</p>
          </div>
        </div>
      )}
    </div>
  );
}


