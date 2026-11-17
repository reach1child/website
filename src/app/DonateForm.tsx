"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

const amounts = [50, 100, 250, 500, 1000];

export default function DonateForm() {
  const [isOpen,setIsOpen] = useState(false);
  const [step,setStep] = useState(1);
  const [frequency,setFrequency] = useState<"once"|"monthly">("once");
  const [currency,setCurrency] = useState<"ZMW"|"USD">("ZMW");
  const [amount,setAmount] = useState("100");
  const [custom,setCustom] = useState("");
  const [purpose,setPurpose] = useState("Where it is needed most");
  const [submitting,setSubmitting] = useState(false);
  const [feedback,setFeedback] = useState("");
  const [sent,setSent] = useState(false);
  const [donorDetails,setDonorDetails] = useState({firstName:"",lastName:"",email:"",phone:"",location:"",message:"",emailUpdates:false});

  const value=amount==="other"?Number(custom):Number(amount);
  const formattedAmount=Number.isFinite(value)&&value>0?value.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}):"—";
  const money=currency==="ZMW"?"ZMW":"USD";

  function nextStep() {
    if(step===1) {
      if(!Number.isFinite(value)||value<=0||value>100000000) {setFeedback("Please enter a valid donation amount.");return;}
      setFeedback("");
      setStep(2);
    }
  }

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(submitting) return;
    const first=donorDetails.firstName.trim();
    const last=donorDetails.lastName.trim();
    if(!first||!last||!donorDetails.email.trim()) {setFeedback("Please complete your name and email address.");setStep(2);return;}
    setSubmitting(true);setFeedback("");
    const interest=`${currency} ${formattedAmount} | ${frequency==="once"?"One-time":"Monthly"} | ${purpose}`;
    const message="Donation intention only — payment has not yet been made.\nEmail updates: "+(donorDetails.emailUpdates?"Opted in":"Not opted in")+(donorDetails.message.trim()?"\n\nDonor note: "+donorDetails.message.trim():"");
    try {
      const response=await fetch("/api/form-submissions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        formType:"donate",formTitle:"Donation pledge",name:`${first} ${last}`,email:donorDetails.email,phone:donorDetails.phone,
        organisation:"",location:donorDetails.location,interest,message
      })});
      const result=await response.json();
      if(!response.ok) throw new Error(result.error||"We could not submit your donation details. Please try again.");
      window.location.assign("/donate/thank-you");

    } catch(error) {setFeedback(error instanceof Error?error.message:"We could not submit your details. Please try again.");}
    finally {setSubmitting(false);}
  }

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape" && !submitting) setIsOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", closeOnEscape); };
  }, [isOpen, submitting]);

  return <>
    <button className="button button-red donation-open-trigger" type="button" onClick={() => { setStep(1); setFeedback(""); setIsOpen(true); }}>Donate</button>
    {isOpen && typeof document !== "undefined" && createPortal(
      <div className="involved-modal-backdrop donation-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) setIsOpen(false); }}>
        <section className="involved-modal donation-modal" role="dialog" aria-modal="true" aria-labelledby="donation-modal-title">
          <div className="involved-modal-heading">
            <div><span className="eyebrow">SUPPORT R1CF</span><h2 id="donation-modal-title">Make your donation</h2><p>Choose an amount that feels right for you. Your support helps children across Zambia.</p></div>
            <button className="involved-modal-close" type="button" disabled={submitting} onClick={() => setIsOpen(false)}>Close</button>
          </div>
          <form className="donation-form donation-wizard" noValidate onSubmit={submit}>
    <div className="donation-steps" aria-label="Donation progress">
      {[["1","Your gift"],["2","Your details"],["3","Payment"]].map(([number,label],index)=><div key={number} className={"donation-step"+(step===index+1?" active":step>index+1?" complete":"")}><span>{number}</span><small>{label}</small></div>)}
    </div>

    {step===1&&<section className="donation-step-panel" aria-labelledby="donation-step-one">
      <div className="donation-step-heading"><span className="eyebrow">STEP 1 OF 3</span><h2 id="donation-step-one">Choose your gift</h2><p>Your contribution helps children across Zambia access education, care and opportunity.</p></div>
      <div className="donation-frequency" role="group" aria-label="Donation frequency">
        <button type="button" className={frequency==="monthly"?"active":""} onClick={()=>setFrequency("monthly")}>Monthly</button>
        <button type="button" className={frequency==="once"?"active":""} onClick={()=>setFrequency("once")}>Give once</button>
      </div>
      <div className="donation-field-heading"><span>Donation amounts</span><label>Currency<select value={currency} onChange={e=>setCurrency(e.target.value as "ZMW"|"USD")}><option value="ZMW">ZMW · Zambian Kwacha</option><option value="USD">USD · US Dollar</option></select></label></div>
      <div className="donation-amounts">{(frequency==="monthly"?[320,400,910]:[360,730,1500]).map(v=><button type="button" key={v} className={amount===String(v)?"active":""} onClick={()=>{setAmount(String(v));setCustom("");}}>{currency==="ZMW"?"K":"$"}{v.toLocaleString("en-US")}</button>)}<button type="button" className={amount==="other"?"active":""} onClick={()=>setAmount("other")}>Other</button></div>
      {amount==="other"&&<label className="donation-custom">Enter amount ({currency})<input type="number" min="1" step="0.01" value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Enter your amount" required/></label>}
      <label className="donation-purpose">I would like my gift to support<select value={purpose} onChange={e=>setPurpose(e.target.value)}><option>Where it is needed most</option><option>Education and child sponsorship</option><option>Literacy and learning</option><option>Menstrual health and dignity</option><option>Nutrition and wellbeing</option></select></label>
      <div className="donation-summary-line"><span>Your selected gift</span><strong>{money} {formattedAmount} · {frequency==="once"?"One-time":"Monthly"}</strong></div>
      {feedback&&!sent&&<p className="donation-feedback" role="alert">{feedback}</p>}
      <button className="button button-red donation-submit" type="button" onClick={nextStep}>Donate</button>
    </section>}

    {step===2&&<section className="donation-step-panel" aria-labelledby="donation-step-two">
      <div className="donation-step-heading"><span className="eyebrow">STEP 2 OF 3</span><h2 id="donation-step-two">Your details</h2><p>Tell us who is making this contribution.</p></div>
      <div className="donation-summary-line"><span>You are giving a {frequency==="once"?"one-time":"monthly"} donation of</span><strong>{money} {formattedAmount}</strong></div>
      <div className="donation-details-grid">
        <label>First name<input name="firstName" autoComplete="given-name" required placeholder="First name"/></label>
        <label>Last name<input name="lastName" autoComplete="family-name" required placeholder="Last name"/></label>
        <label className="donation-full-width">Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com"/></label>
        <label className="donation-full-width">Phone number <span>(optional)</span><input name="phone" type="tel" autoComplete="tel" placeholder="+260 ..."/></label>
        <label className="donation-full-width">Town / country <span>(optional)</span><input name="location" autoComplete="country-name" placeholder="e.g. Lusaka, Zambia"/></label>
        <label className="donation-full-width">A message for our team <span>(optional)</span><textarea name="message" rows={3} placeholder="Add a note (optional)"/></label>
      </div>
      <label className="donation-optin"><input type="checkbox" name="emailUpdates"/> Yes, I would like to receive occasional updates from Reach One Child Foundation by email.</label>
      <p className="donation-consent">Your donation receipt and verification message will be sent to the email address you provide. You can opt out of optional updates at any time.</p>
      {feedback&&!sent&&<p className="donation-feedback" role="alert">{feedback}</p>}
      <div className="donation-step-actions"><button className="donation-back-button" type="button" onClick={()=>{setFeedback("");setStep(1);}}>Back</button><button className="button button-red donation-submit" type="button" onClick={()=>{const form=document.querySelector<HTMLFormElement>(".donation-wizard");if(!form)return;const first=form.elements.namedItem("firstName") as HTMLInputElement;const last=form.elements.namedItem("lastName") as HTMLInputElement;const email=form.elements.namedItem("email") as HTMLInputElement;if(!first.value.trim()||!last.value.trim()||!email.value.trim()||!email.validity.valid){form.reportValidity();return;}setDonorDetails({firstName:first.value.trim(),lastName:last.value.trim(),email:email.value.trim(),phone:(form.elements.namedItem("phone") as HTMLInputElement).value.trim(),location:(form.elements.namedItem("location") as HTMLInputElement).value.trim(),message:(form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),emailUpdates:(form.elements.namedItem("emailUpdates") as HTMLInputElement).checked});setFeedback("");setStep(3);}}>Continue</button></div>
    </section>}

    {step===3&&<section className="donation-step-panel" aria-labelledby="donation-step-three">
      <div className="donation-step-heading"><span className="eyebrow">STEP 3 OF 3</span><h2 id="donation-step-three">Secure payment</h2><p>Review your gift before proceeding.</p></div>
      <div className="donation-summary-card"><span>You are giving a {frequency==="once"?"one-time":"monthly"} donation of</span><strong>{money} {formattedAmount}</strong><small>Purpose: {purpose}</small></div>
      <div className="donation-payment-placeholder"><strong>Secure payment partner</strong><p>Card payments will be completed through R1CF’s secure third-party payment provider. Your card number, expiry date and CVC will be entered directly with that provider — never stored on this website.</p><span>Payment integration is being prepared. No payment will be taken at this stage.</span></div>
      {feedback&&<p className={"donation-feedback"+(sent?" success":"")} role="status">{feedback}</p>}
      {!sent&&<><div className="donation-step-actions"><button className="donation-back-button" type="button" onClick={()=>{setFeedback("");setStep(2);}}>Back</button><button className="button button-red donation-submit" type="submit" disabled={submitting}>{submitting?"Submitting…":"Submit donation intention"}</button></div><p className="donation-secure-note">After submitting, we’ll email you a verification link. Your donation intention reaches the R1CF team only after you verify your email. This does not process a payment.</p></>}
    </section>}
          </form>
        </section>
      </div>,
      document.body
    )}
  </>;
}
