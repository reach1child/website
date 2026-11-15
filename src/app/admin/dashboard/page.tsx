import Link from "next/link";

const modules = [
  ["Analytics & impact", "Track reach, programme outcomes and key indicators.", "01"],
  ["Forms & enquiries", "Review sponsorship, partnership and general enquiries.", "02"],
  ["Volunteer management", "Organise volunteer profiles, interests and engagement.", "03"],
  ["Activities & reports", "Record activities, upload evidence and prepare reports.", "04"],
];

export default function AdminDashboard() {
  return <main className="admin-subpage"><header><Link href="/admin" className="admin-back">← Administration home</Link><span>DASHBOARD / OPERATIONS</span></header><section><span className="admin-eyebrow">FOUNDATION MANAGEMENT</span><h1>Dashboard</h1><p>Your operational workspace for monitoring and coordinating R1CF’s work. These modules are being set up as the foundation’s management tools.</p><div className="admin-module-grid">{modules.map(([title,body,n])=><article key={n}><small>{n}</small><h2>{title}</h2><p>{body}</p><span>Workspace setup</span></article>)}</div><Link href="/admin" className="admin-return">← Back to workspace selection</Link></section></main>;
}
