import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth, dbPool } from "@/lib/auth";

export const dynamic="force-dynamic";
export default async function CmsPreview({searchParams}:{searchParams:Promise<{id?:string}>}) {
  const session=await auth.api.getSession({headers:await headers()});
  if(!session)redirect("/admin-login");
  const email=session.user.email.toLowerCase();
  if(email!=="r1cfprojects@gmail.com"||session.user.role!=="admin"){
    const member=await dbPool.query("SELECT email FROM public.cms_team_members WHERE email=$1 AND is_active=true",[email]);
    if(!member.rowCount)redirect("/admin-unauthorized");
  }
  const {id}=await searchParams;
  if(!id)return <main style={{padding:40}}>Choose a content item to preview.</main>;
  const result=await dbPool.query("SELECT title,excerpt,content,featured_media_id FROM public.cms_entries WHERE id=$1",[id]);
  if(!result.rowCount)return <main style={{padding:40}}>Content not found.</main>;
  const entry=result.rows[0];
  const blocks=Array.isArray(entry.content)?entry.content:[];const featured=entry.featured_media_id?"/api/cms-media/"+entry.featured_media_id:blocks.find((b:{type:string;isFeatured?:boolean;url?:string})=>b.type==="image"&&b.isFeatured)?.url;
  return <main style={{maxWidth:900,margin:"0 auto",padding:"48px 24px",fontFamily:"Arial,sans-serif",color:"#17243b"}}><a href="/admin/cms">← Back to editor</a><h1 style={{fontSize:42,color:"#041968"}}>{entry.title}</h1><p style={{fontSize:18,color:"#65728a"}}>{entry.excerpt}</p>{featured&&<img src={featured} alt="" style={{width:"100%",maxHeight:420,objectFit:"cover",borderRadius:12,margin:"20px 0"}}/>}{blocks.filter((b:{isFeatured?:boolean})=>!b.isFeatured).map((b:{id?:string;type:string;text?:string;url?:string;alt?:string;caption?:string;level?:number},i:number)=>{if(b.type==="heading"){const H=(["h2","h3","h4"] as const).includes(("h"+(b.level||2)) as "h2"|"h3"|"h4")?("h"+(b.level||2)) as "h2"|"h3"|"h4":"h2";return <H key={b.id||i}>{b.text}</H>}if(b.type==="paragraph")return <p key={b.id||i} style={{fontSize:17,lineHeight:1.8}}>{b.text}</p>;if(b.type==="list")return <ul key={b.id||i}>{(b.text||"").split("\n").filter(Boolean).map((line,j)=><li key={j}>{line}</li>)}</ul>;if(b.type==="quote")return <blockquote key={b.id||i} style={{borderLeft:"4px solid #ee3135",paddingLeft:20,fontSize:20}}>{b.text}</blockquote>;if(b.type==="image")return <figure key={b.id||i}><img src={b.url||""} alt={b.alt||""} style={{width:"100%",borderRadius:10}}/><figcaption>{b.caption}</figcaption></figure>;if(b.type==="button")return <a key={b.id||i} href={b.url||"#"} style={{display:"inline-block",background:"#ee3135",color:"#fff",padding:"12px 18px",borderRadius:6,textDecoration:"none"}}>{b.text}</a>;return <hr key={b.id||i}/>})}</main>;
}
