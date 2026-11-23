import Image from "next/image";
import Link from "next/link";
import { getCmsActor } from "@/lib/cms";

export default async function AdminSubpageShell({children,active}:{children:React.ReactNode;active:"forms"|"cms"}) {
  const actor=await getCmsActor();
  const isAdministrator=actor?.role==="administrator";
  return <div className="admin-workspace-shell">
    <aside className="admin-workspace-sidebar">
      <Link href="/admin/dashboard" className="admin-workspace-brand"><Image src="/images/branding/logo.jpeg" alt="Reach One Child Foundation" width={190} height={74} priority /></Link>
      <div className="admin-workspace-label">WORKSPACE</div>
      <nav>
        {isAdministrator&&<><Link className="" href="/admin/dashboard">Dashboard</Link><Link className={active==="forms"?"current":""} href="/admin/dashboard/forms">Forms &amp; enquiries</Link></>}
        <Link className={active==="cms"?"current":""} href="/admin/cms">Website content</Link>
        <a href="https://reachonechildfoundation.org" target="_blank" rel="noreferrer">View website</a>
      </nav>
      <div className="admin-workspace-secure"><b>Secure workspace</b><span>{isAdministrator?"Administrator access":actor?.role==="editor"?"Editor access":"Author access"}</span></div>
    </aside>
    <section className="admin-workspace-main">
      <header className="admin-workspace-topbar"><span>Foundation management <b>/</b> {active==="forms"?"Forms & enquiries":"Website content"}</span><div><strong>{isAdministrator?"Administrator":actor?.name||"Staff member"}</strong><small>{isAdministrator?"R1CF workspace":actor?.role==="editor"?"CMS editor":"CMS author"}</small></div></header>
      <div className="admin-workspace-content">{children}</div>
    </section>
  </div>;
}
