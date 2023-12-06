import { getCookie, setCookie, redirectToDashboard, TOKEN_KEY } from "../../auth";
import { setupForm } from "../../form_handling";
import { logging } from "../../utils";

/**
 * Renders and sets up the login functionality.
 * This function is called to initialize the login page.
 */
export function render() {
    logging.info({ message: "Initializing login page", eventName: "login_page_initialization" });

    if (window.Webflow) {
        window.Webflow.push(() => {
            try {
                setupForm('login_form', transformLoginFormData, submitLoginFormData, handleLoginResponse,false);
            } catch (e) {
                logging.error({
                    message: "Error initializing login form",
                    eventName: "login_initialization_error",
                    extra: { errorDetails: e.message }
                });
            }
        });
    }
}

/**
 * Transforms the login form data for submission.
 * 
 * @param {FormData} formData - The original form data.
 * @returns {FormData} - The transformed form data.
 */
function transformLoginFormData(formData) {
    const transformedData = new FormData();
    transformedData.append('email',formData.get('email'));
    transformedData.append('password',formData.get('password'));
    return transformedData;
}

/**
 * Submits the login form data to the server.
 * 
 * @param {FormData} inputFormData - The transformed form data for login.
 * @returns {Promise<Object>} - An object containing the success status and message.
 */
async function submitLoginFormData(inputFormData) {
    const email = inputFormData.get('email');
    const password = inputFormData.get('password');

    // Validate email and password (optional, based on requirements)
    if (!email || !password) {
        return { success: false, message: 'Email and password are required.' };
    }

    try {
        // Send the POST request to the server
        const response = await fetch(`${AUTH_URL}/auth/login`, {
            method: 'POST',
            body: inputFormData,
            headers: {}
        });

        // Parse the response
        const data = await response.json();

        // Check the response status
        if (response.ok) {
            logging.info({
                message: "Login request successful",
                eventName: "login_success",
                extra: {}
            });
            return { success: true, message: "Login successful.", authToken: data.authToken };
        } else {
            const errorMessage = data.message || 'Login failed due to unknown error';
            logging.error({
                message: `Login request failed: ${errorMessage}`,
                eventName: "login_failed",
                extra: { response: data }
            });
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        logging.error({
            message: "Error during login process",
            eventName: "login_exception",
            extra: { errorDetails: error.message }
        });
        return { success: false, message: error.message || "Error occurred during the login process" };
    }
}

/**
 * Handles the response received after login form submission.
 * 
 * @param {Object} response - The response object received from the form submission.
 */
async function handleLoginResponse(response) {
    if (response.success) {
        setCookie(TOKEN_KEY, response.authToken);
        redirectToDashboard();
        logging.info({
            message: "User logged in successfully",
            eventName: "user_login_success"
        });
    } else {
        logging.warning({
            message: "Login failed: " + response.message,
            eventName: "user_login_failed",
            extra: { response }
        });
        // Handle displaying the error message on the login form
    }
}