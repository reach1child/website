import DonateForm from "../DonateForm";
import { SiteFooter, SiteHeader } from "../SiteChrome";

export const metadata = {
  title: "Donate | Reach One Child Foundation",
  description: "Give a child the chance to learn, grow and thrive.",
};

export default function DonatePage() {
  return <main className="donate-page">
    <SiteHeader />
    <DonateForm openOnMount />
    <SiteFooter />
  </main>;
}
