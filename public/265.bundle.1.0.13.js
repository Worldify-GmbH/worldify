"use strict";(self.webpackChunkworldify=self.webpackChunkworldify||[]).push([[265],{265:(e,s,r)=>{r.r(s),r.d(s,{render:()=>n});var t=r(401),a=r(338),o=r(797);async function n(){const e=document.querySelector('[w-el="verification_success"]'),s=document.querySelector('[w-el="verification_failed"]');try{null!==(0,t.getCookie)(t.TOKEN_KEY)&&(0,t.deleteCookie)(t.TOKEN_KEY);const r=(0,t.getQueryParam)("token");if(!r)return void i(s,6e3,t.redirectSendPasswordReset);const a=new FormData;a.append("magic_token",r);try{const r=await fetch("https://xfa3-mghj-yd9n.n7c.xano.io/api:xhKh0vlR/auth/magic-login",{method:"POST",body:a}),o=await r.json();r.ok?((0,t.setCookie)(t.TOKEN_KEY,o),(await(0,t.checkAuthentication)()).user.id?i(e,1e4):i(s,6e3,t.redirectSendPasswordReset)):i(s,6e3,t.redirectSendPasswordReset)}catch(e){o.PW.error({message:`Error with magic token validation: ${e.message}`,eventName:"magic_token_validation_error",extra:{}})}}catch(e){o.PW.error({message:`Error during reset password page initialization: ${e.message}`,eventName:"reset_password_page_init_error",extra:{}})}(0,a.EV)("resetPassword_form",c,t.resetPassword,d,!1)}function i(e,s,r=null){e.classList.remove("hide"),setTimeout((()=>{e.classList.add("hide"),r&&r()}),s)}function c(e){const s=new FormData,r=e.get("resetPassword_password"),t=e.get("resetPassword_confirmPassword");return s.append("password",r),s.append("confirmPassword",t),s}async function d(e){const s=document.getElementById("resetPassword_form"),r=s?s.parentNode.querySelector('[w-el="form_success"]'):null;e.success?s&&r&&(s.classList.add("hide"),r.style.display="block",o.PW.info({message:"Reset password successful",eventName:"reset_password_success"})):o.PW.error({message:"Reset password failed: "+(e.message||"Unknown error"),eventName:"reset_password_failure",extra:{}})}}}]);
//# sourceMappingURL=265.bundle.1.0.13.js.map