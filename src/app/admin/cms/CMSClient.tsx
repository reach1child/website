"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./cms.module.css";

type EntryType = "page" | "post" | "programme" | "story" | "event";
type Block = { id: string; isFeatured?: boolean; type: "heading" | "paragraph" | "image" | "quote" | "button" | "divider" | "list"; text?: string; url?: string; level?: number; alt?: string; caption?: string };
type Entry = { id: string; content_type: EntryType; slug: string; title: string; excerpt: string; content: Block[]; status: string; featured_media_id: string | null; seo?: { title?: string; description?: string }; updated_at: string; published_at?: string | null; scheduled_at?: string | null };
type Media = { id: string; filename: string; mime_type: string; byte_size: number; alt_text: string; folder: string; created_at: string };

const sections: { id: EntryType | "media" | "navigation" | "settings" | "team"; label: string; description: string }[] = [
  { id: "page", label: "Pages", description: "Manage the main pages of your website." },
  { id: "post", label: "Posts & news", description: "Publish news, announcements and activity updates." },
  { id: "programme", label: "Programmes", description: "Manage programme descriptions and activities." },
  { id: "story", label: "Stories", description: "Share the experiences and voices behind your work." },
  { id: "event", label: "Events", description: "Publish upcoming events and activities." },
  { id: "media", label: "Media library", description: "Upload and organise foundation photographs." },
  { id: "navigation", label: "Navigation", description: "Manage the links in your website menu." },
  { id: "settings", label: "Site settings", description: "Update shared website information and SEO defaults." },
  { id: "team", label: "Team access", description: "Invite staff and control their content permissions." },
];

const newBlock = (type: Block["type"]): Block => ({ id: crypto.randomUUID(), type, text: "", url: "", alt: "", caption: "", level: 2 });
const emptyEntry = (type: EntryType): Partial<Entry> => ({ content_type: type, title: "", slug: "", excerpt: "", content: [newBlock("heading"), newBlock("paragraph")], status: "draft", seo: { title: "", description: "" } });
const siteAssets=[{name:"Home hero",url:"/images/hero/hero.jfif",folder:"Hero images"},{name:"About us hero",url:"/images/programmes/About%20us%20hero.JPG",folder:"Hero images"},{name:"Programmes hero",url:"/images/programmes/programmes%20hero.jpg",folder:"Hero images"},{name:"Stories hero",url:"/images/stories/stories%20hero.jpeg",folder:"Hero images"},{name:"News hero",url:"/images/programmes/News%20Hero.jpg",folder:"Hero images"},{name:"Programme photograph 1",url:"/images/programmes/Programmes%20(1).jpg",folder:"Programmes"},{name:"Programme photograph 2",url:"/images/programmes/Programmes%20(2).jpg",folder:"Programmes"},{name:"Programme photograph 3",url:"/images/programmes/Programmes%20(3).jpg",folder:"Programmes"},{name:"Programme photograph 4",url:"/images/programmes/Programmes%20(4).jpg",folder:"Programmes"},{name:"Programme photograph 5",url:"/images/programmes/Programmes%20(5).jpg",folder:"Programmes"},{name:"Programme photograph 6",url:"/images/programmes/Programmes%20(6).jpg",folder:"Programmes"},{name:"Foundation logo",url:"/images/branding/logo.jpeg",folder:"Branding"}];
const labels: Record<EntryType,string> = { page: "Page", post: "Post", programme: "Programme", story: "Story", event: "Event" };
const statusLabels: Record<string,string> = { published: "Published", draft: "Draft", review: "Awaiting approval", scheduled: "Scheduled", archived: "Archived" };

export default function CMSClient() {
  const [section,setSection] = useState<typeof sections[number]["id"]>("page");
  const [entries,setEntries] = useState<Entry[]>([]);
  const [media,setMedia] = useState<Media[]>([]);
  const [folders,setFolders] = useState<string[]>([]);
  const [folder,setFolder] = useState("All media");
  const [query,setQuery] = useState("");
  const [status,setStatus] = useState("all");
  const [editing,setEditing] = useState<Partial<Entry> | null>(null);
  const [saving,setSaving] = useState(false);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");
  const [counts,setCounts] = useState({total:0,published:0,drafts:0,awaiting_review:0});
  const [uploading,setUploading] = useState(false);
  const [uploadFolder,setUploadFolder] = useState("Programmes");
  const [selectedMedia,setSelectedMedia] = useState<Media | null>(null);
  const [navItems,setNavItems] = useState<{id:string;label:string;href:string;is_visible:boolean;sort_order:number}[]>([]);
  const [settings,setSettings] = useState({foundationAddress:"3536 Mainstreet Ibex Hill, Lusaka, Zambia", contactEmail:"", contactPhone:"", seoTitle:"Reach One Child Foundation", seoDescription:"For Every Child, Education."});
  const [team,setTeam] = useState<{email:string;display_name:string;access_role:string;is_active:boolean}[]>([]);
  const [invite,setInvite] = useState({name:"",email:"",role:"editor"});
  const [activeEntryId,setActiveEntryId] = useState("");
  const [role,setRole] = useState("administrator");
  const [draggingBlock,setDraggingBlock] = useState<number|null>(null);
  const [mediaTarget,setMediaTarget] = useState<{kind:"featured"}|{kind:"block";index:number}|null>(null);
  const [revisions,setRevisions] = useState<{id:string;revision_note:string;created_by:string;created_at:string}[]>([]);

  const currentType = ["page","post","programme","story","event"].includes(section) ? section as EntryType : null;

  const loadEntries = useCallback(async () => {
    if (!currentType) return;
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({type:currentType});
      if (status !== "all") params.set("status",status);
      if (query.trim()) params.set("q",query.trim());
      const response = await fetch("/api/admin/cms?"+params,{cache:"no-store"});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load content.");
      setEntries(data.entries || []);
      setCounts(data.counts || {total:0,published:0,drafts:0,awaiting_review:0});
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load content."); }
    finally { setLoading(false); }
  },[currentType,status,query]);

  const loadMedia = useCallback(async () => {
    try {
      const params = folder !== "All media" ? "?folder="+encodeURIComponent(folder) : "";
      const response = await fetch("/api/admin/cms/media"+params,{cache:"no-store"});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load media.");
      setMedia(data.media || []); setFolders(data.folders || []);
    } catch(e) { setError(e instanceof Error ? e.message : "Could not load media."); }
  },[folder]);

  const loadSettings = useCallback(async () => {
    try {
      const [s,n,t] = await Promise.all([
        fetch("/api/admin/cms/settings",{cache:"no-store"}),
        fetch("/api/admin/cms/navigation",{cache:"no-store"}),
        fetch("/api/admin/cms/team",{cache:"no-store"})
      ]);
      if (s.ok) { const d=await s.json(); setSettings(v=>({...v,...d.settings})); }
      if (n.ok) { const d=await n.json(); setNavItems(d.items||[]); }
      if (t.ok) { const d=await t.json(); setTeam(d.members||[]); }
    } catch { /* Each settings panel can be retried independently. */ }
  },[]);

  useEffect(()=>{ if(currentType) void loadEntries(); },[currentType,loadEntries]);
  useEffect(()=>{ if(section==="media") void loadMedia(); },[section,loadMedia]);
  useEffect(()=>{ if(section==="settings"||section==="navigation"||section==="team") void loadSettings(); },[section,loadSettings]);

  const visibleEntries = useMemo(()=>entries,[entries]);

  function startNew() {
    if (!currentType) return;
    setEditing(emptyEntry(currentType)); setActiveEntryId(""); setError(""); setNotice("");
  }

  async function openEntry(item: Entry) {
    setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/cms?id="+item.id,{cache:"no-store"});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not open content.");
      setEditing(data.entry); setActiveEntryId(item.id); setRevisions(data.revisions||[]);
    } catch(e) { setError(e instanceof Error ? e.message : "Could not open content."); }
  }

  async function saveEntry(nextStatus: "draft"|"review"|"published"|"scheduled" = "draft") {
    if (!editing) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const payload = { ...editing, status:nextStatus, content:editing.content || [] };
      const response = await fetch("/api/admin/cms",{
        method:activeEntryId ? "PATCH" : "POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(activeEntryId ? {...payload,id:activeEntryId} : payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save content.");
      setEditing(data.entry); setActiveEntryId(data.entry.id); const refreshed=await fetch("/api/admin/cms?id="+data.entry.id,{cache:"no-store"}); const revisionData=await refreshed.json(); setRevisions(revisionData.revisions||[]);
      setNotice(data.entry.status==="review" ? "Sent for approval. An administrator can review and publish it." : data.entry.status==="published" ? "Published successfully." : data.entry.status==="scheduled" ? "Publication scheduled." : "Changes saved.");
      await loadEntries();
    } catch(e) { setError(e instanceof Error ? e.message : "Could not save content."); }
    finally { setSaving(false); }
  }

  async function archiveEntry() {
    if (!activeEntryId || !window.confirm("Move this item to the archive?")) return;
    const response=await fetch("/api/admin/cms",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:activeEntryId})});
    const data=await response.json();
    if(!response.ok){setError(data.error||"Could not archive content.");return;}
    setEditing(null);setActiveEntryId("");setNotice("Content archived.");await loadEntries();
  }

  function updateBlock(index:number,patch:Partial<Block>) {
    const blocks=[...(editing?.content||[])]; blocks[index]={...blocks[index],...patch}; setEditing(v=>({...v,content:blocks}));
  }
  function moveBlock(index:number,delta:number) {
    const blocks=[...(editing?.content||[])]; const target=index+delta;
    if(target<0||target>=blocks.length)return;
    [blocks[index],blocks[target]]=[blocks[target],blocks[index]];setEditing(v=>({...v,content:blocks}));
  }
  function removeBlock(index:number) { setEditing(v=>({...v,content:(v?.content||[]).filter((_,i)=>i!==index)})); }
  function dropBlock(target:number) { if(draggingBlock===null||draggingBlock===target)return;const blocks=[...(editing?.content||[])];const [item]=blocks.splice(draggingBlock,1);blocks.splice(target,0,item);setEditing(v=>({...v,content:blocks}));setDraggingBlock(null); }
  function addBlock(type:Block["type"]) { setEditing(v=>({...v,content:[...(v?.content||[]),newBlock(type)]})); }

  async function uploadFiles(files:FileList|null) {
    if(!files?.length)return;
    setUploading(true);setError("");setNotice("");
    try {
      for(const file of Array.from(files)){
        const form=new FormData();form.set("file",file);form.set("folder",uploadFolder);
        const response=await fetch("/api/admin/cms/media",{method:"POST",body:form});
        const data=await response.json();
        if(!response.ok)throw new Error(data.error||"Upload failed.");
      }
      setNotice("Images uploaded to the media library.");await loadMedia();
    }catch(e){setError(e instanceof Error?e.message:"Upload failed.");}
    finally{setUploading(false);}
  }

  async function updateMedia() {
    if(!selectedMedia)return;
    const response=await fetch("/api/admin/cms/media",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(selectedMedia)});
    const data=await response.json();
    if(!response.ok){setError(data.error||"Could not update image.");return;}
    setSelectedMedia(null);await loadMedia();setNotice("Image details updated.");
  }

  async function saveSettings() {
    const response=await fetch("/api/admin/cms/settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(settings)});
    const data=await response.json();if(!response.ok){setError(data.error||"Could not save settings.");return;}setNotice("Website settings saved.");
  }
  async function saveNavigation() {
    const response=await fetch("/api/admin/cms/navigation",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({items:navItems})});
    const data=await response.json();if(!response.ok){setError(data.error||"Could not save menu.");return;}setNotice("Website navigation saved.");
  }
  async function inviteStaff(event:React.FormEvent) {
    event.preventDefault();setSaving(true);setError("");setNotice("");
    try{
      const response=await fetch("/api/admin/cms/team",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(invite)});
      const data=await response.json();if(!response.ok)throw new Error(data.error||"Invitation failed.");
      setInvite({name:"",email:"",role:"editor"});setNotice("Invitation sent. The staff member can set a password and enable two-factor authentication.");await loadSettings();
    }catch(e){setError(e instanceof Error?e.message:"Invitation failed.");}finally{setSaving(false);}
  }

  const pageTitle = sections.find(s=>s.id===section)?.label || "Website content";

  return <main className={styles.workspace}>
      <header className={styles.header}>
        <div><a href="/admin/dashboard" className={styles.back}>Dashboard</a><span className={styles.crumb}> / WEBSITE CONTENT</span></div>
        <span className={styles.secure}>SECURE CONTENT WORKSPACE</span>
      </header>
      <div className={styles.intro}>
        <div><span className={styles.eyebrow}>REACH ONE CHILD FOUNDATION</span><h1>Content management</h1><p>Manage your website content, media and publishing workflow in one place.</p></div>
        <span className={styles.wpMark}>R1CF <small>CONTENT MANAGER</small></span>
      </div>
      <div className={styles.stats}>
        {[["All content",counts.total],["Published",counts.published],["Drafts",counts.drafts],["Awaiting approval",counts.awaiting_review]].map(([label,value])=><div className={styles.stat} key={label}><strong>{value}</strong><span>{label}</span></div>)}
      </div>
      <div className={styles.shell}>
        <nav className={styles.nav}>
          <span className={styles.navCaption}>CONTENT</span>
          {sections.slice(0,5).map(item=><button key={item.id} className={section===item.id?styles.active:""} onClick={()=>{setSection(item.id);setEditing(null);setError("");setNotice("");}}>{item.label}</button>)}
          <span className={styles.navCaption}>LIBRARY & SETTINGS</span>
          {sections.slice(5).filter(item=>role==="administrator"||item.id==="media").map(item=><button key={item.id} className={section===item.id?styles.active:""} onClick={()=>{setSection(item.id);setEditing(null);setError("");setNotice("");}}>{item.label}</button>)}
        </nav>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <div><h2>{pageTitle}</h2><p>{sections.find(s=>s.id===section)?.description}</p></div>
            {currentType&&!editing&&<button className={styles.primary} onClick={startNew}>+ Add {labels[currentType].toLowerCase()}</button>}
          </div>
          {error&&<div className={styles.error} role="alert">{error}</div>}
          {notice&&<div className={styles.notice} role="status">{notice}</div>}

          {currentType&&!editing&&<>
            <div className={styles.filters}>
              <input aria-label="Search content" placeholder="Search titles and descriptions" value={query} onChange={e=>setQuery(e.target.value)}/>
              <select aria-label="Filter by status" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All statuses</option><option value="published">Published</option><option value="draft">Drafts</option><option value="review">Awaiting approval</option><option value="scheduled">Scheduled</option><option value="archived">Archived</option></select>
              <button className={styles.secondary} onClick={()=>void loadEntries()}>Refresh</button>
            </div>
            <div className={styles.tableWrap}>
              <table><thead><tr><th>Title</th><th>Status</th><th>Last updated</th><th></th></tr></thead><tbody>
                {loading?<tr><td colSpan={4} className={styles.empty}>Loading content…</td></tr>:visibleEntries.length===0?<tr><td colSpan={4} className={styles.empty}>No {labels[currentType].toLowerCase()} items yet. Create your first one to get started.</td></tr>:visibleEntries.map(item=><tr key={item.id}><td><button className={styles.entryTitle} onClick={()=>void openEntry(item)}>{item.title}</button><small>/{item.slug}</small></td><td><span className={styles["status_"+item.status]}>{statusLabels[item.status]||item.status}</span></td><td>{new Date(item.updated_at).toLocaleDateString()}</td><td><button className={styles.textButton} onClick={()=>void openEntry(item)}>Edit</button></td></tr>)}
              </tbody></table>
            </div>
          </>}

          {currentType&&editing&&<div className={styles.editor}>
            <div className={styles.editorTop}><button className={styles.textButton} onClick={()=>{setEditing(null);setActiveEntryId("");setRevisions([]);}}>← Back to {pageTitle.toLowerCase()}</button><span>{activeEntryId?"Editing existing content":"New "+labels[currentType].toLowerCase()}</span><button className={styles.secondary} onClick={()=>window.open("/admin/cms/preview?id="+activeEntryId,"_blank","noopener,noreferrer")} disabled={!activeEntryId}>Preview</button></div>
            <div className={styles.editorGrid}>
              <div className={styles.canvas}>
                <label className={styles.field}>Title<input value={editing.title||""} onChange={e=>setEditing(v=>({...v,title:e.target.value}))} placeholder="Enter a clear title"/></label>
                <label className={styles.field}>URL slug<div className={styles.slug}><span>reachonechildfoundation.org/</span><input value={editing.slug||""} onChange={e=>setEditing(v=>({...v,slug:e.target.value}))} placeholder="page-url"/></div></label>
                <label className={styles.field}>Short description<textarea rows={2} value={editing.excerpt||""} onChange={e=>setEditing(v=>({...v,excerpt:e.target.value}))} placeholder="A short introduction for visitors and search results"/></label>
                <div className={styles.blocksHead}><div><h3>Page content</h3><p>Add and arrange content blocks, just like WordPress.</p></div><span>BLOCK EDITOR</span></div>
                {(editing.content||[]).map((block,index)=><article className={styles.block} key={block.id} draggable onDragStart={()=>setDraggingBlock(index)} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();dropBlock(index);}} onDragEnd={()=>setDraggingBlock(null)}>
                  <div className={styles.blockBar}><strong>{block.type.toUpperCase()}</strong><div><button onClick={()=>moveBlock(index,-1)} disabled={index===0} aria-label="Move block up">↑</button><button onClick={()=>moveBlock(index,1)} disabled={index===(editing.content||[]).length-1} aria-label="Move block down">↓</button><button onClick={()=>removeBlock(index)} aria-label="Remove block">×</button></div></div>
                  {block.type==="heading"?<><select value={block.level||2} onChange={e=>updateBlock(index,{level:Number(e.target.value)})}><option value={2}>Heading 2</option><option value={3}>Heading 3</option><option value={4}>Heading 4</option></select><input value={block.text||""} onChange={e=>updateBlock(index,{text:e.target.value})} placeholder="Section heading"/></>:null}
                  {block.type==="paragraph"||block.type==="quote"||block.type==="list"?<textarea rows={block.type==="quote"?3:5} value={block.text||""} onChange={e=>updateBlock(index,{text:e.target.value})} placeholder={block.type==="quote"?"Add a quotation":block.type==="list"?"Enter one list item per line":"Write your content here"}/>:null}
                  {block.type==="image"?<><input value={block.url||""} onChange={e=>updateBlock(index,{url:e.target.value})} placeholder="Image URL or media library URL"/><input value={block.alt||""} onChange={e=>updateBlock(index,{alt:e.target.value})} placeholder="Alternative text"/><input value={block.caption||""} onChange={e=>updateBlock(index,{caption:e.target.value})} placeholder="Image caption"/><button className={styles.secondary} onClick={()=>{setMediaTarget({kind:"block",index});setSection("media");}}>Choose from media library</button></>:null}
                  {block.type==="button"?<><input value={block.text||""} onChange={e=>updateBlock(index,{text:e.target.value})} placeholder="Button label"/><input value={block.url||""} onChange={e=>updateBlock(index,{url:e.target.value})} placeholder="Button destination (e.g. /get-involved)"/></>:null}
                  {block.type==="divider"?<p className={styles.dividerPreview}>Section divider</p>:null}
                </article>)}
                <div className={styles.addBlock}><span>Add a block</span>{(["heading","paragraph","list","image","quote","button","divider"] as Block["type"][]).map(type=><button key={type} onClick={()=>addBlock(type)}>+ {type}</button>)}</div>
              </div>
              <aside className={styles.editorSide}>
                <section className={styles.sideCard}><h3>Publish</h3><p>Current status: <b>{statusLabels[editing.status||"draft"]}</b></p>{role==="administrator"&&<button className={styles.primary} disabled={saving||!editing.title?.trim()} onClick={()=>void saveEntry("published")}>{saving?"Saving…":"Publish"}</button>}<button className={styles.secondary} disabled={saving} onClick={()=>void saveEntry("draft")}>Save draft</button><button className={styles.secondary} disabled={saving} onClick={()=>void saveEntry("review")}>Submit for approval</button>{role==="administrator"&&<><label className={styles.field}>Schedule publication<input type="datetime-local" value={editing.scheduled_at?new Date(new Date(editing.scheduled_at).getTime()-new Date(editing.scheduled_at).getTimezoneOffset()*60000).toISOString().slice(0,16):""} onChange={e=>setEditing(v=>({...v,scheduled_at:e.target.value?new Date(e.target.value).toISOString():null}))}/></label><button className={styles.secondary} disabled={saving||!editing.scheduled_at} onClick={()=>void saveEntry("scheduled")}>Schedule</button>{activeEntryId&&<button className={styles.danger} onClick={()=>void archiveEntry()}>Move to archive</button>}</>}</section>
                <section className={styles.sideCard}><h3>Featured image</h3>{editing.featured_media_id?<img className={styles.featured} src={"/api/cms-media/"+editing.featured_media_id} alt="Selected featured image"/>:editing.content?.find(block=>block.type==="image"&&block.isFeatured)?.url?<img className={styles.featured} src={editing.content.find(block=>block.type==="image"&&block.isFeatured)?.url} alt="Selected featured image"/>:<p>No featured image selected.</p>}<button className={styles.secondary} onClick={()=>{setMediaTarget({kind:"featured"});setSection("media");}}>Choose media</button></section>
                <section className={styles.sideCard}><h3>Revision history</h3>{revisions.length?revisions.map(rev=><div className={styles.revisionRow} key={rev.id}><span>{new Date(rev.created_at).toLocaleString()}<small>{rev.revision_note}</small></span><button className={styles.textButton} onClick={async()=>{if(!window.confirm("Restore this previous version? Your current version will be saved in the history."))return;const response=await fetch("/api/admin/cms/revisions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({entryId:activeEntryId,revisionId:rev.id})});const data=await response.json();if(!response.ok){setError(data.error||"Could not restore revision.");return;}setEditing(data.entry);setNotice("Previous version restored.");await openEntry(data.entry as Entry);}}>Restore</button></div>):<p>No saved revisions yet.</p>}</section><section className={styles.sideCard}><h3>Search appearance</h3><label className={styles.field}>SEO title<input value={editing.seo?.title||""} onChange={e=>setEditing(v=>({...v,seo:{...v.seo,title:e.target.value}}))}/></label><label className={styles.field}>Meta description<textarea rows={3} value={editing.seo?.description||""} onChange={e=>setEditing(v=>({...v,seo:{...v.seo,description:e.target.value}}))}/></label></section>
              </aside>
            </div>
          </div>}

          {section==="media"&&<div className={styles.mediaArea}>
            <div className={styles.mediaToolbar}><div><h3>Media library</h3><p>Upload JPG, PNG, WebP or GIF images (maximum 4 MB each).</p></div><label className={styles.primary+" "+styles.uploadLabel}>{uploading?"Uploading…":"Upload images"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple disabled={uploading} onChange={e=>void uploadFiles(e.target.files)}/></label></div>
            <div className={styles.mediaFilters}><select value={folder} onChange={e=>setFolder(e.target.value)}><option>All media</option>{folders.map(f=><option key={f}>{f}</option>)}</select><input value={uploadFolder} onChange={e=>setUploadFolder(e.target.value)} placeholder="Upload folder"/></div>
            <div className={styles.mediaGrid}>{media.map(item=><button key={item.id} className={styles.mediaCard} onClick={()=>setSelectedMedia(item)}><img src={"/api/cms-media/"+item.id} alt={item.alt_text||item.filename}/><span>{item.filename}</span><small>{(item.byte_size/1024).toFixed(0)} KB · {item.folder}</small></button>)}</div>
            {media.length===0&&<p className={styles.empty}>Your uploaded media library is empty. Upload new photographs or choose from existing website images below.</p>}<section className={styles.siteAssets}><div><h3>Existing website images</h3><p>Choose from photographs already stored in the website’s GitHub images folders.</p></div><div className={styles.mediaGrid}>{siteAssets.map(asset=><div className={styles.mediaCard} key={asset.url}><img src={asset.url} alt={asset.name}/><span>{asset.name}</span><small>{asset.folder}</small><div className={styles.assetActions}><button onClick={()=>useSiteAsset(asset,true)} disabled={!editing}>Set as featured</button><button onClick={()=>useSiteAsset(asset,false)} disabled={!editing}>Insert in content</button></div></div>)}</div></section>}
            {selectedMedia&&<div className={styles.modalBackdrop}><div className={styles.modal}><button className={styles.modalClose} onClick={()=>setSelectedMedia(null)}>Close</button><img src={"/api/cms-media/"+selectedMedia.id} alt={selectedMedia.alt_text}/><h3>{selectedMedia.filename}</h3><label className={styles.field}>Alternative text<input value={selectedMedia.alt_text} onChange={e=>setSelectedMedia(v=>v?({...v,alt_text:e.target.value}):v)}/></label><label className={styles.field}>Folder<input value={selectedMedia.folder} onChange={e=>setSelectedMedia(v=>v?({...v,folder:e.target.value}):v)}/></label><button className={styles.primary} onClick={()=>void updateMedia()}>Save image details</button>{mediaTarget&&<button className={styles.secondary} onClick={()=>{if(mediaTarget.kind==="featured")setEditing(v=>({...v,featured_media_id:selectedMedia.id}));else updateBlock(mediaTarget.index,{url:"/api/cms-media/"+selectedMedia.id,alt:selectedMedia.alt_text});setSelectedMedia(null);setMediaTarget(null);setSection(editing?.content_type||"page");}}>Use this image in the editor</button>}</div></div>}
          </div>}

          {section==="navigation"&&<div className={styles.settingsArea}><h3>Website menu</h3><p>Update the labels and destinations shown in the public website navigation.</p>{navItems.map((item,index)=><div className={styles.navRow} key={item.id}><input value={item.label} onChange={e=>setNavItems(v=>v.map((x,i)=>i===index?({...x,label:e.target.value}):x))} aria-label="Menu label"/><input value={item.href} onChange={e=>setNavItems(v=>v.map((x,i)=>i===index?({...x,href:e.target.value}):x))} aria-label="Menu URL"/><label><input type="checkbox" checked={item.is_visible} onChange={e=>setNavItems(v=>v.map((x,i)=>i===index?({...x,is_visible:e.target.checked}):x))}/> Visible</label><button onClick={()=>setNavItems(v=>v.filter((_,i)=>i!==index))}>Remove</button></div>)}<button className={styles.secondary} onClick={()=>setNavItems(v=>[...v,{id:crypto.randomUUID(),label:"New link",href:"/",is_visible:true,sort_order:v.length}])}>+ Add menu item</button><button className={styles.primary} onClick={()=>void saveNavigation()}>Save navigation</button></div>}

          {section==="settings"&&<div className={styles.settingsArea}><h3>Global website settings</h3><p>Shared information used across the foundation website.</p><label className={styles.field}>Foundation address<input value={settings.foundationAddress} onChange={e=>setSettings(v=>({...v,foundationAddress:e.target.value}))}/></label><label className={styles.field}>Contact email<input value={settings.contactEmail} onChange={e=>setSettings(v=>({...v,contactEmail:e.target.value}))}/></label><label className={styles.field}>Contact phone<input value={settings.contactPhone} onChange={e=>setSettings(v=>({...v,contactPhone:e.target.value}))}/></label><label className={styles.field}>Default SEO title<input value={settings.seoTitle} onChange={e=>setSettings(v=>({...v,seoTitle:e.target.value}))}/></label><label className={styles.field}>Default SEO description<textarea rows={3} value={settings.seoDescription} onChange={e=>setSettings(v=>({...v,seoDescription:e.target.value}))}/></label><button className={styles.primary} onClick={()=>void saveSettings()}>Save site settings</button></div>}

          {section==="team"&&<div className={styles.settingsArea}><h3>Team access</h3><p>Invite authorised staff. Every account must use two-factor authentication.</p><form className={styles.inviteForm} onSubmit={inviteStaff}><input required placeholder="Staff member's name" value={invite.name} onChange={e=>setInvite(v=>({...v,name:e.target.value}))}/><input required type="email" placeholder="Email address" value={invite.email} onChange={e=>setInvite(v=>({...v,email:e.target.value}))}/><select value={invite.role} onChange={e=>setInvite(v=>({...v,role:e.target.value}))}><option value="editor">Editor — create and edit, submit for approval</option><option value="author">Author — create drafts and submit for approval</option></select><button className={styles.primary} disabled={saving}>{saving?"Sending…":"Invite staff member"}</button></form><div className={styles.teamList}>{team.map(member=><div key={member.email}><span><b>{member.display_name||member.email}</b><small>{member.email}</small></span><select value={member.access_role} onChange={async e=>{const response=await fetch("/api/admin/cms/team",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:member.email,role:e.target.value,isActive:member.is_active})});const data=await response.json();if(!response.ok){setError(data.error||"Could not update role.");return;}await loadSettings();}}><option value="editor">Editor</option><option value="author">Author</option></select><button className={styles.secondary} onClick={async()=>{const response=await fetch("/api/admin/cms/team",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"resend",email:member.email})});const data=await response.json();if(!response.ok){setError(data.error||"Could not resend invitation.");return;}setNotice("Password setup link sent again.");}}>Resend setup</button><button className={member.is_active?styles.danger:styles.secondary} onClick={async()=>{const response=await fetch("/api/admin/cms/team",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:member.email,role:member.access_role,isActive:!member.is_active})});const data=await response.json();if(!response.ok){setError(data.error||"Could not update access.");return;}await loadSettings();}}>{member.is_active?"Deactivate":"Reactivate"}</button></div>)}</div></div>}
        </section>
      </div>
    </main>;
}
