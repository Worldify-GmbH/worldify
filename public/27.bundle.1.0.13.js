"use strict";(self.webpackChunkworldify=self.webpackChunkworldify||[]).push([[27],{27:(e,s,r)=>{r.r(s),r.d(s,{render:()=>o});var a=r(401),t=r(338),n=r(797);function o(){try{(0,t.EV)("sendPasswordReset_form",i,c,d,!1)}catch(e){n.PW.error({message:"Error initializing password reset form: "+e.message,eventName:"password_reset_form_initialization_error",extra:{}})}}function i(e){const s=new FormData;return s.append("email",e.get("sendPasswordReset_email")),s}async function c(e){const s=e.get("email");if(!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(s))return{success:!1,message:"Please provide a valid email address."};try{const e=await(0,a.sendVerificationMail)(s,"password_reset","https://www.getworldify.com/account/reset-password");if(e.message.success)return n.PW.info({message:"Password reset email sent successfully",eventName:"password_reset_email_success",extra:{}}),{success:!0,message:"Sending password reset link was successful."};{const s=e.message||"Sending password reset link failed due to unknown error";return n.PW.error({message:`Sending password reset link failed: ${s}`,eventName:"password_reset_email_failed",extra:{}}),{success:!1,message:s}}}catch(e){return n.PW.error({message:"Error during sending password reset link process: "+e.message,eventName:"password_reset_email_process_error",extra:{}}),{success:!1,message:e.message||"Error occurred during the sending password reset link process"}}}async function d(e){const s=document.getElementById("sendPasswordReset_form"),r=s?s.parentNode.querySelector('[w-el="form_success"]'):null;e.success&&s&&r&&(s.classList.add("hide"),r.style.display="block")}}}]);
//# sourceMappingURL=27.bundle.1.0.13.js.map