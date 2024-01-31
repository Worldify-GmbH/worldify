import { getModuleStatus } from "../../../utils";

export async function render(){

    const insurance_status = await getModuleStatus('health_insurance');

    console.log(insurance_status)

    const public_health_insurance = document.querySelector('[w-el="public_health_insurance"]');
    const private_health_insurance = document.querySelector('[w-el="private_health_insurance"]');
    const expat_health_insurance = document.querySelector('[w-el="expat_health_insurance"]');
    const travel_health_insurance = document.querySelector('[w-el="travel_health_insurance"]');

    const title = document.querySelector('.finder-result_title');

    if (insurance_status.has_taken_quiz) {
        title.classList.remove('hide');
    } else {
        // Do nothing for now
    }

    if (insurance_status.qualifies_public_health_insurance) {
        public_health_insurance.classList.remove('hide');
    }
    if (insurance_status.qualifies_private_health_insurance) {
        private_health_insurance.classList.remove('hide');
    } 
    if (insurance_status.qualifies_expat_insurance) {
        expat_health_insurance.classList.remove('hide');
    } 
    if (insurance_status.qualifies_travel_insurance) {
        travel_health_insurance.classList.remove('hide');
    } 
    
}