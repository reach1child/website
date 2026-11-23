import { NextResponse } from "next/server";
import { dbPool } from "@/lib/auth";
import { cleanCmsText, getCmsActor } from "@/lib/cms";
export const dynamic="force-dynamic";
const seed=[["Home","/"],["About us","/about"],["Programmes","/programmes"],["Stories","/stories"],["News","/news"],["Get involved","/get-involved"],["Contact","/contact"]];
async function ensureSeed(){const count=await dbPool.query("SELECT COUNT(*)::int AS n FROM public.cms_navigation");if(count.rows[0].n===0){for(let i=0;i<seed.length;i++)await dbPool.query("INSERT INTO public.cms_navigation(label,href,sort_order) VALUES($1,$2,$3)",[seed[i][0],seed[i][1],i]);}}
export async function GET(){const actor=await getCmsActor();if(!actor)return NextResponse.json({error:"Unauthorised"},{status:401});try{await ensureSeed();const r=await dbPool.query("SELECT id,label,href,sort_order,is_visible FROM public.cms_navigation ORDER BY sort_order,id");return NextResponse.json({items:r.rows});}catch{return NextResponse.json({error:"Unable to load navigation."},{status:503});}}
export async function PUT(request:Request){
 const actor=await getCmsActor();if(!actor||actor.role!=="administrator")return NextResponse.json({error:"Administrator access required."},{status:403});
 try{
  const body=await request.json();const items=Array.isArray(body.items)?body.items.slice(0,30):[];const client=await dbPool.connect();
  try{await client.query("BEGIN");await client.query("DELETE FROM public.cms_navigation");for(let i=0;i<items.length;i++){const item=items[i];const href=cleanCmsText(item.href,300);if(!(href.startsWith("/")&&!href.startsWith("//"))&&!/^https:\/\//i.test(href))continue;await client.query("INSERT INTO public.cms_navigation(label,href,sort_order,is_visible) VALUES($1,$2,$3,$4)",[cleanCmsText(item.label,80)||"Link",href,i,Boolean(item.is_visible)]);}await client.query("COMMIT");}catch(error){await client.query("ROLLBACK");throw error;}finally{client.release();}
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Unable to save navigation."},{status:500});}
}
