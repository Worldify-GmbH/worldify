
import '@typeform/embed/build/css/widget.css';
import { attachDatePicker, get_tf_result, setupTypeform } from '../../../utils';
import { getAccountSettings, getCookie } from '../../../auth';
import { autoSaveFunction, debounce, fillFieldsFromDatabase } from '../../../form_handling';


async function submit_visa_results(form_id,response_id) {

    const token = getCookie('wized_token');
    const formData = new FormData ();

    formData.append('form_id',form_id);
    formData.append('response_id',response_id);

    try {
        // Make a GET request to the authentication endpoint with the token in the headers.
        const response = await fetch(BASE_URL + '/typeform_submissions/visa', {
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

export async function render () {

    try {
        // const slide1_externalData = document.querySelector('[w-el="slide1_externalData"]');
        // const slide2_reviewData = document.querySelector('[w-el="slide2_reviewData"]');
        const typeform_quiz = document.querySelector('[w-el="typeform_quiz"]');
        await setupTypeform("typeform_quiz","CnTd15Nl",{},submit_visa_results);

    } catch (error) {
        
    }
}