import DonateForm from "../DonateForm";

export const metadata = {
  title: "Donate | Reach One Child Foundation",
  description: "Support education, literacy and opportunities for vulnerable children across Zambia.",
};

export default function DonatePage() {
  return <main className="donate-page">
    <header className="donate-page-header"><a href="/" className="donate-brand"><img src="/images/branding/logo.jpeg" alt="Reach One Child Foundation"/><span><strong>REACH ONE CHILD</strong><small>FOUNDATION</small></span></a><a href="/" className="donate-back">Back to website</a></header>
    <section className="donate-hero"><span className="eyebrow">MAKE A DIFFERENCE</span><h1>Give a child the chance to <em>learn, grow and thrive.</em></h1><p>Your generosity helps equip vulnerable children across Zambia with education, literacy, mentorship and the support they need to reach their full potential.</p></section>
    <section className="donate-content"><div className="donate-impact-copy"><span className="eyebrow">YOUR SUPPORT MATTERS</span><h2>Every contribution helps open a door to opportunity.</h2><p>Whether you give once or choose to support our work every month, your generosity helps children access learning, care and the encouragement they deserve.</p><div className="donate-promise"><strong>For every child, education.</strong><span>Educate · Empower · Transform</span></div></div><div className="donate-form-panel"><div className="donate-form-intro"><span className="eyebrow">SUPPORT R1CF</span><h2>Make your donation</h2><p>Choose an amount that feels right for you.</p></div><DonateForm/></div></section>
    <footer className="donate-footer">© 2026 Reach One Child Foundation · Lusaka, Zambia</footer>
  </main>;
}