import Link from "next/link";
import styles from "./page.module.css";

const metrics = [
  ["50", "Children directly sponsored", "Direct sponsorship"],
  ["2,000", "Children indirectly supported", "Community reach"],
  ["8,000+", "Sanitary pads donated", "Health & wellbeing"],
  ["20+", "Workshops held", "Learning & mentorship"],
];

const links = [
  ["Forms & enquiries", "Review sponsorship, partnership and volunteer enquiries.", "/admin/dashboard/forms", "Open inbox"],
  ["Website content", "Update the public-facing pages and website information.", "/admin/cms", "Manage content"],
  ["Management areas", "Return to the foundation administration workspace.", "/admin", "View workspace"],
];

export default function AdminDashboard() {
  return <main className={styles.layout}>
    <aside className={styles.sidebar}>
      <Link href="/admin" className={styles.brand}><b>R1</b><span><strong>R1CF</strong><small>FOUNDATION MANAGEMENT</small></span></Link>
      <small className={styles.navTitle}>WORKSPACE</small>
      <nav>
        <Link className={styles.selected} href="/admin/dashboard"><i>▦</i>Overview</Link>
        <Link href="/admin/dashboard/forms"><i>▤</i>Forms & enquiries</Link>
        <Link href="/admin/cms"><i>▧</i>Website content</Link>
        <Link href="/admin"><i>⌂</i>Management areas</Link>
      </nav>
      <div className={styles.secure}><span/> <div><strong>Workspace secure</strong><small>Administrator access</small></div></div>
    </aside>
    <section className={styles.main}>
      <header className={styles.topbar}><div>Foundation management <span>/</span> Overview</div><div className={styles.admin}><b>A</b><span><strong>Administrator</strong><small>R1CF workspace</small></span></div></header>
      <div className={styles.content}>
        <div className={styles.heading}><div><label>FOUNDATION MANAGEMENT</label><h1>Dashboard</h1><p>Welcome to your operational overview. Here’s a snapshot of R1CF’s work.</p></div><span className={styles.pill}>OPERATIONS OVERVIEW</span></div>
        <div className={styles.metrics}>{metrics.map(([value,label,note])=><article key={label}><small>{label}</small><strong>{value}</strong><span>{note}</span></article>)}</div>
        <div className={styles.sectionHead}><div><h2>Quick access</h2><p>Go directly to the areas you use to manage the foundation.</p></div><small>3 WORKSPACES</small></div>
        <div className={styles.cards}>{links.map(([title,description,href,action],i)=><article key={title}><div className={styles.cardIcon}>{["▤","▧","⌂"][i]}</div><h3>{title}</h3><p>{description}</p><Link href={href}>{action} <b>→</b></Link></article>)}</div>
        <section className={styles.activity}><div><h2>Recent activity</h2><p>Keep track of the latest updates across your workspace.</p></div><span className={styles.live}>● LIVE WORKSPACE</span><div className={styles.empty}><b>▤</b><strong>Your activity feed is ready</strong><p>New submissions and management updates will appear here as the modules are connected.</p></div></section>
        <footer className={styles.footer}>© 2026 Reach One Child Foundation <span>EDUCATE · EMPOWER · TRANSFORM</span></footer>
      </div>
    </section>
  </main>;
}