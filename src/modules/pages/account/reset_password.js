import { getCookie, getQueryParam, checkAuthentication,TOKEN_KEY, deleteCookie, redirectSendPasswordReset, setCookie, resetPassword, redirectToLogin} from "../../auth";
import { setupForm } from "../../form_handling";
import { attachDatePicker, logging } from "../../utils";

/**
 * Renders the reset password page and initializes functionality.
 * This function verifies the magic token for password reset and sets up the form.
 */
export async function render() {
    const successBanner = document.querySelector('[w-el="verification_success"]');
    const failedBanner = document.querySelector('[w-el="verification_failed"]');

    try {
        // Delete existing authentication token if present
        const token = getCookie(TOKEN_KEY);
        if (token !== null) {
            deleteCookie(TOKEN_KEY);
        }

        // Get the magic token from the URL query parameters
        const magicToken = getQueryParam('token');
        if (!magicToken) {
            // Show error banner if no magic token is found
            displayBannerWithTimeout(failedBanner, 6000, redirectSendPasswordReset);
            return;
        }

        const formData = new FormData();
        formData.append('magic_token', magicToken);

        try {
            // Send request to validate the magic token
            const response = await fetch(`${AUTH_URL}/auth/magic-login`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Set new token and check user authentication
                setCookie(TOKEN_KEY, data);
                const authCheckResponse = await checkAuthentication();

                if (authCheckResponse.user.id) {
                    // Display success banner if user is authenticated
                    displayBannerWithTimeout(successBanner, 10000);
                } else {
                    // Redirect if authentication fails
                    displayBannerWithTimeout(failedBanner, 6000, redirectSendPasswordReset);
                }
            } else {
                // Show error banner if response is not OK
                displayBannerWithTimeout(failedBanner, 6000, redirectSendPasswordReset);
            }
        } catch (error) {
            logging.error({
                message: `Error with magic token validation: ${error.message}`,
                eventName: "magic_token_validation_error",
                extra: {}
            });
        }
    } catch (error) {
        logging.error({
            message: `Error during reset password page initialization: ${error.message}`,
            eventName: "reset_password_page_init_error",
            extra: {}
        });
    }

    // Setup reset password form
    setupForm('resetPassword_form', transformFormData, resetPassword, handleResponse, false);
}

/**
 * Displays a banner for a specified duration, then performs an action.
 * 
 * @param {Element} banner - The banner element to display.
 * @param {number} timeout - The duration in milliseconds to display the banner.
 * @param {Function} [action] - The action to perform after the timeout.
 */
function displayBannerWithTimeout(banner, timeout, action = null) {
    banner.classList.remove('hide');
    setTimeout(() => {
        banner.classList.add('hide');
        if (action) action();
    }, timeout);
}

/**
 * Transforms the reset password form data for submission.
 * This function adjusts the keys for the password and confirm password fields
 * and constructs a new FormData object with the transformed data.
 * 
 * @param {FormData} formData - The original form data from the reset password form.
 * @returns {FormData} - The transformed FormData object suitable for submission.
 */
function transformFormData(formData) {
    const transformedData = new FormData();

    // Extract and append the password and confirm password fields
    // from the original form data to the transformed form data.
    const password = formData.get('resetPassword_password');
    const confirmPassword = formData.get('resetPassword_confirmPassword');

    transformedData.append('password', password);
    transformedData.append('confirmPassword', confirmPassword);

    return transformedData;
}


/**
 * Handles the response received after the reset password form submission.
 * This function updates the UI based on the success or failure of the password reset process.
 * 
 * @param {Object} response - The response object received from the form submission.
 */
async function handleResponse(response) {
    const formElement = document.getElementById('resetPassword_form');
    const successDiv = formElement ? formElement.parentNode.querySelector('[w-el="form_success"]') : null;

    if (response.success) {
        if (formElement && successDiv) {
            // Hide the form and show the success message
            formElement.classList.add('hide');
            successDiv.style.display = 'block';
            logging.info({
                message: "Reset password successful",
                eventName: "reset_password_success"
            });
        }
    } else {
        logging.error({
            message: "Reset password failed: " + (response.message || "Unknown error"),
            eventName: "reset_password_failure",
            extra: {}
        });
        // Optionally, handle the display of an error message to the user
    }
}