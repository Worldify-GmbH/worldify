import { getCookie, getQueryParam, checkAuthentication} from "../../auth";
import { setupForm } from "../../form_handling";
import { attachDatePicker, logging } from "../../utils";

/**
 * Renders the page and initializes functionality.
 * This function handles the verification process and sets up onboarding forms.
 */
export async function render() {
    const successBanner = document.querySelector('[w-el="verification_success"]');
    const failedBanner = document.querySelector('[w-el="verification_failed"]');
    attachDatePicker();

    // Check if user is already verified
    try {
        const authResponse = await checkAuthentication();

        if (authResponse.success && !authResponse.user.is_verified) {
            const magicToken = getQueryParam('token');
            const formData = new FormData();
            formData.append('magic_token', magicToken);

            try {
                const response = await fetch(`${AUTH_URL}/auth/magic-login`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    const authCheckResponse = await checkAuthentication();

                    if (authCheckResponse.user.is_verified) {
                        successBanner.classList.remove('hide');
                        setTimeout(() => successBanner.classList.add('hide'), 10000);
                    } else {
                        failedBanner.classList.remove('hide');
                        setTimeout(() => failedBanner.classList.add('hide'), 10000);
                    }
                } else {
                    failedBanner.classList.remove('hide');
                    setTimeout(() => failedBanner.classList.add('hide'), 10000);
                }
            } catch (error) {
                logging.error({
                    message: `Error with magic login: ${error.message}`,
                    eventName: "magic_login_error",
                    extra: { /*errorDetails: error.message*/ }
                });
            }
        }
    } catch (error) {
        logging.error({
            message: `Authentication check failed: ${error.message}`,
            eventName: "auth_check_failure",
            extra: { /*errorDetails: error.message*/ }
        });
    }

    // Setup onboarding forms
    setupForm('onboarding_form_1', transformOnboardingFormData, submitOnboardingFormData, handleOnboardingResponse1, false);
    setupForm('onboarding_form_2', transformOnboardingFormData, submitOnboardingFormData, handleOnboardingResponse2, false);
}

/**
 * Transforms the onboarding form data for submission.
 * This function iterates over the provided FormData object, adjusts the keys for nested objects,
 * and constructs a new FormData object with the transformed data.
 * 
 * @param {FormData} formData - The original form data from the onboarding form.
 * @returns {FormData} - The transformed FormData object.
 */
function transformOnboardingFormData(formData) {

    const transformedData = new FormData();

    for (const [key, value] of formData.entries()) {
        // Remove prefix and handle nested object naming
        const fieldName = key.split("_").slice(1).join("_");

        // Splitting the key based on '__' to handle nested objects
        const parts = fieldName.split('__');

        // Determine if the form field is nested and append data accordingly
        if (parts.length === 2) {
            const [objectName, objectKey] = parts;
            transformedData.append(`${objectName}[${objectKey}]`, value);
        } else {
            transformedData.append(fieldName, value);
        }
    }

    return transformedData;
}

/**
 * Submits the onboarding form data to the server.
 * This function sends a POST request with the onboarding data and handles the server's response.
 *
 * @param {FormData} inputFormData - The transformed form data for onboarding.
 * @returns {Promise<Object>} - The response object from the server, indicating success or failure.
 */
async function submitOnboardingFormData(inputFormData) {
    // Retrieve the authentication token from cookies
    const token = getCookie("wized_token");

    try {
        // Send a POST request to the server with the onboarding data
        const response = await fetch(`${BASE_URL}/onboarding`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: inputFormData,
        });

        // Parse the JSON response from the server
        const data = await response.json();

        // Check if the response status is OK (successful)
        if (response.ok) {
            // Log successful submission and return a success message
            logging.info({
                message: "Onboarding form submission successful",
                eventName: "onboarding_submission_success",
                extra: {}
            });
            return { success: true, message: "Submitting onboarding information was successful." };
        } else {
            // Log failed submission and return an error message
            const errorMessage = data.message || 'Onboarding submission failed due to an unknown error';
            logging.error({
                message: `Onboarding form submission failed: ${errorMessage}`,
                eventName: "onboarding_submission_failed",
                extra: {}
            });
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        // Log any exceptions that occur during the submission process
        logging.error({
            message: `Error during onboarding form submission process: ${error.message}`,
            eventName: "onboarding_submission_process_error",
            extra: {}
        });
        return { success: false, message: error.message || "Error occurred during the onboarding submission process" };
    }
}

/**
 * Handles the response received after the first onboarding form submission.
 * This function is responsible for hiding the current form and showing the next form 
 * in the onboarding process based on the response received.
 * 
 * @param {Object} response - The response object received from the form submission.
 */
async function handleOnboardingResponse1(response) {
    // Access the parent elements of the onboarding forms
    const formElement = document.getElementById('onboarding_form_1').parentElement;
    const nextFormElement = document.getElementById('onboarding_form_2').parentElement;

    // Ensure both elements are found before manipulating their classes
    if (formElement && nextFormElement) {
        // Hide the current form and display the next form
        formElement.classList.add('hide');
        nextFormElement.classList.remove('hide');
    }
}


/**
 * Handles the response received after the second onboarding form submission.
 * This function is responsible for hiding the current form and showing the next section,
 * which is the pricing information, based on the response received.
 * 
 * @param {Object} response - The response object received from the form submission.
 */
async function handleOnboardingResponse2(response) {
    // Access the parent element of the current onboarding form and the pricing section element
    const formElement = document.getElementById('onboarding_form_2').parentElement;
    const nextFormElement = document.getElementById('onboarding_pricing');

    // Ensure both elements are found before manipulating their classes
    if (formElement && nextFormElement) {
        // Hide the current form and display the pricing section
        formElement.classList.add('hide');
        nextFormElement.classList.remove('hide');
    }
}
