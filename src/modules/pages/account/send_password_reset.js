import { setCookie, TOKEN_KEY, sendVerificationMail, checkAuthentication } from "../../auth";
import { setupForm } from "../../form_handling";
import { logging } from "../../utils";


/**
 * Initializes and renders the functionality for sending a password reset link.
 * This function sets up the form used for requesting a password reset.
 */
export function render() {
    try {
        // The setupForm function configures the form behavior,
        // including transforming form data, submitting it, and handling the response.
        setupForm(
            'sendPasswordReset_form', // ID of the form to be setup
            null,
            null, 
            transformFormData,        // Function to transform the form data
            submitFormData,           // Function to submit the form data
            handleResponse,           // Function to handle the response from submission
            false                     // Indicates whether the success wrapper should automatically be shown
        );
    } catch (error) {
        // Log any errors encountered during the password reset form setup
        logging.error({
            message: "Error initializing password reset form: " + error.message,
            eventName: "password_reset_form_initialization_error",
            extra: {} 
        });
    }
}
/**
 * Transforms the form data for submission.
 * 
 * @param {FormData} formData - The original form data.
 * @returns {FormData} - The transformed form data.
 */
function transformFormData(formData) {
    const transformedData = new FormData();
    transformedData.append('email', formData.get('sendPasswordReset_email'));
    return transformedData;
}

/**
 * Submits the email form data to the server to send a password reset email.
 *
 * @param {FormData} formData - The transformed form data.
 * @returns {Promise<Object>} - The response data from the server.
 */
async function submitFormData(inputFormData) {
    const email = inputFormData.get('email');

    // Validate email address format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return { success: false, message: 'Please provide a valid email address.' };
    }

    try {
        const response = await sendVerificationMail(email, "password_reset", DOMAIN_URL + "/account/reset-password");

        if (response.message.success) {
            logging.info({
                message: "Password reset email sent successfully",
                eventName: "password_reset_email_success",
                extra: {}
            });
            return { success: true, message: "Sending password reset link was successful." };
        } else {
            const errorMessage = response.message || 'Sending password reset link failed due to unknown error';
            logging.error({
                message: `Sending password reset link failed: ${errorMessage}`,
                eventName: "password_reset_email_failed",
                extra: { /* response: data */ }
            });
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        logging.error({
            message: "Error during sending password reset link process: " + error.message,
            eventName: "password_reset_email_process_error",
            extra: {}
        });
        return { success: false, message: error.message || "Error occurred during the sending password reset link process" };
    }
}

/**
 * Handles the response after submitting the send password reset form.
 * This function is responsible for updating the UI based on the server's response.
 * 
 * @param {Object} response - The response object received from the form submission.
 */
async function handleResponse(response) {
    // Access the form and its corresponding success message container
    const formElement = document.getElementById('sendPasswordReset_form');
    const successDiv = formElement ? formElement.parentNode.querySelector('[w-el="form_success"]') : null;

    // Display the success message and hide the form if the submission was successful
    if (response.success && formElement && successDiv) {
        formElement.classList.add('hide');
        successDiv.style.display = 'block';
    }
}