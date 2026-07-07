import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard, Users, Megaphone, BarChart3, Settings as SettingsIcon,
  Search, Plus, Phone, MessageCircle, Mail, MapPin, Tag, Clock, X,
  ChevronLeft, Filter, Download, Sun, Moon, LogOut, Bell, AlertCircle,
  CheckCircle2, Calendar, Edit3, Trash2, Lock, Building2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";

const STATUSES = [
  { name: "New Lead", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { name: "Not Contacted", color: "bg-slate-100 text-slate-600 border-slate-200" },
  { name: "Called Once", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  { name: "Follow Up", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { name: "Interested", color: "bg-teal-100 text-teal-700 border-teal-200" },
  { name: "Meeting Scheduled", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { name: "Proposal Sent", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  { name: "Negotiation", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { name: "Need Time", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { name: "Not Interested", color: "bg-rose-100 text-rose-700 border-rose-200" },
  { name: "Closed Won", color: "bg-green-100 text-green-700 border-green-200" },
  { name: "Closed Lost", color: "bg-red-100 text-red-700 border-red-200" },
];
const LEAD_SOURCES = ["Meta Ads", "Google Ads", "Website", "WhatsApp", "Referral", "Organic"];
const PRIORITIES = ["Low", "Medium", "High"];
const COMM_TYPES = ["Call", "WhatsApp", "Meeting", "Email"];

const uid = () => Math.random().toString(36).slice(2, 10);
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—");
const statusMeta = (s) => STATUSES.find((x) => x.name === s) || STATUSES[0];

function emptyLead() {
  return {
    id: uid(), campaignName: "", leadSource: "Meta Ads", clientName: "", businessName: "",
    phone: "", whatsapp: "", email: "", location: "", serviceInterested: "", budget: "",
    priority: "Medium", status: "New Lead", currentSituation: "", firstContactDate: todayStr(),
    assignedTo: "", expectedClosingDate: "", tags: [], notes: [], followUps: [], createdAt: Date.now(),
  };
}

const SEED = [
  { ...emptyLead(), campaignName: "Monsoon Sale - Kochi", leadSource: "Meta Ads", clientName: "Anjali Menon", businessName: "Anjali Boutique", phone: "+919876543210", whatsapp: "+919876543210", email: "anjali@example.com", location: "Kochi", serviceInterested: "Social Media Management", budget: "₹15,000/mo", priority: "High", status: "Follow Up", currentSituation: "Asked for pricing comparison", assignedTo: "Akhil", expectedClosingDate: "2026-07-20", tags: ["hot", "boutique"], notes: [{ id: uid(), date: todayStr(), time: "10:00", author: "Akhil", text: "Very responsive, wants a quick call this week." }], followUps: [{ id: uid(), date: todayStr(), time: "11:30", callNumber: 2, communicationType: "Call", clientResponse: "Asked for callback tomorrow", myNotes: "Send pricing sheet before call", nextFollowUpDate: todayStr(), reminderTime: "11:00", reminderStatus: "Pending" }] },
  { ...emptyLead(), campaignName: "Lead Gen - Real Estate", leadSource: "Google Ads", clientName: "Rahul Nair", businessName: "Nair Properties", phone: "+919845012345", whatsapp: "+919845012345", email: "rahul@example.com", location: "Ernakulam", serviceInterested: "Google Ads", budget: "₹25,000/mo", priority: "Medium", status: "Proposal Sent", currentSituation: "Reviewing proposal internally", assignedTo: "Akhil", expectedClosingDate: "2026-07-15", tags: ["proposal"], notes: [], followUps: [{ id: uid(), date: todayStr(), time: "09:00", callNumber: 3, communicationType: "Email", clientResponse: "Will revert by Friday", myNotes: "Follow up Friday afternoon", nextFollowUpDate: "2026-07-11", reminderTime: "10:00", reminderStatus: "Pending" }] },
];

export default function App() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState(null);
  const [settings, setSettings] = useState({ agencyName: "My Agency", passcode: "", theme: "light" });
  const [leads, setLeads] = useState([]);
  const [view, setView] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", source: "", priority: "" });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [passInput, setPassInput] = useState("");
  const [authErr, setAuthErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const s = await window.storage.get("crm-settings");
        if (s?.value) setSettings(JSON.parse(s.value));
      } catch (e) {}
      try {
        const l = await window.storage.get("crm-leads");
        if (l?.value) setLeads(JSON.parse(l.value));
        else setLeads(SEED);
      } catch (e) {
        setLeads(SEED);
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.storage.set("crm-leads", JSON.stringify(leads)).catch(() => {});
  }, [leads, ready]);

  useEffect(() => {
    if (!ready) return;
    window.storage.set("crm-settings", JSON.stringify(settings)).catch(() => {});
  }, [settings, ready]);

  const dark = settings.theme === "dark";

  function saveLead(lead) {
    setLeads((prev) => {
      const exists = prev.some((l) => l.id === lead.id);
      return exists ? prev.map((l) => (l.id === lead.id ? lead : l)) : [lead, ...prev];
    });
    setShowForm(false);
    setEditing(null);
  }
  function deleteLead(id) {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    if (selectedId === id) { setSelectedId(null); setView("leads"); }
  }
  function addFollowUp(leadId, fu) {
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, followUps: [{ ...fu, id: uid(), callNumber: (l.followUps?.length || 0) + 1 }, ...(l.followUps || [])] } : l));
  }
  function addNote(leadId, text) {
    setLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, notes: [{ id: uid(), date: todayStr(), time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }), author: session?.name || "Me", text }, ...(l.notes || [])] } : l));
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (filters.status && l.status !== filters.status) return false;
      if (filters.source && l.leadSource !== filters.source) return false;
      if (filters.priority && l.priority !== filters.priority) return false;
      if (!q) return true;
      return [l.clientName, l.businessName, l.phone, l.campaignName, l.serviceInterested, l.status, l.location]
        .join(" ").toLowerCase().includes(q);
    });
  }, [leads, search, filters]);

  if (!ready) return <div className="flex items-center justify-center h-full min-h-[400px] text-slate-400">Loading…</div>;

  if (!session) {
    return <LoginScreen settings={settings} setSettings={setSettings} passInput={passInput} setPassInput={setPassInput}
      authErr={authErr} setAuthErr={setAuthErr} onLogin={(name) => setSession({ name })} />;
  }

  const selectedLead = leads.find((l) => l.id === selectedId);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-[700px] flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <Sidebar view={view} setView={(v) => { setView(v); setSelectedId(null); }} agencyName={settings.agencyName} />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar search={search} setSearch={setSearch} dark={dark}
            toggleDark={() => setSettings((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }))}
            onAdd={() => { setEditing(emptyLead()); setShowForm(true); }}
            onLogout={() => setSession(null)} name={session.name} />
          <div className="flex-1 overflow-y-auto p-5">
            {view === "dashboard" && <Dashboard leads={leads} onOpenLead={(id) => { setSelectedId(id); setView("leads"); }} />}
            {view === "leads" && !selectedLead && (
              <LeadsList leads={filtered} filters={filters} setFilters={setFilters}
                onOpen={(id) => setSelectedId(id)} onEdit={(l) => { setEditing(l); setShowForm(true); }}
                onDelete={deleteLead} onExport={() => exportCSV(filtered)} />
            )}
            {view === "leads" && selectedLead && (
              <LeadDetail lead={selectedLead} onBack={() => setSelectedId(null)}
                onEdit={() => { setEditing(selectedLead); setShowForm(true); }}
                onAddFollowUp={(fu) => addFollowUp(selectedLead.id, fu)}
                onAddNote={(t) => addNote(selectedLead.id, t)} />
            )}
            {view === "campaigns" && <Campaigns leads={leads} />}
            {view === "analytics" && <Analytics leads={leads} />}
            {view === "settings" && <SettingsView settings={settings} setSettings={setSettings} leads={leads} />}
          </div>
        </div>
      </div>
      {showForm && (
        <LeadFormModal lead={editing} onSave={saveLead} onClose={() => { setShowForm(false); setEditing(null); }} />
      )}
    </div>
  );
}

function LoginScreen({ settings, setSettings, passInput, setPassInput, authErr, setAuthErr, onLogin }) {
  const [name, setName] = useState("");
  const firstRun = !settings.passcode;
  function handleSubmit() {
    if (firstRun) {
      if (!passInput || passInput.length < 4) { setAuthErr("Choose a passcode with at least 4 characters."); return; }
      setSettings((s) => ({ ...s, passcode: passInput, agencyName: name || s.agencyName || "My Agency" }));
      onLogin(name || "Admin");
    } else {
      if (passInput !== settings.passcode) { setAuthErr("Incorrect passcode."); return; }
      onLogin(name || "Admin");
    }
  }
  return (
    <div className="min-h-[700px] flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
          <Lock size={20} className="text-white" />
        </div>
        <h1 className="text-lg font-semibold text-slate-900">{firstRun ? "Set up your CRM" : "Welcome back"}</h1>
        <p className="text-sm text-slate-500 mt-1 mb-5">{firstRun ? "Create a local passcode to lock this workspace." : "Enter your passcode to continue."}</p>
        <div className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="password" value={passInput} onChange={(e) => { setPassInput(e.target.value); setAuthErr(""); }}
            placeholder={firstRun ? "Create passcode" : "Passcode"}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {authErr && <p className="text-xs text-red-600">{authErr}</p>}
          <button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg transition">
            {firstRun ? "Create workspace" : "Log in"}
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">This is a local passcode lock for this demo workspace, not production-grade authentication.</p>
      </div>
    </div>
  );
}

function Sidebar({ view, setView, agencyName }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "leads", label: "Leads", icon: Users },
    { id: "campaigns", label: "Campaigns", icon: Megaphone },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];
  return (
    <div className="w-56 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-3 shrink-0">
      <div className="flex items-center gap-2 px-2 py-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><Building2 size={16} className="text-white" /></div>
        <span className="font-semibold text-sm truncate">{agencyName || "My Agency"}</span>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((it) => (
          <button key={it.id} onClick={() => setView(it.id)}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${view === it.id ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
            <it.icon size={16} /> {it.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function TopBar({ search, setSearch, dark, toggleDark, onAdd, onLogout, name }) {
  return (
    <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3 px-4 shrink-0">
      <div className="relative flex-1 max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads, phone, campaign, status…"
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <button onClick={onAdd} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition">
        <Plus size={15} /> Add Lead
      </button>
      <button onClick={toggleDark} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
        <span className="text-sm text-slate-500 hidden sm:inline">{name}</span>
        <button onClick={onLogout} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><LogOut size={16} /></button>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone = "slate" }) {
  const tones = {
    slate: "text-slate-900 dark:text-white", blue: "text-blue-600", green: "text-green-600",
    amber: "text-amber-600", red: "text-red-600", purple: "text-purple-600",
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${tones[tone]}`}>{value}</p>
    </div>
  );
}

function Dashboard({ leads, onOpenLead }) {
  const total = leads.length;
  const count = (s) => leads.filter((l) => l.status === s).length;
  const contacted = leads.filter((l) => !["New Lead", "Not Contacted"].includes(l.status)).length;
  const won = count("Closed Won");
  const conv = total ? ((won / total) * 100).toFixed(1) : "0.0";
  const today = todayStr();

  const dueLists = leads.flatMap((l) => (l.followUps || []).filter((f) => f.reminderStatus !== "Done").map((f) => ({ ...f, lead: l })));
  const todays = dueLists.filter((f) => f.nextFollowUpDate === today);
  const overdue = dueLists.filter((f) => f.nextFollowUpDate && f.nextFollowUpDate < today);
  const upcoming = dueLists.filter((f) => f.nextFollowUpDate > today).sort((a, b) => a.nextFollowUpDate.localeCompare(b.nextFollowUpDate)).slice(0, 8);

  const recent = leads.flatMap((l) => [
    ...(l.followUps || []).map((f) => ({ type: "Follow-up", date: f.date, text: `${f.communicationType} with ${l.clientName}: ${f.clientResponse || "—"}`, leadId: l.id })),
    ...(l.notes || []).map((n) => ({ type: "Note", date: n.date, text: `Note on ${l.clientName}: ${n.text}`, leadId: l.id })),
  ]).sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 8);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Leads" value={total} />
        <StatCard label="New Leads" value={count("New Lead")} tone="blue" />
        <StatCard label="Contacted" value={contacted} />
        <StatCard label="Follow Up" value={count("Follow Up")} tone="amber" />
        <StatCard label="Proposal Sent" value={count("Proposal Sent")} />
        <StatCard label="Negotiation" value={count("Negotiation")} tone="purple" />
        <StatCard label="Closed Won" value={won} tone="green" />
        <StatCard label="Closed Lost" value={count("Closed Lost")} tone="red" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle2 size={20} /></div>
        <div><p className="text-xs text-slate-500">Conversion Rate</p><p className="text-xl font-semibold">{conv}%</p></div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <ReminderCol title="Today's Follow-ups" icon={Calendar} items={todays} onOpenLead={onOpenLead} empty="Nothing due today." tone="blue" />
        <ReminderCol title="Overdue" icon={AlertCircle} items={overdue} onOpenLead={onOpenLead} empty="No overdue follow-ups." tone="red" />
        <ReminderCol title="Upcoming" icon={Clock} items={upcoming} onOpenLead={onOpenLead} empty="Nothing scheduled." tone="slate" />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
        {recent.length === 0 && <p className="text-sm text-slate-400">No activity yet.</p>}
        <div className="space-y-2.5">
          {recent.map((r, i) => (
            <button key={i} onClick={() => onOpenLead(r.leadId)} className="w-full text-left flex items-start gap-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg p-1.5 -mx-1.5">
              <span className="text-[10px] mt-0.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">{r.type}</span>
              <span className="truncate text-slate-700 dark:text-slate-300">{r.text}</span>
              <span className="text-slate-400 text-xs ml-auto shrink-0">{fmtDate(r.date)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReminderCol({ title, icon: Icon, items, onOpenLead, empty, tone }) {
  const tones = { blue: "text-blue-600 bg-blue-50", red: "text-red-600 bg-red-50", slate: "text-slate-600 bg-slate-100" };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tones[tone]}`}><Icon size={14} /></div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="ml-auto text-xs text-slate-400">{items.length}</span>
      </div>
      {items.length === 0 && <p className="text-xs text-slate-400">{empty}</p>}
      <div className="space-y-2">
        {items.map((f, i) => (
          <button key={i} onClick={() => onOpenLead(f.lead.id)} className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm">
            <p className="font-medium truncate">{f.lead.clientName} <span className="text-slate-400 text-xs">· {f.lead.businessName}</span></p>
            <p className="text-xs text-slate-500">{fmtDate(f.nextFollowUpDate)} {f.reminderTime && `at ${f.reminderTime}`}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Badge({ status }) {
  const m = statusMeta(status);
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${m.color}`}>{status}</span>;
}
function PriorityDot({ priority }) {
  const c = priority === "High" ? "bg-red-500" : priority === "Medium" ? "bg-amber-500" : "bg-slate-400";
  return <span className={`inline-block w-2 h-2 rounded-full ${c}`} title={priority} />;
}

function LeadsList({ leads, filters, setFilters, onOpen, onEdit, onDelete, onExport }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={14} className="text-slate-400" />
        <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 dark:border-slate-700">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
        </select>
        <select value={filters.source} onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))} className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 dark:border-slate-700">
          <option value="">All Sources</option>
          {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))} className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 dark:border-slate-700">
          <option value="">All Priorities</option>
          {PRIORITIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={onExport} className="ml-auto flex items-center gap-1.5 text-sm border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {leads.length === 0 && <p className="p-6 text-sm text-slate-400">No leads match your search/filters.</p>}
          {leads.map((l) => (
            <div key={l.id} className="flex items-center gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 group">
              <button onClick={() => onOpen(l.id)} className="flex-1 flex items-center gap-3 text-left min-w-0">
                <PriorityDot priority={l.priority} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{l.clientName || "Unnamed"} <span className="text-slate-400 font-normal">· {l.businessName}</span></p>
                  <p className="text-xs text-slate-500 truncate">{l.campaignName} · {l.leadSource} · {l.location}</p>
                </div>
              </button>
              <Badge status={l.status} />
              <span className="text-xs text-slate-400 w-20 shrink-0 hidden sm:inline">{fmtDate(l.firstContactDate)}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                <a href={`tel:${l.phone}`} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"><Phone size={14} /></a>
                <a href={`https://wa.me/${(l.whatsapp || l.phone || "").replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-green-600"><MessageCircle size={14} /></a>
                <button onClick={() => onEdit(l)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"><Edit3 size={14} /></button>
                <button onClick={() => onDelete(l.id)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LeadDetail({ lead, onBack, onEdit, onAddFollowUp, onAddNote }) {
  const [tab, setTab] = useState("timeline");
  const [fu, setFu] = useState({ date: todayStr(), time: "", communicationType: "Call", clientResponse: "", myNotes: "", nextFollowUpDate: "", reminderTime: "", reminderStatus: "Pending" });
  const [noteText, setNoteText] = useState("");

  const timeline = [
    ...(lead.followUps || []).map((f) => ({ kind: "followup", ...f })),
    ...(lead.notes || []).map((n) => ({ kind: "note", ...n })),
  ].sort((a, b) => `${b.date}${b.time || ""}`.localeCompare(`${a.date}${a.time || ""}`));

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white"><ChevronLeft size={15} /> Back to leads</button>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold">{lead.clientName}</h2>
              <PriorityDot priority={lead.priority} />
              <Badge status={lead.status} />
            </div>
            <p className="text-sm text-slate-500">{lead.businessName} · {lead.campaignName} · {lead.leadSource}</p>
          </div>
          <div className="flex items-center gap-2">
            <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-sm border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"><Phone size={14} /> Call</a>
            <a href={`https://wa.me/${(lead.whatsapp || lead.phone || "").replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-green-50 text-green-700"><MessageCircle size={14} /> WhatsApp</a>
            <button onClick={onEdit} className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg"><Edit3 size={14} /> Edit</button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 text-sm">
          <Info label="Phone" value={lead.phone} icon={Phone} />
          <Info label="Email" value={lead.email} icon={Mail} />
          <Info label="Location" value={lead.location} icon={MapPin} />
          <Info label="Service" value={lead.serviceInterested} />
          <Info label="Budget" value={lead.budget} />
          <Info label="Assigned To" value={lead.assignedTo} />
          <Info label="First Contact" value={fmtDate(lead.firstContactDate)} />
          <Info label="Expected Closing" value={fmtDate(lead.expectedClosingDate)} />
        </div>
        {lead.tags?.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3">
            <Tag size={13} className="text-slate-400" />
            {lead.tags.map((t, i) => <span key={i} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">{t}</span>)}
          </div>
        )}
        {lead.currentSituation && <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 bg-slate-50 dark:bg-slate-800 rounded-lg p-2.5">{lead.currentSituation}</p>}
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {["timeline", "callhistory", "notes", "files"].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`text-sm font-medium px-3 py-2 border-b-2 -mb-px ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500"}`}>
            {t === "timeline" ? "Timeline" : t === "callhistory" ? "Call History" : t === "notes" ? "Notes" : "Files"}
          </button>
        ))}
      </div>

      {tab === "timeline" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <h3 className="text-sm font-semibold mb-3">Log a Follow-up</h3>
            <div className="grid md:grid-cols-3 gap-2">
              <input type="date" value={fu.date} onChange={(e) => setFu({ ...fu, date: e.target.value })} className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg px-2 py-1.5 text-sm" />
              <input type="time" value={fu.time} onChange={(e) => setFu({ ...fu, time: e.target.value })} className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg px-2 py-1.5 text-sm" />
              <select value={fu.communicationType} onChange={(e) => setFu({ ...fu, communicationType: e.target.value })} className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg px-2 py-1.5 text-sm">
                {COMM_TYPES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input placeholder="Client response" value={fu.clientResponse} onChange={(e) => setFu({ ...fu, clientResponse: e.target.value })} className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg px-2 py-1.5 text-sm md:col-span-3" />
              <input placeholder="My notes" value={fu.myNotes} onChange={(e) => setFu({ ...fu, myNotes: e.target.value })} className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg px-2 py-1.5 text-sm md:col-span-3" />
              <input type="date" placeholder="Next follow-up date" value={fu.nextFollowUpDate} onChange={(e) => setFu({ ...fu, nextFollowUpDate: e.target.value })} className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg px-2 py-1.5 text-sm" />
              <input type="time" placeholder="Reminder time" value={fu.reminderTime} onChange={(e) => setFu({ ...fu, reminderTime: e.target.value })} className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg px-2 py-1.5 text-sm" />
              <button onClick={() => { if (!fu.clientResponse && !fu.myNotes) return; onAddFollowUp(fu); setFu({ date: todayStr(), time: "", communicationType: "Call", clientResponse: "", myNotes: "", nextFollowUpDate: "", reminderTime: "", reminderStatus: "Pending" }); }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg py-1.5">Add Follow-up</button>
            </div>
          </div>

          <div className="space-y-3">
            {timeline.length === 0 && <p className="text-sm text-slate-400">No activity logged yet.</p>}
            {timeline.map((t, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${t.kind === "note" ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-600"}`}>
                  {t.kind === "note" ? <Edit3 size={14} /> : <Phone size={14} />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm">
                    {t.kind === "note" ? <><span className="font-medium">Note</span> by {t.author}</> : <><span className="font-medium">{t.communicationType} #{t.callNumber}</span> — {t.clientResponse || "No response logged"}</>}
                  </p>
                  {t.kind === "followup" && t.myNotes && <p className="text-xs text-slate-500 mt-0.5">{t.myNotes}</p>}
                  {t.kind === "note" && <p className="text-xs text-slate-500 mt-0.5">{t.text}</p>}
                  <p className="text-xs text-slate-400 mt-1">{fmtDate(t.date)} {t.time && `· ${t.time}`}{t.nextFollowUpDate && ` · Next: ${fmtDate(t.nextFollowUpDate)}`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "callhistory" && (
        <div className="space-y-2">
          {(lead.followUps || []).length === 0 && <p className="text-sm text-slate-400">No calls logged yet.</p>}
          {(lead.followUps || []).map((f, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex items-center gap-3 text-sm">
              <span className="font-medium w-16 shrink-0">Call #{f.callNumber}</span>
              <span className="text-slate-600 dark:text-slate-400 flex-1 truncate">{f.clientResponse || "—"}</span>
              <span className="text-xs text-slate-400 shrink-0">{fmtDate(f.date)}</span>
            </div>
          ))}
        </div>
      )}

      {tab === "notes" && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note…"
              onKeyDown={(e) => { if (e.key === "Enter" && noteText.trim()) { onAddNote(noteText.trim()); setNoteText(""); } }}
              className="flex-1 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm" />
            <button onClick={() => { if (noteText.trim()) { onAddNote(noteText.trim()); setNoteText(""); } }} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 rounded-lg">Add</button>
          </div>
          {(lead.notes || []).map((n) => (
            <div key={n.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-sm">
              <p>{n.text}</p>
              <p className="text-xs text-slate-400 mt-1">{n.author} · {fmtDate(n.date)} {n.time}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "files" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 text-sm text-slate-400 text-center">
          File uploads (quotations, proposals, images, voice notes) need real server storage, which isn't available in this artifact environment.
        </div>
      )}
    </div>
  );
}

function Info({ label, value, icon: Icon }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2.5">
      <p className="text-[11px] text-slate-400 flex items-center gap-1">{Icon && <Icon size={11} />} {label}</p>
      <p className="font-medium truncate">{value || "—"}</p>
    </div>
  );
}

function Campaigns({ leads }) {
  const groups = useMemo(() => {
    const map = {};
    leads.forEach((l) => {
      const key = l.campaignName || "Uncategorized";
      if (!map[key]) map[key] = [];
      map[key].push(l);
    });
    return Object.entries(map).map(([name, ls]) => ({
      name, total: ls.length,
      interested: ls.filter((l) => ["Interested", "Meeting Scheduled", "Proposal Sent", "Negotiation"].includes(l.status)).length,
      followUps: ls.reduce((a, l) => a + (l.followUps?.length || 0), 0),
      closed: ls.filter((l) => l.status === "Closed Won").length,
    })).sort((a, b) => b.total - a.total);
  }, [leads]);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {groups.length === 0 && <p className="text-sm text-slate-400">No campaigns yet.</p>}
      {groups.map((g) => (
        <div key={g.name} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <h3 className="font-semibold mb-3 truncate">{g.name}</h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div><p className="text-lg font-semibold">{g.total}</p><p className="text-[11px] text-slate-400">Leads</p></div>
            <div><p className="text-lg font-semibold text-teal-600">{g.interested}</p><p className="text-[11px] text-slate-400">Interested</p></div>
            <div><p className="text-lg font-semibold text-amber-600">{g.followUps}</p><p className="text-[11px] text-slate-400">Follow-ups</p></div>
            <div><p className="text-lg font-semibold text-green-600">{g.closed}</p><p className="text-[11px] text-slate-400">Closed</p></div>
          </div>
          <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: `${g.total ? (g.closed / g.total) * 100 : 0}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-1">{g.total ? ((g.closed / g.total) * 100).toFixed(1) : "0.0"}% conversion</p>
        </div>
      ))}
    </div>
  );
}

const PIE_COLORS = ["#2563eb", "#0d9488", "#f59e0b", "#dc2626", "#7c3aed", "#0891b2"];

function Analytics({ leads }) {
  const bySource = LEAD_SOURCES.map((s) => ({ name: s, value: leads.filter((l) => l.leadSource === s).length })).filter((d) => d.value > 0);
  const byStatus = STATUSES.map((s) => ({ name: s.name, value: leads.filter((l) => l.status === s.name).length })).filter((d) => d.value > 0);
  const byDay = useMemo(() => {
    const map = {};
    leads.forEach((l) => { const d = (l.firstContactDate || "").slice(0, 10); if (d) map[d] = (map[d] || 0) + 1; });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count }));
  }, [leads]);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <ChartCard title="Leads Over Time">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={byDay}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="date" fontSize={11} /><YAxis fontSize={11} allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={false} /></LineChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Leads by Source">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={bySource}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} /></BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Pipeline by Status">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart><Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={85} label={({ name }) => name}>{byStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip /></PieChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Best Performing Campaign">
        <BestCampaign leads={leads} />
      </ChartCard>
    </div>
  );
}
function ChartCard({ title, children }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}
function BestCampaign({ leads }) {
  const map = {};
  leads.forEach((l) => { const k = l.campaignName || "Uncategorized"; map[k] = map[k] || { total: 0, won: 0 }; map[k].total++; if (l.status === "Closed Won") map[k].won++; });
  const best = Object.entries(map).map(([name, v]) => ({ name, ...v, rate: v.total ? v.won / v.total : 0 })).sort((a, b) => b.rate - a.rate)[0];
  if (!best) return <p className="text-sm text-slate-400">Not enough data yet.</p>;
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Megaphone size={22} /></div>
      <div>
        <p className="font-semibold">{best.name}</p>
        <p className="text-sm text-slate-500">{best.won} closed won out of {best.total} leads · {(best.rate * 100).toFixed(1)}% conversion</p>
      </div>
    </div>
  );
}

function SettingsView({ settings, setSettings, leads }) {
  const [agencyName, setAgencyName] = useState(settings.agencyName);
  return (
    <div className="max-w-lg space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-semibold">Agency</h3>
        <input value={agencyName} onChange={(e) => setAgencyName(e.target.value)} onBlur={() => setSettings((s) => ({ ...s, agencyName }))}
          className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg px-3 py-2 text-sm" placeholder="Agency name" />
        <p className="text-xs text-slate-400">Logo upload isn't available without server storage — you can still set your agency name above.</p>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex items-center justify-between">
        <div><h3 className="text-sm font-semibold">Theme</h3><p className="text-xs text-slate-400">Toggle light / dark mode</p></div>
        <button onClick={() => setSettings((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }))} className="border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-sm">
          {settings.theme === "dark" ? "Dark" : "Light"}
        </button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-2">
        <h3 className="text-sm font-semibold">Backup</h3>
        <p className="text-xs text-slate-400">Download a full JSON backup of every lead, note and follow-up.</p>
        <button onClick={() => downloadFile("crm-backup.json", JSON.stringify(leads, null, 2), "application/json")}
          className="flex items-center gap-1.5 text-sm border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"><Download size={14} /> Download backup</button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-1">Users</h3>
        <p className="text-xs text-slate-400">This demo is single-user. Multi-user roles/permissions need a real backend with proper authentication.</p>
      </div>
    </div>
  );
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
function exportCSV(leads) {
  const cols = ["clientName", "businessName", "phone", "whatsapp", "email", "campaignName", "leadSource", "location", "serviceInterested", "budget", "priority", "status", "firstContactDate", "assignedTo", "expectedClosingDate"];
  const rows = [cols.join(",")].concat(leads.map((l) => cols.map((c) => `"${String(l[c] ?? "").replace(/"/g, '""')}"`).join(",")));
  downloadFile("leads.csv", rows.join("\n"), "text/csv");
}

function LeadFormModal({ lead, onSave, onClose }) {
  const [form, setForm] = useState(lead);
  const [tagInput, setTagInput] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900">
          <h3 className="font-semibold">{form.clientName ? "Edit Lead" : "Add Lead"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={16} /></button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3 text-sm">
          <Field label="Campaign Name"><input className="input" value={form.campaignName} onChange={(e) => set("campaignName", e.target.value)} /></Field>
          <Field label="Lead Source"><select className="input" value={form.leadSource} onChange={(e) => set("leadSource", e.target.value)}>{LEAD_SOURCES.map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Client Name"><input className="input" value={form.clientName} onChange={(e) => set("clientName", e.target.value)} /></Field>
          <Field label="Business Name"><input className="input" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} /></Field>
          <Field label="Phone Number"><input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
          <Field label="WhatsApp Number"><input className="input" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
          <Field label="Email"><input className="input" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="Location"><input className="input" value={form.location} onChange={(e) => set("location", e.target.value)} /></Field>
          <Field label="Service Interested"><input className="input" value={form.serviceInterested} onChange={(e) => set("serviceInterested", e.target.value)} /></Field>
          <Field label="Budget"><input className="input" value={form.budget} onChange={(e) => set("budget", e.target.value)} /></Field>
          <Field label="Priority"><select className="input" value={form.priority} onChange={(e) => set("priority", e.target.value)}>{PRIORITIES.map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Lead Status"><select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>{STATUSES.map((s) => <option key={s.name}>{s.name}</option>)}</select></Field>
          <Field label="First Contact Date"><input type="date" className="input" value={form.firstContactDate} onChange={(e) => set("firstContactDate", e.target.value)} /></Field>
          <Field label="Expected Closing Date"><input type="date" className="input" value={form.expectedClosingDate} onChange={(e) => set("expectedClosingDate", e.target.value)} /></Field>
          <Field label="Assigned To"><input className="input" value={form.assignedTo} onChange={(e) => set("assignedTo", e.target.value)} /></Field>
          <Field label="Tags">
            <div>
              <input className="input" placeholder="Type and press Enter" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && tagInput.trim()) { set("tags", [...(form.tags || []), tagInput.trim()]); setTagInput(""); } }} />
              <div className="flex gap-1 mt-1 flex-wrap">
                {(form.tags || []).map((t, i) => <span key={i} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">{t}<button onClick={() => set("tags", form.tags.filter((_, j) => j !== i))}><X size={10} /></button></span>)}
              </div>
            </div>
          </Field>
          <Field label="Current Situation" full><textarea className="input" rows={2} value={form.currentSituation} onChange={(e) => set("currentSituation", e.target.value)} /></Field>
          <Field label="Notes" full><textarea className="input" rows={2} placeholder="Initial note (optional)" onChange={(e) => set("_initialNote", e.target.value)} /></Field>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 sticky bottom-0 bg-white dark:bg-slate-900">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700">Cancel</button>
          <button onClick={() => {
            const f = { ...form };
            if (f._initialNote) { f.notes = [{ id: uid(), date: todayStr(), time: "", author: "Me", text: f._initialNote }, ...(f.notes || [])]; delete f._initialNote; }
            onSave(f);
          }} className="text-sm px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium">Save Lead</button>
        </div>
      </div>
      <style>{`.input{width:100%;border:1px solid #e2e8f0;border-radius:0.5rem;padding:0.5rem 0.75rem;font-size:0.875rem;background:transparent}.dark .input{border-color:#334155}`}</style>
    </div>
  );
}
function Field({ label, children, full }) {
  return <label className={`flex flex-col gap-1 ${full ? "col-span-2" : ""}`}><span className="text-xs text-slate-500">{label}</span>{children}</label>;
}
