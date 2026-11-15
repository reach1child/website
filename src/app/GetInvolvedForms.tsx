"use client";

import { useState } from "react";

const enquiryTypes = [
  {
    id: "sponsor",
    number: "01",
    title: "Sponsor a child",
    description: "Support school fees, uniforms and learning materials through the Jack Lumpa Education Fund.",
    subject: "Child sponsorship enquiry",
    extraLabel: "How would you like to support?",
    extraOptions: ["Monthly sponsorship", "One-time contribution", "Learning materials or uniforms", "I would like to discuss the options"],
  },
  {
    id: "partner",
    number: "02",
    title: "Partner with us",
    description: "Work alongside R1CF to extend opportunities and amplify impact in communities.",
    subject: "Partnership enquiry",
    extraLabel: "What kind of partnership are you interested in?",
    extraOptions: ["Funding or financial support", "Programme implementation", "In-kind donations", "Institutional or corporate partnership", "Other"],
  },
  {
    id: "volunteer",
    number: "03",
    title: "Volunteer your skills",
    description: "Contribute your experience in mentorship, education, communications or outreach.",
    subject: "Volunteer enquiry",
    extraLabel: "How would you like to contribute?",
    extraOptions: ["Mentorship", "Education and literacy", "Communications and design", "Community outreach", "Administration or professional skills", "Other"],
  },
  {
    id: "share",
    number: "04",
    title: "Spread the word",
    description: "Share our campaigns and help more people discover the work of R1CF.",
    subject: "Share our work",
    extraLabel: "How can you help spread the word?",
    extraOptions: ["Share R1CF on social media", "Introduce R1CF to my network", "Share a campaign or event", "Explore media or communications support"],
  },
];

export default function GetInvolvedForms() {
  const [openForm, setOpenForm] = useState<string | null>(null);

  function submitEnquiry(event: React.FormEvent<HTMLFormElement>, subject: string) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const lines = [
      "Website enquiry: " + subject,
      "",
      "Name: " + data.get("name"),
      "Email: " + data.get("email"),
      "Phone / WhatsApp: " + (data.get("phone") || "Not provided"),
      "Organisation: " + (data.get("organisation") || "Not provided"),
      "Location: " + (data.get("location") || "Not provided"),
      "Area of interest: " + (data.get("interest") || "Not specified"),
      "",
      "Message:",
      data.get("message") || "No additional message",
    ];
    const mailto = "mailto:reach1childfoundation@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
    window.location.href = mailto;
  }

  return (
    <section className="get-involved get-involved-page">
      <div className="container involved-grid">
        <div className="involved-intro">
          <span className="eyebrow eyebrow-light">Take the next step</span>
          <h2>Choose how you would like to get involved.</h2>
          <p>Select an option below and complete a short enquiry form. Our team will be glad to hear from you.</p>
        </div>
        <div className="involved-actions">
          {enquiryTypes.map((item) => (
            <article className={"involved-form-card" + (openForm === item.id ? " is-open" : "")} key={item.id}>
              <button
                className="involved-form-toggle"
                type="button"
                aria-expanded={openForm === item.id}
                onClick={() => setOpenForm(openForm === item.id ? null : item.id)}
              >
                <span className="involved-form-number">{item.number}</span>
                <span className="involved-form-copy">
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                  <em>{openForm === item.id ? "Close form" : "Complete enquiry form"}</em>
                </span>
                <span className="involved-form-plus" aria-hidden="true">{openForm === item.id ? "−" : "+"}</span>
              </button>
              {openForm === item.id && (
                <form className="involved-enquiry-form" onSubmit={(event) => submitEnquiry(event, item.subject)}>
                  <div className="involved-form-fields">
                    <label>Full name<input name="name" autoComplete="name" required placeholder="Your full name" /></label>
                    <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
                    <label>Phone / WhatsApp <span>(optional)</span><input name="phone" type="tel" autoComplete="tel" placeholder="+260 ..." /></label>
                    <label>Organisation <span>(optional)</span><input name="organisation" autoComplete="organization" placeholder="Organisation or company" /></label>
                    <label>Location <span>(optional)</span><input name="location" placeholder="Town or community" /></label>
                    <label>{item.extraLabel}<select name="interest" defaultValue=""><option value="">Please select</option>{item.extraOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
                    <label className="involved-form-message">Tell us a little more<textarea name="message" rows={4} placeholder="Share any details that will help us understand your enquiry." /></label>
                  </div>
                  <button className="button button-red" type="submit">Send enquiry</button>
                  <p className="involved-form-note">Your email app will open with your completed enquiry ready to send to R1CF.</p>
                </form>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
