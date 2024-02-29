import { setCookie, TOKEN_KEY, sendVerificationMail, checkAuthentication } from "../../auth";
import { setupForm } from "../../form_handling";
import { logging } from "../../utils";


/**
 * Initializes and renders the functionality for resending an email verification link.
 * This function sets up the form used for requesting email verification.
 */
export function render() {
    try {
        // The setupForm function configures the form behavior,
        // including transforming form data, submitting it, and handling the response.
        // This is specifically tailored for the email verification process.
        setupForm(
            'sendEmailVerification_form', // ID of the form to be setup
            null,
            null,
            transformFormData,            // Function to transform the form data
            submitFormData,               // Function to submit the form data
            handleResponse,               // Function to handle the response from submission
            false                         // Indicates whether the success wrapper should automatically be shown
        );
    } catch (error) {
        // Log any errors encountered during the email verification form setup
        logging.error({
            message: "Error initializing email verification form: " + error.message,
            eventName: "email_verification_form_initialization_error",
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
    transformedData.append('email', formData.get('sendEmailVerification_email'));
    return transformedData;
}

/**
 * Submits the email form data to the server to resend an email verification link.
 *
 * @param {FormData} formData - The transformed form data containing the user's email.
 * @returns {Promise<Object>} - The response data from the server.
 */
async function submitFormData(inputFormData) {
    const email = inputFormData.get('email');

    // Validate the format of the email address
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return { success: false, message: 'Please provide a valid email address.' };
    }

    try {
        // Send the email verification link to the provided email address
        const response = await sendVerificationMail(email, "email_verification", DOMAIN_URL + "/account/onboarding");

        // Handle the response based on whether the email was successfully sent
        if (response.message.success) {
            logging.info({
                message: "Email verification link sent successfully to: " + email,
                eventName: "email_verification_link_sent",
                extra: {}
            });
            return { success: true, message: "Email verification link sent successfully." };
        } else {
            const errorMessage = response.message || 'Unknown error occurred while sending the verification link';
            logging.error({
                message: `Failed to send email verification link to ${email}: ${errorMessage}`,
                eventName: "email_verification_link_failed",
                extra: {}
            });
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        logging.error({
            message: `Error during the email verification link sending process to email ${email}: ${error.message}`,
            eventName: "email_verification_link_sending_error",
            extra: {}
        });
        return { success: false, message: error.message || "An error occurred during the email verification link sending process" };
    }
}

/**
 * Handles the response after submitting the email verification resend form.
 * This function updates the UI based on the server's response, indicating whether
 * the email verification link was successfully sent or not.
 * 
 * @param {Object} response - The response object received from the form submission.
 */
async function handleResponse(response) {
    // Access the form and its corresponding success message container
    const formElement = document.getElementById('sendEmailVerification_form');
    const successDiv = formElement ? formElement.parentNode.querySelector('[w-el="form_success"]') : null;

    // Display the success message and hide the form if the email verification link was sent successfully
    if (response.success && formElement && successDiv) {
        formElement.classList.add('hide'); // Hide the form
        successDiv.style.display = 'block'; // Display the success message
    }
}