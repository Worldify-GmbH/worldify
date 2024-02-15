"use strict";(self.webpackChunkworldify=self.webpackChunkworldify||[]).push([[757],{757:(e,i,s)=>{s.r(i),s.d(i,{render:()=>t});var n=s(401),a=s(338),r=s(797);function t(){try{(0,a.EV)("sendEmailVerification_form",c,o,l,!1)}catch(e){r.PW.error({message:"Error initializing email verification form: "+e.message,eventName:"email_verification_form_initialization_error",extra:{}})}}function c(e){const i=new FormData;return i.append("email",e.get("sendEmailVerification_email")),i}async function o(e){const i=e.get("email");if(!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(i))return{success:!1,message:"Please provide a valid email address."};try{const e=await(0,n.sendVerificationMail)(i,"email_verification","https://www.getworldify.com/account/onboarding");if(e.message.success)return r.PW.info({message:"Email verification link sent successfully to: "+i,eventName:"email_verification_link_sent",extra:{}}),{success:!0,message:"Email verification link sent successfully."};{const s=e.message||"Unknown error occurred while sending the verification link";return r.PW.error({message:`Failed to send email verification link to ${i}: ${s}`,eventName:"email_verification_link_failed",extra:{}}),{success:!1,message:s}}}catch(e){return r.PW.error({message:`Error during the email verification link sending process to email ${i}: ${e.message}`,eventName:"email_verification_link_sending_error",extra:{}}),{success:!1,message:e.message||"An error occurred during the email verification link sending process"}}}async function l(e){const i=document.getElementById("sendEmailVerification_form"),s=i?i.parentNode.querySelector('[w-el="form_success"]'):null;e.success&&i&&s&&(i.classList.add("hide"),s.style.display="block")}}}]);
//# sourceMappingURL=757.bundle.1.0.10.js.map