import Link from "next/link";

const modules = [
  ["Pages", "Edit website pages, headings, text and page sections.", "▤"],
  ["Posts & updates", "Publish news, stories, activity updates and announcements.", "▧"],
  ["Media library", "Upload and organise photographs, documents and brand assets.", "▣"],
  ["Navigation", "Manage website menus and page links.", "☷"],
  ["Programmes", "Update programme descriptions, images and information.", "◫"],
  ["Site settings", "Manage website identity, contact details and shared settings.", "⚙"],
];

export default function AdminCMS() {
  return <main className="admin-subpage admin-cms-subpage"><header><Link href="/admin" className="admin-back">← Administration home</Link><span>CMS / WEBSITE EDITOR</span></header><section><span className="admin-eyebrow">WEBSITE CONTENT</span><h1>Content Management System</h1><p>A familiar, WordPress-inspired workspace for managing the content and media on the Reach One Child Foundation website.</p><div className="cms-notice"><strong>CMS foundation</strong><span>This is the starting workspace. Editing, publishing, media uploads, revisions and user permissions will be connected in the next build phase.</span></div><div className="cms-module-grid">{modules.map(([title,body,icon])=><article key={title}><span className="cms-module-icon">{icon}</span><div><h2>{title}</h2><p>{body}</p></div><span className="cms-module-arrow">↗</span></article>)}</div><Link href="/admin" className="admin-return">← Back to workspace selection</Link></section></main>;
}
