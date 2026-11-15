export default function AdminUnauthorizedPage() {
  return <main className="admin-auth-page"><section className="admin-auth-card"><span className="admin-auth-kicker">ACCESS RESTRICTED</span><h1>Administrator access required</h1><p>This account is not authorised to access the R1CF administration workspace.</p><a className="admin-auth-button-link" href="/admin-login">Return to sign in</a><a className="admin-auth-back" href="/">Return to website</a></section></main>;
}
