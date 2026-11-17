import { SiteFooter, SiteHeader } from "../../SiteChrome";

export const metadata = {
  title: "Thank You | Reach One Child Foundation",
  description: "Thank you for choosing to support children through Reach One Child Foundation.",
};

export default function DonationThankYouPage() {
  return <main className="donate-page">
    <SiteHeader />
    <section className="donate-thankyou-wrap">
      <div className="donate-thankyou-card">
        <span className="eyebrow">YOUR SUPPORT MATTERS</span>
        <div className="donate-thankyou-mark" aria-hidden="true">✓</div>
        <h1>Thank you for choosing to support children through R1CF.</h1>
        <p>Please check your email and verify your address. Your donation intention will reach our team after verification. No payment has been taken.</p>
        <a className="button button-red" href="/">Return to homepage</a>
      </div>
    </section>
    <SiteFooter />
  </main>;
}
