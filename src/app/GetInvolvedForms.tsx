"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

const enquiryTypes = [
  { id: "sponsor", title: "Sponsor a child", description: "Support school fees, uniforms and learning materials through the Jack Lumpa Education Fund.", subject: "Child sponsorship enquiry", extraLabel: "How would you like to support?", extraOptions: ["Monthly sponsorship", "One-time contribution", "Learning materials or uniforms", "I would like to discuss the options"] },
  { id: "partner", title: "Partner with us", description: "Work alongside R1CF to extend opportunities and amplify impact in communities.", subject: "Partnership enquiry", extraLabel: "What kind of partnership are you interested in?", extraOptions: ["Funding or financial support", "Programme implementation", "In-kind donations", "Institutional or corporate partnership", "Other"] },
  { id: "volunteer", title: "Volunteer your skills", description: "Contribute your experience in mentorship, education, communications or outreach.", subject: "Volunteer enquiry", extraLabel: "How would you like to contribute?", extraOptions: ["Mentorship", "Education and literacy", "Communications and design", "Community outreach", "Administration or professional skills", "Other"] },
];

export default function GetInvolvedForms() {
  const [openForm, setOpenForm] = useState<string | null>(null);
  const [submitting,setSubmitting] = useState(false);
  const [feedback,setFeedback] = useState("");

  async function submitEnquiry(event: FormEvent<HTMLFormElement>, item: typeof enquiryTypes[number]) {
    event.preventDefault();
    if(submitting) return;
    setSubmitting(true); setFeedback("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/form-submissions", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          formType:item.id, formTitle:item.subject,
          name:data.get("name"), email:data.get("email"), phone:data.get("phone"),
          organisation:data.get("organisation"), location:data.get("location"),
          interest:data.get("interest"), message:data.get("message")
        })
      });
      const result = await response.json();
      if(!response.ok) throw new Error(result.error||"We could not submit your form. Please try again.");
      setFeedback("We have sent a verification email to your address. Please open it and click “Verify my email”. Your enquiry will only be delivered to the R1CF team after you verify. The link expires in 24 hours.");
      form.reset();
    } catch(error) {
      setFeedback(error instanceof Error?error.message:"Submission failed. Please try again.");
    } finally { setSubmitting(false); }
  }

  const selected = enquiryTypes.find((item) => item.id === openForm);

  useEffect(() => {
    const requestedForm = new URLSearchParams(window.location.search).get("form");
    if (requestedForm === "sponsor") setOpenForm("sponsor");
  }, []);

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
              <button className="involved-form-toggle" type="button" onClick={() => {setOpenForm(item.id);setFeedback("");}}>
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
        <div className="involved-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) setOpenForm(null); }}>
          <section className="involved-modal" role="dialog" aria-modal="true" aria-labelledby="involved-modal-title">
            <div className="involved-modal-heading">
              <div><span className="eyebrow">Get involved</span><h2 id="involved-modal-title">{selected.title}</h2><p>{selected.description}</p></div>
              <button className="involved-modal-close" type="button" onClick={() => setOpenForm(null)}>Close</button>
            </div>
            <form className="involved-enquiry-form" onSubmit={(event) => submitEnquiry(event, selected)}>
              <div className="involved-form-fields">
                <label>Full name<input name="name" autoComplete="name" required placeholder="Your full name" /></label>
                <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
                <label>Phone / WhatsApp <span>(optional)</span><input name="phone" type="tel" autoComplete="tel" placeholder="+260 ..." /></label>
                <label>Organisation <span>(optional)</span><input name="organisation" autoComplete="organization" placeholder="Organisation or company" /></label>
                <label>Location <span>(optional)</span><input name="location" placeholder="Town or community" /></label>
                <label>{selected.extraLabel}<select name="interest" defaultValue=""><option value="">Please select</option>{selected.extraOptions.map((option) => <option key={option}>{option}</option>)}</select></label>
                <label className="involved-form-message">Tell us a little more<textarea name="message" rows={4} placeholder="Share any details that will help us understand your enquiry." /></label>
              </div>
              {feedback&&<p className="involved-form-feedback" role="status">{feedback}</p>}
              <button className="button button-red" type="submit" disabled={submitting}>{submitting?"Submitting…":"Submit"}</button>
              <p className="involved-form-note">You will receive an email verification link. Your enquiry is sent to our team only after you verify your email address.</p>
            </form>
          </section>
        </div>,
        document.body
      )}
    </section>
  );
}
