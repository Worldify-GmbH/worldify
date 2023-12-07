import { setCookie ,TOKEN_KEY, sendVerificationMail, checkAuthentication } from "../../auth";
import { setupForm } from "../../form_handling";
import { logging } from "../../utils";


/**
 * Renders and sets up the signup functionality.
 * This function is called to initialize the signup page.
 */
export function render() {

    try {
        setupForm('signup_form', transformSignupFormData, submitSignupFormData, handleSignupResponse,false);
    } catch (error) {
        logging.error({
            message: "Error initializing signup form: " + error.message,
            eventName: "signup_initialization_error",
            extra: {}
        });
    }
}

/**
 * Transforms the signup form data for submission.
 * 
 * @param {FormData} formData - The original form data.
 * @returns {FormData} - The transformed form data.
 */
function transformSignupFormData(formData) {
    const transformedData = new FormData();
    transformedData.append('email', formData.get('signup_email'));
    transformedData.append('password', formData.get('signup_password'));
    transformedData.append('confirmPassword', formData.get('signup_confirmPassword'));
    return transformedData;
}

/**
 * Submits the signup form data to the server.
 * 
 * @param {FormData} formData - The transformed form data.
 * @returns {Promise<Object>} - The response data from the server.
 */
async function submitSignupFormData(inputFormData) {
    const email = inputFormData.get('email');
    const password = inputFormData.get('password');
    const confirmPassword = inputFormData.get('confirmPassword');

    // Validate email and passwords
    if (!email || !password || !confirmPassword) {
        return { success: false, message: 'Email, password and password confirmation are required.' };
    }
    // Check for password length (between 7 and 30 characters)
    if (password.length < 7 || password.length > 30){
        return {success: false, message: 'The password needs to be between 7 and 30 characters.'}
    } 
    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return {success: false, message: 'The password needs to contain at least one uppercase letter.'}
    }
    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return {success: false, message: 'The password needs to contain at least one lowercase letter.'}
    }
    // Check for at least one number
    if (!/[0-9]/.test(password)) {
        return {success: false, message: 'The password needs to contain at least one number.'}
    }
    // Check for at least one special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return {success: false, message: 'The password needs to contain at least one special character.'}
    }
    // Check if both passwords match
    if (password !== confirmPassword) {
        return {success: false, message: 'The passwords do not match.'}
    }

    const formData = new FormData();
    formData.append('email',inputFormData.get('email'));
    formData.append('password',inputFormData.get('password'))

    try {
        const response = await fetch(`${AUTH_URL}/auth/signup`, {
            method: 'POST',
            body: formData,
            headers: {}
        });

        const data = await response.json();

        // Check the response status
        if (response.ok) {
            logging.info({
                message: "Signup request successful",
                eventName: "signup_success",
                extra: {}
            });
            return { success: true, message: "Signup successful.", authToken: data.authToken };
        } else {
            const errorMessage = data.message || 'Signup failed due to unknown error';
            logging.error({
                message: `Signup request failed: ${errorMessage}`,
                eventName: "signup_failed",
                extra: { /*response: data*/ }
            });
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        logging.error({
            message: "Error during signup process: " + error.message,
            eventName: "signup_process_error",
            extra: {}
        });
        return { success: false, message: error.message || "Error occurred during the signup process" };
    }
}

/**
 * Handles the response received after signup form submission.
 * 
 * @param {Object} response - The response object received from the form submission.
 */
async function handleSignupResponse(response) {
    const formElement = document.getElementById('signup_form');
    const successDiv = formElement ? formElement.parentNode.querySelector('[w-el="form_success"]') : null;

    if (response.success) {
        try {
            setCookie(TOKEN_KEY, response.authToken);
            if (formElement && successDiv) {
                formElement.classList.add('hide');
                successDiv.style.display = 'block';
            }

            const authResponse = await checkAuthentication();
            if (authResponse.success) {
                await sendVerificationMail(authResponse.user.email, "email_verification", DOMAIN_URL + "/account/onboarding");
            } else {
                logging.warning({
                    message: "Authentication check failed after signup",
                    eventName: "post_signup_auth_check_failed",
                    extra: { /*authResponse*/ }
                });
            }
        } catch (error) {
            logging.error({
                message: "Error in post-signup actions" + error.message,
                eventName: "post_signup_actions_error",
                extra: {}
            });
        }
    } else {
        logging.warning({
            message: "Signup failed: " + response.message,
            eventName: "user_signup_failed",
            extra: { /*response*/ }
        });
    }
}