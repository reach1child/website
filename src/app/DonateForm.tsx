"use client";

import { useState, type FormEvent } from "react";

const amounts = [50, 100, 250, 500, 1000];

export default function DonateForm() {
  const [frequency,setFrequency] = useState<"once"|"monthly">("once");
  const [currency,setCurrency] = useState<"ZMW"|"USD">("ZMW");
  const [amount,setAmount] = useState("100");
  const [custom,setCustom] = useState("");
  const [purpose,setPurpose] = useState("Where it is needed most");
  const [submitting,setSubmitting] = useState(false);
  const [feedback,setFeedback] = useState("");
  const [sent,setSent] = useState(false);

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(submitting) return;
    const value=amount==="other"?Number(custom):Number(amount);
    if(!Number.isFinite(value)||value<=0||value>100000000) {setFeedback("Please enter a valid donation amount.");return;}
    setSubmitting(true);setFeedback("");
    const data=new FormData(event.currentTarget);
    const interest=`${currency} ${value.toLocaleString("en-US")} | ${frequency==="once"?"One-time":"Monthly"} | ${purpose}`;
    const message="Donation intention (payment not yet made)."+(String(data.get("message")||"").trim()?"\n\nDonor note: "+String(data.get("message")).trim():"");
    try {
      const response=await fetch("/api/form-submissions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        formType:"donate",formTitle:"Donation pledge",name:data.get("name"),email:data.get("email"),phone:data.get("phone"),
        organisation:"",location:data.get("location"),interest,message
      })});
      const result=await response.json();
      if(!response.ok) throw new Error(result.error||"We could not submit your donation details. Please try again.");
      setSent(true);
      setFeedback("Thank you for choosing to support children through R1CF. Please check your email and verify your address. Your donation intention will reach our team after verification. No payment has been taken.");
      (event.currentTarget as HTMLFormElement).reset();
    } catch(error) {setFeedback(error instanceof Error?error.message:"We could not submit your details. Please try again.");}
    finally {setSubmitting(false);}
  }

  return <form className="donation-form" onSubmit={submit}>
    <div className="donation-frequency" role="group" aria-label="Donation frequency">
      <button type="button" className={frequency==="once"?"active":""} onClick={()=>setFrequency("once")}>Give once</button>
      <button type="button" className={frequency==="monthly"?"active":""} onClick={()=>setFrequency("monthly")}>Give monthly</button>
    </div>
    <div className="donation-field-heading"><span>Choose your contribution</span><label>Currency<select value={currency} onChange={e=>setCurrency(e.target.value as "ZMW"|"USD")}><option value="ZMW">ZMW · Zambian Kwacha</option><option value="USD">USD · US Dollar</option></select></label></div>
    <div className="donation-amounts">{amounts.map(value=><button type="button" key={value} className={amount===String(value)?"active":""} onClick={()=>{setAmount(String(value));setCustom("");}}>{currency==="ZMW"?"K":"$"}{value.toLocaleString("en-US")}</button>)}<button type="button" className={amount==="other"?"active":""} onClick={()=>setAmount("other")}>Other</button></div>
    {amount==="other"&&<label className="donation-custom">Enter amount ({currency})<input type="number" min="1" step="0.01" value={custom} onChange={e=>setCustom(e.target.value)} placeholder="Enter your amount" required/></label>}
    <label className="donation-purpose">I would like my gift to support<select value={purpose} onChange={e=>setPurpose(e.target.value)}><option>Where it is needed most</option><option>Education and child sponsorship</option><option>Literacy and learning</option><option>Menstrual health and dignity</option><option>Nutrition and wellbeing</option></select></label>
    <div className="donation-divider"/>
    <h2>Your details</h2>
    <div className="donation-details-grid">
      <label>Full name<input name="name" autoComplete="name" required placeholder="Your full name"/></label>
      <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com"/></label>
      <label>Phone / WhatsApp <span>(optional)</span><input name="phone" type="tel" autoComplete="tel" placeholder="+260 ..."/></label>
      <label>Town / country <span>(optional)</span><input name="location" autoComplete="country-name" placeholder="e.g. Lusaka, Zambia"/></label>
      <label className="donation-note">A message for our team <span>(optional)</span><textarea name="message" rows={3} placeholder="Add a note (optional)"/></label>
    </div>
    <p className="donation-consent">By submitting, you agree that R1CF may use these details to contact you about your donation. We will ask you to verify your email address before your details are delivered to our team.</p>
    {feedback&&<p className={"donation-feedback"+(sent?" success":"")} role="status">{feedback}</p>}
    <button className="button button-red donation-submit" type="submit" disabled={submitting}>{submitting?"Submitting…":"Continue with donation"}</button>
    <p className="donation-secure-note">Payment processing will be added through a secure third-party provider. This form does not collect card or bank details and does not process a payment.</p>
  </form>;
}