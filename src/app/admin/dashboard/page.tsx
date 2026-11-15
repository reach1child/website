import Link from "next/link";

const modules = [
  ["Analytics & impact", "Track reach, programme outcomes and key indicators.", "01", "/admin/dashboard/analytics"],
  ["Forms & enquiries", "Review sponsorship, partnership and general enquiries.", "02", "/admin/dashboard/forms"],
  ["Volunteer management", "Organise volunteer profiles, interests and engagement.", "03", "/admin/dashboard/volunteers"],
  ["Activities & reports", "Record activities, upload evidence and prepare reports.", "04", "/admin/dashboard/activities"],
];

export default function AdminDashboard() {
  return <main className="admin-subpage"><header><Link href="/admin" className="admin-back">← Administration home</Link><span>DASHBOARD / OPERATIONS</span></header><section><span className="admin-eyebrow">FOUNDATION MANAGEMENT</span><h1>Dashboard</h1><p>Your operational workspace for monitoring and coordinating R1CF’s work. These modules are being set up as the foundation’s management tools.</p><div className="admin-module-grid">{modules.map(([title,body,n,href])=><article key={n}><small>{n}</small><h2>{title}</h2><p>{body}</p>{n==="02"?<Link href={href} className="admin-module-action">Open submissions inbox</Link>:<span>Workspace setup</span>}</article>)}</div><Link href="/admin" className="admin-return">← Back to workspace selection</Link></section></main>;
}
