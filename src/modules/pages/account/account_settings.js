import { getCookie, displayUser, redirectToLogin, resetPassword, emailReset, getAccountSettings, deleteCookie } from "../../auth";
import { autoSaveFunction, debounce, fillFieldsFromDatabase, setupForm } from "../../form_handling";
import { logging } from "../../utils";


/**
 * Renders the page by fetching account settings and setting up forms for account management.
 */
export async function render() {
    try {
        const response = await getAccountSettings(getCookie('wized_token'));

        if (response.success) {
            fillFieldsFromDatabase(response.user, 'account_');
            const formWrapper = document.querySelector('[w-el="formWrapper"]');

            if (formWrapper) {
                formWrapper.addEventListener('change', debounce((event) => autoSaveFunction(event, `${BASE_URL}/account_settings`), 500));
            } else {
                logging.warning({
                    message: 'render: Form wrapper not found',
                    eventName: 'render_no_formWrapper',
                });
            }
        } else {
            logging.error({
                message: 'render: Failed to fetch account settings',
                eventName: 'render_fetch_error',
                extra: { errorDetails: response.message }
            });
            return;
        }

        const emailResponse = setupForm('account_change_mail', transformEmailFormData, emailReset,logoutAndRedirect);      
        const passwordResponse = setupForm('account_change_password', transformPasswordFormData, resetPassword,logoutAndRedirect);

    } catch (error) {
        logging.error({
            message: 'Error in render function',
            eventName: 'render_exception',
            extra: { errorDetails: error.message }
        });
    }
}

async function logoutAndRedirect(response){
    // Handling the response specifically for email reset
    if (response.success) {
        displayUser(response.user);
        setTimeout(() => {
            deleteCookie('wized_token');
            redirectToLogin();
        }, 4500);
    }
}

/**
 * Transforms the email form data for submission.
 * 
 * @param {FormData} formData - The original form data.
 * @returns {FormData} - Transformed formData with email and confirmEmail.
 */
function transformPasswordFormData(formData) {
    // Extract email and confirmation email from the form data
    const password = formData.get('account_password');
    const confirmPassword = formData.get('account_password_confirm');

    // Return the transformed data
    const resultFormData = new FormData();
    resultFormData.append('password',password);
    resultFormData.append('confirmPassword',confirmPassword);
    return resultFormData;
}

function transformEmailFormData(formData) {
    // Extract email and confirmation email from the form data
    const email = formData.get('account_mail');
    const confirmEmail = formData.get('account_mail_confirm');

    // Return the transformed data
    const resultFormData = new FormData();
    resultFormData.append('email',email);
    resultFormData.append('confirmEmail',confirmEmail)
    return resultFormData;
}
