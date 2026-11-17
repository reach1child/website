import DonateForm from "../DonateForm";
import { SiteFooter, SiteHeader } from "../SiteChrome";

export const metadata = {
  title: "Donate | Reach One Child Foundation",
  description: "Support education, literacy and opportunities for vulnerable children across Zambia.",
};

export default function DonatePage() {
  return <main className="donate-page">
    <SiteHeader />
    <section className="donate-hero"><span className="eyebrow">MAKE A DIFFERENCE</span><h1>Give a child the chance to <em>learn, grow and thrive.</em></h1><p>Your generosity helps equip vulnerable children across Zambia with education, literacy, mentorship and the support they need to reach their full potential.</p></section>
    <section className="donate-content donate-launch-area"><div className="donate-launch-copy"><span className="eyebrow">YOUR SUPPORT CHANGES LIVES</span><h2>Every contribution creates an opportunity.</h2><p>Choose to make a one-time gift or support children every month. The three-step form will open securely in a pop-up.</p><DonateForm/></div></section>
    <SiteFooter />
  </main>;
}