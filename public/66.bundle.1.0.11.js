"use strict";(self.webpackChunkworldify=self.webpackChunkworldify||[]).push([[66],{66:(e,a,n)=>{n.r(a),n.d(a,{render:()=>o});var r=n(18),t=(n(29),n(797)),s=n(401);function o(){const e={container:document.querySelector('[w-el="typeform_quiz"]'),hideHeaders:!0,hideFooter:!0,opacity:0,height:600,onSubmit:async({formId:e,responseId:a})=>{console.log(`Form ${e} submitted, response id: ${a}`);const n=await(0,t.QL)(e,a);console.log(n);const r=await async function(e){const a=(0,s.getCookie)("wized_token"),n=new FormData;n.append("has_taken_quiz",1),e.variables.forEach((e=>{"expat_insurance"===e.key?n.append("needs_expat_insurance",e.number):"private_insurance"===e.key?n.append("needs_public_health_insurance",e.number):"public_insurance"===e.key&&n.append("needs_private_health_insurance",e.number)})),e.answers.forEach((e=>{switch(console.log(e.field.ref,e.text),e.field.ref){case"answer_citizenship":n.append("citizenship",e.text);break;case"answer_citizenship_2":n.append("citizenship_2",e.text);break;case"answer_birth_date":n.append("birth_date",e.date);break;case"answer_country_residence":n.append("residence_country",e.text);break;case"answer_relocation_date":case"answer_relocation_date_2":n.append("relocation_date",e.date);break;case"answer_health_insurance_status":"No"===e.choice.label?n.append("health_insurance_status","not_insured"):e.choice.label;break;case"answer_current_health_insurance":"Public Insurance from an EU/EAA country (not Germany)"===e.choice.label?n.append("health_insurance_status","public_insurnace_not_germany"):"Public Insurance from Germany"===e.choice.label?n.append("health_insurance_status","public_insurance_germany"):"Private Insurance from an EU/EAA country (not Germany)"===e.choice.label?n.append("health_insurance_status","private_insurance_not_germany"):"Private Insurance from Germany"===e.choice.label&&n.append("health_insurance_status","private_insurance_germany");break;case"answer_occupation":case"answer_unemployment_status":case"answer_annual_income":case"answer_annual_income_2":default:break;case"answer_student_status":"I'm a German university student"===e.choice.label?n.append("student_status","german_university_student"):"I'm here on a language study program"===e.choice.label?n.append("student_status","language_study_program"):"I'm another kind of student"===e.choice.label&&n.append("student_status","other")}}));for(const e of n.entries())console.log("Form Data: "),console.log(`${e[0]}, ${e[1]}`);try{const e=await fetch("https://xfa3-mghj-yd9n.n7c.xano.io/api:ghdeJJTr/typeform_submissions/health-insurance",{method:"POST",headers:{Authorization:"Bearer "+a},body:n}),r=await e.json();return e.ok?r:(console.error("Retrival of Typform Response failed:",r.message||"Unknown error"),null)}catch(e){return console.error("Error verifying token:",e),!1}}(n);console.log(r)}};(0,r.createWidget)("Qj9yA3Z7",e)}}}]);
//# sourceMappingURL=66.bundle.1.0.11.js.map