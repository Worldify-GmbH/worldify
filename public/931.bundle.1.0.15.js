"use strict";(self.webpackChunkworldify=self.webpackChunkworldify||[]).push([[931],{931:(e,n,t)=>{t.r(n),t.d(n,{render:()=>c});var s=t(401),o=t(338),r=t(797);async function c(){try{(0,r.vI)();const e=await(0,s.getAccountSettings)((0,s.getCookie)("wized_token"));if(!e.success)return void r.PW.error({message:"render: Failed to fetch account settings: "+e.message,eventName:"render_fetch_error",extra:{}});{(0,o.Mk)(e.user,"account_");const n=document.querySelector('[w-el="formWrapper"]');n?n.addEventListener("change",(0,o.Ds)((e=>(0,o.Gt)(e,"https://xfa3-mghj-yd9n.n7c.xano.io/api:ghdeJJTr/account_settings")),500)):r.PW.warning({message:"render: Form wrapper not found",eventName:"render_no_formWrapper"})}(0,o.EV)("account_change_mail",null,null,l,s.emailReset,a),(0,o.EV)("account_change_password",null,null,d,s.resetPassword,i)}catch(e){r.PW.error({message:"Error in render function: "+e.message,eventName:"render_exception",extra:{}})}}async function a(e){const n=document.getElementById("account_change_mail"),t=n.parentNode.querySelector('[w-el="form_success"]');e.success&&(n.reset(),n.classList.add("hide"),t.style.display="block",setTimeout((()=>{t.style.display="none",n.classList.remove("hide"),(0,s.deleteCookie)("wized_token"),(0,s.redirectToLogin)()}),5e3))}async function i(e){const n=document.getElementById("account_change_password"),t=n.parentNode.querySelector('[w-el="form_success"]');e.success&&(n.reset(),n.classList.add("hide"),t.style.display="block",setTimeout((()=>{t.style.display="none",n.classList.remove("hide"),(0,s.deleteCookie)("wized_token"),(0,s.redirectToLogin)()}),5e3))}function d(e){const n=e.get("account_password"),t=e.get("account_password_confirm"),s=new FormData;return s.append("password",n),s.append("confirmPassword",t),s}function l(e){const n=e.get("account_mail"),t=e.get("account_mail_confirm"),s=new FormData;return s.append("email",n),s.append("confirmEmail",t),s}}}]);
//# sourceMappingURL=931.bundle.1.0.15.js.map