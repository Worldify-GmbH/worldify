import { getModuleStatus } from "../../../utils";

export async function render(){

    const visa_status = await getModuleStatus('visa');

    const residence_permit = document.querySelector('[w-el="residence_permit"]');
    const blue_card = document.querySelector('[w-el="blue_card"]');
    const freelance_visa = document.querySelector('[w-el="freelance_visa"]');
    const jobseeker_visa = document.querySelector('[w-el="jobseeker_visa"]');
    const family_reunification = document.querySelector('[w-el="family_reunification"]');
    const general_visa_guide = document.querySelector('[w-el="general_visa_guide"]');
    const guide_to_visa = document.querySelector('[w-el="guide_to_visa"]');

    if (visa_status.has_taken_quiz) {
        general_visa_guide.classList.remove('hide');
    } else {
        guide_to_visa.classList.remove('hide');
    }

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

    
}