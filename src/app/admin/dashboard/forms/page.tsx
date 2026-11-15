"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminSubpageShell from "../../AdminSubpageShell";

type Submission = {
  id: string; form_type: string; form_title: string; name: string; email: string;
  phone: string | null; organisation: string | null; location: string | null;
  interest: string | null; message: string | null; status: string; created_at: string;
};

const labels: Record<string,string> = {
  sponsor: "Child sponsorship", partner: "Partnership", volunteer: "Volunteer", general: "General enquiry"
};

export default function FormsInbox() {
  const [items,setItems] = useState<Submission[]>([]);
  const [selected,setSelected] = useState<Submission|null>(null);
  const [type,setType] = useState("all");
  const [status,setStatus] = useState("all");
  const [query,setQuery] = useState("");
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams();
      if(type!=="all") params.set("type",type);
      if(status!=="all") params.set("status",status);
      if(query.trim()) params.set("q",query.trim());
      const response = await fetch("/api/form-submissions?"+params.toString(),{cache:"no-store"});
      if(!response.ok) throw new Error(response.status===401?"Your administrator session has expired. Please sign in again.":"Unable to load submissions.");
      const data = await response.json(); setItems(data.submissions);
      setSelected(current => current ? data.submissions.find((x:Submission)=>x.id===current.id) || null : null);
    } catch(e) { setError(e instanceof Error?e.message:"Unable to load submissions."); }
    finally { setLoading(false); }
  },[type,status,query]);

  useEffect(()=>{ void load(); },[load]);

  async function updateStatus(next:string) {
    if(!selected) return;
    const response=await fetch("/api/form-submissions",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:selected.id,status:next})});
    if(!response.ok){setError("Could not update this submission.");return;}
    await load();
  }

  const counts = useMemo(()=>({
    total:items.length, fresh:items.filter(x=>x.status==="new").length
  }),[items]);

  return <AdminSubpageShell active="forms"><main className="admin-subpage forms-inbox-page">
    <header><a className="admin-back" href="/admin/dashboard">Dashboard</a><span>FOUNDATION MANAGEMENT / FORMS & ENQUIRIES</span></header>
    <section className="forms-inbox-content">
      <span className="admin-eyebrow">FOUNDATION MANAGEMENT</span>
      <h1>Forms &amp; enquiries</h1>
      <p className="forms-inbox-lede">All website submissions in one place. Filter by form, search for a person or organisation, and keep track of follow-up.</p>
      <div className="forms-inbox-stats"><div><strong>{counts.total}</strong><span>SHOWING</span></div><div><strong>{counts.fresh}</strong><span>NEW SUBMISSIONS</span></div><button onClick={()=>void load()} type="button">Refresh list</button></div>
      <div className="forms-inbox-filters">
        <label>Form type<select value={type} onChange={e=>setType(e.target.value)}><option value="all">All forms</option><option value="sponsor">Child sponsorship</option><option value="partner">Partnership</option><option value="volunteer">Volunteer</option><option value="general">General enquiry</option></select></label>
        <label>Follow-up status<select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All statuses</option><option value="new">New</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option></select></label>
        <label className="forms-inbox-search">Search<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Name, email or organisation"/></label>
      </div>
      {error&&<p className="forms-inbox-error">{error}</p>}
      <div className="forms-inbox-layout">
        <div className="forms-inbox-list">
          {loading?<p className="forms-inbox-empty">Loading submissions…</p>:items.length===0?<p className="forms-inbox-empty">No submissions match these filters.</p>:items.map(item=><button type="button" key={item.id} className={"forms-inbox-row"+(selected?.id===item.id?" selected":"")} onClick={()=>setSelected(item)}>
            <span className="forms-inbox-row-top"><b>{item.name}</b><time>{new Date(item.created_at).toLocaleDateString()}</time></span>
            <span className="forms-inbox-row-type">{labels[item.form_type]||item.form_title}</span>
            <span className="forms-inbox-row-bottom"><small>{item.email}</small><i className={"submission-status status-"+item.status}>{item.status}</i></span>
          </button>)}
        </div>
        <aside className="forms-inbox-detail">
          {!selected?<div className="forms-inbox-empty">Select a submission to view its details.</div>:<>
            <div className="forms-inbox-detail-top"><span>{labels[selected.form_type]||selected.form_title}</span><time>{new Date(selected.created_at).toLocaleString()}</time></div>
            <h2>{selected.name}</h2><a href={"mailto:"+selected.email}>{selected.email}</a>
            {selected.phone&&<p><b>Phone / WhatsApp</b>{selected.phone}</p>}
            {selected.organisation&&<p><b>Organisation</b>{selected.organisation}</p>}
            {selected.location&&<p><b>Location</b>{selected.location}</p>}
            {selected.interest&&<p><b>Area of interest</b>{selected.interest}</p>}
            <div className="forms-inbox-message"><b>Message</b><p>{selected.message||"No additional message provided."}</p></div>
            <label className="forms-inbox-status-control">Follow-up status<select value={selected.status} onChange={e=>void updateStatus(e.target.value)}><option value="new">New</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option></select></label>
          </>}
        </aside>
      </div>
      <a className="admin-return" href="/admin/dashboard">Return to dashboard</a>
    </section>
  </main></AdminSubpageShell>;
}
