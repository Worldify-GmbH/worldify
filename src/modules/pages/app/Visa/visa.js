import { getModuleStatus } from "../../../utils";

export async function render(){

    const visa_status = await getModuleStatus('visa');

    const residence_permit = document.querySelector('[w-el="residence_permit"]');
    const blue_card = document.querySelector('[w-el="blue_card"]');
    const freelance_visa = document.querySelector('[w-el="freelance_visa"]');
    const jobseeker_visa = document.querySelector('[w-el="jobseeker_visa"]');
    const family_reunification = document.querySelector('[w-el="family_reunification"]');
    const ict_visa = document.querySelector('[w-el="ict_visa"]');
    const entrepreneur_permit = document.querySelector('[w-el="entrepreneur_permit"]');
    const vocational_student_permit = document.querySelector('[w-el="vocational_student_permit"]');
    const student_permit = document.querySelector('[w-el="student_permit"]');
    const research_permit = document.querySelector('[w-el="research_permit"]');
    const internship_permit = document.querySelector('[w-el="internship_permit"]');
    const language_acquisition_permit = document.querySelector('[w-el="language_acquisition_permit"]');
    const permanent_residency = document.querySelector('[w-el="permanent_residency"]');
    const eu_long_term_permit = document.querySelector('[w-el="eu_long_term_permit"]');

    console.log(visa_status);



    if (visa_status.qualifies_residence_permit) {
        residence_permit.classList.remove('hide');
    }

    if (visa_status.qualifies_blue_card) {
        blue_card.classList.remove('hide');
    }

    if (visa_status.qualifies_freelance_visa) {
        freelance_visa.classList.remove('hide');
    }

    if (visa_status.qualifies_jobseeker_visa) {
        jobseeker_visa.classList.remove('hide');
    }

    if (visa_status.qualifies_family_reunification_visa) {
        family_reunification.classList.remove('hide');
    }

    if (visa_status.qualifies_ict_card) {
        ict_visa.classList.remove('hide');
    }

    if (visa_status.qualifies_entrepreneur) {
        entrepreneur_permit.classList.remove('hide');
    }

    if (visa_status.qualifies_vocational) {
        vocational_student_permit.classList.remove('hide');
    }

    if (visa_status.qualifies_student) {
        student_permit.classList.remove('hide');
    }

    if (visa_status.qualifies_research) {
        research_permit.classList.remove('hide');
    }

    if (visa_status.qualifies_internship) {
        internship_permit.classList.remove('hide');
    }

    if (visa_status.qualifies_language_visa) {
        language_acquisition_permit.classList.remove('hide');
    }

    if (visa_status.qualifies_permanent_residency) {
        permanent_residency.classList.remove('hide');
    }

    if (visa_status.qualifies_eu_perm_res) {
        eu_long_term_permit.classList.remove('hide');
    }
    
}