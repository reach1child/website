import Link from "next/link";

const modules = [
  {
    number: "01",
    title: "Analytics & impact",
    description: "Track reach, programme outcomes and the indicators that help measure R1CF’s progress.",
    detail: "Monitor performance",
  },
  {
    number: "02",
    title: "Forms & enquiries",
    description: "Review and coordinate sponsorship, partnership and general enquiries in one place.",
    detail: "Manage incoming enquiries",
  },
  {
    number: "03",
    title: "Volunteer management",
    description: "Keep volunteer profiles, areas of interest and engagement organised as the network grows.",
    detail: "Coordinate volunteers",
  },
  {
    number: "04",
    title: "Activities & reports",
    description: "Record programme activities, organise supporting evidence and prepare clear reports.",
    detail: "Document the work",
  },
];

export default function AdminDashboard() {
  return (
    <main className="admin-subpage admin-dashboard-page">
      <header className="admin-dashboard-header">
        <Link href="/admin" className="admin-back">← Back to workspace selection</Link>
        <span>FOUNDATION MANAGEMENT <i /> DASHBOARD</span>
      </header>

      <section className="admin-dashboard-content">
        <div className="admin-dashboard-heading">
          <div>
            <span className="admin-eyebrow">FOUNDATION MANAGEMENT</span>
            <h1>Dashboard</h1>
            <p className="admin-dashboard-lede">
              Your operational workspace for monitoring and coordinating R1CF’s work.
              These tools bring programme information, enquiries and reporting together
              as the foundation’s management systems take shape.
            </p>
          </div>
          <div className="admin-dashboard-overview" aria-label="Four management modules in setup">
            <strong>04</strong>
            <span>MANAGEMENT MODULES</span>
            <small>Being prepared</small>
          </div>
        </div>

        <div className="admin-dashboard-sectionline">
          <span>YOUR MANAGEMENT TOOLS</span>
          <span><i /> WORKSPACE SETUP</span>
        </div>

        <div className="admin-module-grid admin-dashboard-modules">
          {modules.map((module) => (
            <article key={module.number}>
              <div className="admin-module-card-top">
                <span className="admin-module-number">{module.number}</span>
                <span className="admin-module-status"><i /> IN DEVELOPMENT</span>
              </div>
              <h2>{module.title}</h2>
              <p>{module.description}</p>
              <div className="admin-module-card-footer">
                <span>{module.detail}</span>
                <span className="admin-module-setup">Workspace setup</span>
              </div>
            </article>
          ))}
        </div>

        <Link href="/admin" className="admin-return">← Back to workspace selection</Link>
      </section>
    </main>
  );
}
