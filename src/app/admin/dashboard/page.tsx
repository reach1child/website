import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

const metrics = [
  { value: "50", label: "Children directly sponsored", detail: "Direct sponsorship", tone: "blue" },
  { value: "2,000", label: "Children indirectly supported", detail: "Community reach", tone: "red" },
  { value: "8,000+", label: "Sanitary pads donated", detail: "Health & wellbeing", tone: "blue" },
  { value: "20+", label: "Workshops held", detail: "Learning & mentorship", tone: "red" },
];
const actions = [
  { title: "Forms & enquiries", description: "Review and follow up on website submissions.", href: "/admin/dashboard/forms", action: "Open submissions" },
  { title: "Website content", description: "Update pages and information on the public website.", href: "/admin/cms", action: "Manage website" },
  { title: "Visit public website", description: "See the website as visitors and supporters experience it.", href: "https://reachonechildfoundation.org", action: "Open website", external: true },
];

export default function AdminDashboard() {
  return <main className={styles.layout}>
    <aside className={styles.sidebar}>
      <Link href="/admin/dashboard" className={styles.brand}><Image src="/images/branding/logo.jpeg" alt="Reach One Child Foundation" width={190} height={74} priority /></Link>
      <div className={styles.navLabel}>WORKSPACE</div>
      <nav className={styles.nav}>
        <Link className={styles.active} href="/admin/dashboard">Dashboard</Link>
        <Link href="/admin/dashboard/forms">Forms &amp; enquiries</Link>
        <Link href="/admin/cms">Website content</Link>
        <a href="https://reachonechildfoundation.org" target="_blank" rel="noreferrer">View website</a>
      </nav>
      <div className={styles.sidebarBottom}><div className={styles.secure}><i /><span><b>Secure workspace</b><small>Administrator access</small></span></div></div>
    </aside>
    <section className={styles.main}>
      <header className={styles.topbar}>
        <div className={styles.mobileBrand}>R1CF <span>/</span> Dashboard</div>
        <div className={styles.breadcrumb}>Foundation management <span>/</span> Dashboard</div>
        <div className={styles.profile}><b>AD</b><span><strong>Administrator</strong><small>R1CF workspace</small></span></div>
      </header>
      <div className={styles.content}>
        <section className={styles.hero}>
          <Image src="/images/hero/hero.jfif" alt="Children supported by Reach One Child Foundation" fill priority sizes="(max-width: 900px) 100vw, 80vw" className={styles.heroImage} />
          <div className={styles.heroShade} />
          <div className={styles.heroCopy}><span>REACH ONE CHILD FOUNDATION</span><h1>Welcome back,<br />Administrator.</h1><p>Together, we can create a brighter future for every child in Zambia.</p><i /></div>
        </section>
        <section className={styles.metrics} aria-label="Foundation impact figures">
          {metrics.map(metric => <article className={styles.metric} key={metric.label}>
            
            <div className={styles.metricText}><strong>{metric.value}</strong><span>{metric.label}</span><small>{metric.detail}</small></div>
            <div className={styles.metricRule + " " + styles[metric.tone]} />
          </article>)}
        </section>
        <p className={styles.metricNote}>Foundation impact figures reported in the R1CF organisational profile.</p>
        <div className={styles.lowerGrid}>
          <section className={styles.panel}>
            <div className={styles.panelHeading}><div><span className={styles.eyebrow}>YOUR WORKSPACE</span><h2>Quick actions</h2><p>Go straight to the tools you use to manage the foundation.</p></div></div>
            <div className={styles.actionGrid}>{actions.map(action => <article className={styles.actionCard} key={action.title}>
              <div className={styles.actionBody}><h3>{action.title}</h3><p>{action.description}</p>
                {action.external ? <a href={action.href} target="_blank" rel="noreferrer">{action.action}</a> : <Link href={action.href}>{action.action}</Link>}
              </div></article>)}</div>
          </section>
          <section className={styles.panel + " " + styles.activityPanel}>
            <div className={styles.panelHeading}><div><span className={styles.eyebrow}>STAY UP TO DATE</span><h2>Recent activity</h2><p>Your latest workspace updates.</p></div><span className={styles.live}><i /> LIVE</span></div>
            <div className={styles.emptyState}><strong>Your activity feed is ready</strong><p>New form submissions are available in your central inbox. Activity updates will appear here as more management tools are connected.</p><Link href="/admin/dashboard/forms">Go to forms &amp; enquiries</Link></div>
          </section>
        </div>
        <section className={styles.mission}><div><span>EDUCATE · EMPOWER · TRANSFORM</span><h2>Changing lives, one child at a time.</h2><p>Your work helps build a more educated, empowered and hopeful Zambia.</p></div><Link href="/admin/cms">Manage foundation website</Link></section>
        <footer className={styles.footer}>© 2026 Reach One Child Foundation <span>FOR EVERY CHILD, EDUCATION.</span></footer>
      </div>
    </section>
  </main>;
}