import Image from "next/image";
import Link from "next/link";

export default function AdminSubpageShell({children,active}:{children:React.ReactNode;active:"forms"|"cms"}) {
  return <div className="admin-workspace-shell">
    <aside className="admin-workspace-sidebar">
      <Link href="/admin/dashboard" className="admin-workspace-brand"><Image src="/images/branding/logo.jpeg" alt="Reach One Child Foundation" width={190} height={74} priority /></Link>
      <div className="admin-workspace-label">WORKSPACE</div>
      <nav>
        <Link className={active==="dashboard"?"current":""} href="/admin/dashboard">Dashboard</Link>
        <Link className={active==="forms"?"current":""} href="/admin/dashboard/forms">Forms &amp; enquiries</Link>
        <Link className={active==="cms"?"current":""} href="/admin/cms">Website content</Link>
        <a href="https://reachonechildfoundation.org" target="_blank" rel="noreferrer">View website</a>
      </nav>
      <div className="admin-workspace-secure"><b>Secure workspace</b><span>Administrator access</span></div>
    </aside>
    <section className="admin-workspace-main">
      <header className="admin-workspace-topbar"><span>Foundation management <b>/</b> {active==="forms"?"Forms & enquiries":"Website content"}</span><div><strong>Administrator</strong><small>R1CF workspace</small></div></header>
      <div className="admin-workspace-content">{children}</div>
    </section>
  </div>;
}
