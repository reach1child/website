"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminSubpageShell from "../../AdminSubpageShell";

type Submission = {
  id: string; form_type: string; form_title: string; name: string; email: string;
  phone: string | null; organisation: string | null; location: string | null;
  interest: string | null; message: string | null; status: string; created_at: string;
};
type EditableFields = Pick<Submission,"name"|"email"|"phone"|"organisation"|"location"|"interest"|"message">;
const labels: Record<string,string> = {
  sponsor: "Child sponsorship", partner: "Partnership", volunteer: "Volunteer", general: "General enquiry", donate: "Donation pledge"
};
const blankFields: EditableFields = {name:"",email:"",phone:"",organisation:"",location:"",interest:"",message:""};

export default function FormsInbox() {
  const [items,setItems] = useState<Submission[]>([]);
  const [selected,setSelected] = useState<Submission|null>(null);
  const [type,setType] = useState("all");
  const [status,setStatus] = useState("all");
  const [query,setQuery] = useState("");
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [editing,setEditing] = useState(false);
  const [fields,setFields] = useState<EditableFields>(blankFields);
  const [saving,setSaving] = useState(false);

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

  function startEditing(item:Submission) {
    setSelected(item);
    setFields({name:item.name,email:item.email,phone:item.phone||"",organisation:item.organisation||"",location:item.location||"",interest:item.interest||"",message:item.message||""});
    setEditing(true);
  }

  async function updateStatus(next:string) {
    if(!selected) return;
    const response=await fetch("/api/form-submissions",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:selected.id,status:next})});
    if(!response.ok){setError("Could not update this submission.");return;}
    await load();
  }

  async function saveEdits(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if(!selected) return;
    setSaving(true); setError("");
    try {
      const response=await fetch("/api/form-submissions",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:selected.id,fields})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"Could not save changes.");
      setEditing(false); await load();
    } catch(e) {setError(e instanceof Error?e.message:"Could not save changes.");}
    finally {setSaving(false);}
  }

  async function deleteSubmission(item:Submission) {
    if(!window.confirm(`Permanently delete the submission from ${item.name}? This cannot be undone.`)) return;
    setError("");
    try {
      const response=await fetch("/api/form-submissions",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:item.id})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"Could not delete submission.");
      if(selected?.id===item.id){setSelected(null);setEditing(false);}
      await load();
    } catch(e) {setError(e instanceof Error?e.message:"Could not delete submission.");}
  }

  const counts = useMemo(()=>({total:items.length,fresh:items.filter(x=>x.status==="new").length}),[items]);

  return <AdminSubpageShell active="forms"><main className="admin-subpage forms-inbox-page">
    <header><a className="admin-back" href="/admin/dashboard">Dashboard</a><span>FOUNDATION MANAGEMENT / FORMS &amp; ENQUIRIES</span></header>
    <section className="forms-inbox-content">
      <span className="admin-eyebrow">FOUNDATION MANAGEMENT</span>
      <h1>Forms &amp; enquiries</h1>
      <p className="forms-inbox-lede">All website submissions in one place. Filter by form, search for a person or organisation, and keep track of follow-up.</p>
      <div className="forms-inbox-stats"><div><strong>{counts.total}</strong><span>SHOWING</span></div><div><strong>{counts.fresh}</strong><span>NEW SUBMISSIONS</span></div><button onClick={()=>void load()} type="button">Refresh list</button></div>
      <div className="forms-inbox-filters">
        <label>Form type<select value={type} onChange={e=>setType(e.target.value)}><option value="all">All forms</option><option value="sponsor">Child sponsorship</option><option value="partner">Partnership</option><option value="volunteer">Volunteer</option><option value="general">General enquiry</option><option value="donate">Donation pledge</option></select></label>
        <label>Follow-up status<select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All statuses</option><option value="new">New</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option></select></label>
        <label className="forms-inbox-search">Search<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Name, email or organisation"/></label>
      </div>
      {error&&<p className="forms-inbox-error">{error}</p>}
      <div className="forms-inbox-layout">
        <div className="forms-inbox-list">
          {loading?<p className="forms-inbox-empty">Loading submissions…</p>:items.length===0?<p className="forms-inbox-empty">No submissions match these filters.</p>:items.map(item=><div key={item.id} className={"forms-inbox-row-wrap"+(selected?.id===item.id?" selected":"")}>
            <button type="button" className={"forms-inbox-row"+(selected?.id===item.id?" selected":"")} onClick={()=>{setSelected(item);setEditing(false);}}>
              <span className="forms-inbox-row-top"><b>{item.name}</b><time>{new Date(item.created_at).toLocaleDateString()}</time></span>
              <span className="forms-inbox-row-type">{labels[item.form_type]||item.form_title}</span>
              <span className="forms-inbox-row-bottom"><small>{item.email}</small><i className={"submission-status status-"+item.status}>{item.status}</i></span>
            </button>
            <div className="forms-inbox-row-actions">
              <button type="button" onClick={()=>startEditing(item)} aria-label={`Edit submission from ${item.name}`}>Edit</button>
              <button type="button" className="danger" onClick={()=>void deleteSubmission(item)} aria-label={`Delete submission from ${item.name}`}>Delete</button>
            </div>
          </div>)}
        </div>
        <aside className="forms-inbox-detail">
          {!selected?<div className="forms-inbox-empty">Select a submission to view its details.</div>:editing?<form onSubmit={saveEdits} className="forms-inbox-edit-form">
            <div className="forms-inbox-detail-top"><span>Edit submission</span><button type="button" onClick={()=>setEditing(false)}>Cancel</button></div>
            {([
              ["name","Full name"],["email","Email address"],["phone","Phone / WhatsApp"],["organisation","Organisation"],["location","Location"],["interest","Area of interest"]
            ] as const).map(([key,label])=><label key={key}>{label}<input required={key==="name"||key==="email"} type={key==="email"?"email":"text"} value={fields[key]||""} onChange={e=>setFields(current=>({...current,[key]:e.target.value}))}/></label>)}
            <label>Message<textarea rows={5} value={fields.message||""} onChange={e=>setFields(current=>({...current,message:e.target.value}))}/></label>
            <div className="forms-inbox-edit-actions"><button type="submit" disabled={saving}>{saving?"Saving…":"Save changes"}</button><button type="button" onClick={()=>setEditing(false)}>Cancel</button></div>
          </form>:<>
            <div className="forms-inbox-detail-top"><span>{labels[selected.form_type]||selected.form_title}</span><time>{new Date(selected.created_at).toLocaleString()}</time></div>
            <h2>{selected.name}</h2><a href={"mailto:"+selected.email}>{selected.email}</a>
            {selected.phone&&<p><b>Phone / WhatsApp</b>{selected.phone}</p>}
            {selected.organisation&&<p><b>Organisation</b>{selected.organisation}</p>}
            {selected.location&&<p><b>Location</b>{selected.location}</p>}
            {selected.interest&&<p><b>Area of interest</b>{selected.interest}</p>}
            <div className="forms-inbox-message"><b>Message</b><p>{selected.message||"No additional message provided."}</p></div>
            <label className="forms-inbox-status-control">Follow-up status<select value={selected.status} onChange={e=>void updateStatus(e.target.value)}><option value="new">New</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option></select></label>
            <div className="forms-inbox-edit-actions"><button type="button" onClick={()=>startEditing(selected)}>Edit submission</button><button type="button" className="danger" onClick={()=>void deleteSubmission(selected)}>Delete submission</button></div>
          </>}
        </aside>
      </div>
      <a className="admin-return" href="/admin/dashboard">Return to dashboard</a>
    </section>
  </main></AdminSubpageShell>;
}
