"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

const enquiryTypes = [
  { id: "sponsor", title: "Sponsor a child", description: "Support school fees, uniforms and learning materials through the Jack Lumpa Education Fund.", subject: "Child sponsorship enquiry", extraLabel: "How would you like to support?", extraOptions: ["Monthly sponsorship", "One-time contribution", "Learning materials or uniforms", "I would like to discuss the options"] },
  { id: "partner", title: "Partner with us", description: "Work alongside R1CF to extend opportunities and amplify impact in communities.", subject: "Partnership enquiry", extraLabel: "What kind of partnership are you interested in?", extraOptions: ["Funding or financial support", "Programme implementation", "In-kind donations", "Institutional or corporate partnership", "Other"] },
  { id: "volunteer", title: "Volunteer your skills", description: "Contribute your experience in mentorship, education, communications or outreach.", subject: "Volunteer enquiry", extraLabel: "How would you like to contribute?", extraOptions: ["Mentorship", "Education and literacy", "Communications and design", "Community outreach", "Administration or professional skills", "Other"] },
  { id: "share", title: "Spread the word", description: "Share our campaigns and help more people discover the work of R1CF.", subject: "Share our work", extraLabel: "How can you help spread the word?", extraOptions: ["Share R1CF on social media", "Introduce R1CF to my network", "Share a campaign or event", "Explore media or communications support"] },
];

export default function GetInvolvedForms() {
  const [openForm, setOpenForm] = useState<string | null>(null);

  function submitEnquiry(event: FormEvent<HTMLFormElement>, subject: string) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const lines = [
      "Website enquiry: " + subject, "",
      "Name: " + data.get("name"),
      "Email: " + data.get("email"),
      "Phone / WhatsApp: " + (data.get("phone") || "Not provided"),
      "Organisation: " + (data.get("organisation") || "Not provided"),
      "Location: " + (data.get("location") || "Not provided"),
      "Area of interest: " + (data.get("interest") || "Not specified"), "",
      "Message:", data.get("message") || "No additional message",
    ];
    window.location.href = "mailto:reach1childfoundation@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
  }

  const selected = enquiryTypes.find((item) => item.id === openForm);

  useEffect(() => {
    if (!openForm) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenForm(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [openForm]);

  return (
    <section className="get-involved get-involved-page">
      <div className="container involved-grid">
        <div className="involved-actions">
          {enquiryTypes.map((item) => (
            <article className="involved-form-card" key={item.id}>
              <button className="involved-form-toggle" type="button" onClick={() => setOpenForm(item.id)}>
                <span className="involved-form-copy">
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                  <em>Get Started</em>
                </span>
              </button>
            </article>
          ))}
        </div>
      </div>
      {selected && typeof document !== "undefined" && createPortal(
        <div className="involved-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpenForm(null); }}>
          <section className="involved-modal" role="dialog" aria-modal="true" aria-labelledby="involved-modal-title">
            <div className="involved-modal-heading">
              <div><span className="eyebrow">Get involved</span><h2 id="involved-modal-title">{selected.title}</h2><p>{selected.description}</p></div>
              <button className="involved-modal-close" type="button" onClick={() => setOpenForm(null)}>Close</button>
            </div>
            <form className="involved-enquiry-form" onSubmit={(event) => submitEnquiry(event, selected.subject)}>
              <div className="involved-form-fields">
                <label>Full name<input name="name" autoComplete="name" required placeholder="Your full name" /></label>
                <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
                <label>Phone / WhatsApp <span>(optional)</span><input name="phone" type="tel" autoComplete="tel" placeholder="+260 ..." /></label>
                <label>Organisation <span>(optional)</span><input name="organisation" autoComplete="organization" placeholder="Organisation or company" /></label>
                <label>Location <span>(optional)</span><input name="location" placeholder="Town or community" /></label>
                <label>{selected.extraLabel}<select name="interest" defaultValue=""><option value="">Please select</option>{selected.extraOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
                <label className="involved-form-message">Tell us a little more<textarea name="message" rows={4} placeholder="Share any details that will help us understand your enquiry." /></label>
              </div>
              <button className="button button-red" type="submit">Send enquiry</button>
              <p className="involved-form-note">Your email app will open with your completed enquiry ready to send to R1CF.</p>
            </form>
          </section>
        </div>,
        document.body
      )}
    </section>
  );
}
