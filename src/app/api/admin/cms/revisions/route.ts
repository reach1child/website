import { NextResponse } from "next/server";
import { dbPool } from "@/lib/auth";
import { cleanCmsText, getCmsActor } from "@/lib/cms";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 const actor=await getCmsActor();if(!actor)return NextResponse.json({error:"Unauthorised"},{status:401});
 try{
  const body=await request.json();const entryId=cleanCmsText(body.entryId,64);const revisionId=cleanCmsText(body.revisionId,64);
  const client=await dbPool.connect();
  try{
   await client.query("BEGIN");
   const current=await client.query("SELECT * FROM public.cms_entries WHERE id=$1 FOR UPDATE",[entryId]);
   const revision=await client.query("SELECT snapshot FROM public.cms_revisions WHERE id=$1 AND entry_id=$2",[revisionId,entryId]);
   if(!current.rowCount||!revision.rowCount){await client.query("ROLLBACK");return NextResponse.json({error:"The requested revision could not be found."},{status:404});}
   await client.query("INSERT INTO public.cms_revisions(entry_id,snapshot,revision_note,created_by) VALUES($1,$2::jsonb,'Before revision restore',$3)",[entryId,JSON.stringify(current.rows[0]),actor.email]);
   const snapshot=revision.rows[0].snapshot;
   const result=await client.query("UPDATE public.cms_entries SET title=$2,slug=$3,excerpt=$4,content=$5::jsonb,featured_media_id=$6,seo=$7::jsonb,updated_by=$8,updated_at=now(),status=CASE WHEN $9='published' THEN 'draft' ELSE $9 END,published_at=CASE WHEN $9='published' THEN NULL ELSE published_at END WHERE id=$1 RETURNING *",[entryId,snapshot.title,snapshot.slug,snapshot.excerpt,JSON.stringify(snapshot.content||[]),snapshot.featured_media_id||null,JSON.stringify(snapshot.seo||{}),actor.email,snapshot.status||"draft"]);
   await client.query("COMMIT");return NextResponse.json({entry:result.rows[0]});
  }catch(error){await client.query("ROLLBACK");throw error;}finally{client.release();}
 }catch(error){console.error("CMS revision restore failed",error);return NextResponse.json({error:"Unable to restore this revision."},{status:500});}
}
