import { createWidget } from '@typeform/embed';
import '@typeform/embed/build/css/widget.css';
import { get_tf_result } from '../../../utils';
import { getCookie } from '../../../auth';

async function submit_health_insurance(response) {

    const token = getCookie('wized_token');
    const formData = new FormData ();

    formData.append('has_taken_quiz',1);

    response.variables.forEach(variable => {
        if (variable.key === "expat_insurance") {
            formData.append('qualifies_expat_insurance',variable.number);
        } else if (variable.key === "private_insurance") {
            formData.append('qualifies_public_health_insurance',variable.number);
        } else if (variable.key === "public_insurance") {
            formData.append('qualifies_private_health_insurance',variable.number);
        } 
    })

    response.answers.forEach(answer => {
        console.log(answer.field.ref, answer.text);
        switch (answer.field.ref) {
            case 'answer_citizenship': 
                formData.append('citizenship',answer.text);
                break;
            case 'answer_citizenship_2': 
                formData.append('citizenship_2',answer.text);
                break;
            case 'answer_birth_date': 
                formData.append('birth_date',answer.date);
                break;
            case 'answer_country_residence': 
                formData.append('residence_country',answer.text);
                break;
            case 'answer_relocation_date': 
                formData.append('relocation_date',answer.date);
                break;
            case 'answer_relocation_date_2': 
                formData.append('relocation_date',answer.date);
                break;
            case 'answer_health_insurance_status': 
                if (answer.choice.label ==='No') {
                    formData.append('current_health_insurance_status','None');
                } else if (answer.choice.label ==='Only on Expat or Travel Insurance') {
                    //handle expat and travel insurance                
                } 
                break;
            case 'answer_current_health_insurance': 
                if (answer.choice.label ==='Public Insurance (EU/EAA, not Germany)') {
                    formData.append('current_health_insurance_status',answer.choice.label);
                } else if (answer.choice.label ==='Public Insurance from Germany') {
                    formData.append('current_health_insurance_status','Public Insurance Germany');
                } else if (answer.choice.label ==='Private Insurance from (EU/EAA, not Germany)') {
                    formData.append('current_health_insurance_status',answer.choice.label);              
                } else if (answer.choice.label ==='Private Insurance from Germany') {
                    formData.append('current_health_insurance_status','Private Insurance Germany');              
                }
                break;
            case 'answer_occupation': 
                formData.append('occupation_type',answer.choice.label);
                break;
            case 'answer_student_status': 
                formData.append('student_status',answer.choice.label);
                break;
            case 'answer_annual_income': 
                formData.append('income',answer.number);
                break;
            default:
                break;
        }
    });

    for (const pair of formData.entries()) {
        console.log('Form Data: ');
        console.log(`${pair[0]}, ${pair[1]}`);
      }


    try {
        // Make a GET request to the authentication endpoint with the token in the headers.
        const response = await fetch(BASE_URL + '/typeform_submissions/health-insurance', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: formData
        });
        
        // Parse the response to JSON.
        const data = await response.json();

        // Check if the response status indicates success (e.g., 200 OK).
        if (response.ok) {
            return data;
        } else {
            // Log an error message if the token verification failed. 
            // Use the provided error message from the response or a default "Unknown error" message.
            console.error('Retrival of Typform Response failed:', data.message || 'Unknown error');
            return null;
        }
    } catch (error) {
        // Log any errors that occurred during the token verification process.
        console.error('Error verifying token:', error);
        return false;
    }
}

export function render () {

    const options = {
        container: document.querySelector('[w-el="typeform_quiz"]'), 
        hideHeaders: true,
        hideFooter: true,
        opacity: 0,
        height : 600,
        onSubmit: async ({ formId, responseId }) =>  {
            console.log(`Form ${formId} submitted, response id: ${responseId}`)
            const response = await get_tf_result(formId,responseId);
            console.log(response);
            const updated_user = await submit_health_insurance(response);
            console.log(updated_user);
          },
    }

    createWidget('siLiU31K', options)

}

