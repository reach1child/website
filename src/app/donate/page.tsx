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
    <section className="donate-content"><div className="donate-form-panel"><div className="donate-form-intro"><span className="eyebrow">SUPPORT R1CF</span><h2>Make your donation</h2><p>Choose an amount that feels right for you.</p></div><DonateForm/></div></section>
    <SiteFooter />
  </main>;
}