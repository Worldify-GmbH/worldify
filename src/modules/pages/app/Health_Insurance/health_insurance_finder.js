
import '@typeform/embed/build/css/widget.css';
import { attachDatePicker, get_tf_result, setupTypeform } from '../../../utils';
import { getAccountSettings, getCookie } from '../../../auth';
import { autoSaveFunction, debounce, fillFieldsFromDatabase } from '../../../form_handling';


async function submit_health_insurance(form_id,response_id) {

    const token = getCookie('wized_token');
    const formData = new FormData ();

    formData.append('form_id',form_id);
    formData.append('response_id',response_id);

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

export async function render () {

    try {
        const slide1_externalData = document.querySelector('[w-el="slide1_externalData"]');
        const slide2_reviewData = document.querySelector('[w-el="slide2_reviewData"]');
        const typeform_quiz = document.querySelector('[w-el="typeform_quiz"]');

        await setupTypeform("typeform_quiz","pKAID3HA",{},submit_health_insurance);


        // document.querySelector('[w-el="prefill_yes"]').addEventListener('click', async function() {
        //     // Code to handle "Yes" response
        //     slide1_externalData.classList.add('hide');
        //     slide2_reviewData.classList.remove('hide');

        //     attachDatePicker();
        //     const response = await getAccountSettings(getCookie('wized_token'));

        //     if (response.success) {
        //         fillFieldsFromDatabase(response.user, 'account_');
        //         const formWrapper = document.querySelector('[w-el="formWrapper"]');

        //         if (formWrapper) {
        //             formWrapper.addEventListener('change', debounce((event) => autoSaveFunction(event, `${BASE_URL}/account_settings`), 500));
        //         } else {
        //             logging.warning({
        //                 message: 'render: Form wrapper not found',
        //                 eventName: 'render_no_formWrapper',
        //             });
        //         }
        //     } else {
        //         logging.error({
        //             message: 'render: Failed to fetch account settings: ' + response.message,
        //             eventName: 'render_fetch_error',
        //             extra: {}
        //         });
        //         return;
        //     }
        // });
        // document.querySelector('[w-el="proceedToQuiz"]').addEventListener('click', async function() {
        //     // Code to handle "No" response
        //     const response = await getAccountSettings(getCookie('wized_token'));
        //     slide2_reviewData.classList.add('hide');
        //     typeform_quiz.classList.remove('hide');
        //     const hidden_data = {
        //         'citizenship':response.user.citizenship,
        //         'citizenship_2':response.user.citizenship_2,
        //         'residence_country':response.user.residence_country,
        //         'relocation_date':response.user.relocation_date,
        //         'birth_date':response.user.birth_date,
        //         'birth_date_is_before_1969_01_01': response.user.birth_date ? new Date(response.user.birth_date) < new Date('1969-01-01') : null
        //     }
        //     await setupTypeform("typeform_quiz","pKAID3HA",hidden_data,submit_health_insurance);
        // });


        
        // document.querySelector('[w-el="prefill_no"]').addEventListener('click', async function() {
        //     // Code to handle "No" response
        //     slide1_externalData.classList.add('hide');
        //     typeform_quiz.classList.remove('hide');
        //     await setupTypeform("typeform_quiz","siLiU31K",{},submit_health_insurance);
        // });


    } catch (error) {
        
    }
}