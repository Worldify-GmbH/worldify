import { getCookie, displayUser, redirectToLogin, resetPassword, emailReset, getAccountSettings, deleteCookie } from "../../auth";
import { autoSaveFunction, debounce, fillFieldsFromDatabase, setupForm } from "../../form_handling";
import { attachDatePicker, logging } from "../../utils";

/**
 * Renders the page by fetching account settings and setting up forms for account management.
 */
export async function render() {
    try {
        attachDatePicker();
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
                message: 'render: Failed to fetch account settings: ' + response.message,
                eventName: 'render_fetch_error',
                extra: {}
            });
            return;
        }

        const emailResponse = setupForm('account_change_mail', transformEmailFormData, emailReset,logoutAndRedirectEmail);      
        const passwordResponse = setupForm('account_change_password', transformPasswordFormData, resetPassword,logoutAndRedirectPassword);

    } catch (error) {
        logging.error({
            message: 'Error in render function: ' + error.message,
            eventName: 'render_exception',
            extra: {}
        });
    }
}

async function logoutAndRedirectEmail(response){

    const formElement = document.getElementById('account_change_mail');

    const successDiv = formElement.parentNode.querySelector('[w-el="form_success"]');

    // Handling the response specifically for email reset
    if (response.success) {
        formElement.reset();
        formElement.classList.add('hide');
            successDiv.style.display = 'block';
            setTimeout(() => {
                successDiv.style.display = 'none';
                formElement.classList.remove('hide');
                deleteCookie('wized_token');
                redirectToLogin();
            }, 5000);
    }
}

async function logoutAndRedirectPassword(response){

    const formElement = document.getElementById('account_change_password');

    const successDiv = formElement.parentNode.querySelector('[w-el="form_success"]');

    // Handling the response specifically for email reset
    if (response.success) {
        formElement.reset();
        formElement.classList.add('hide');
            successDiv.style.display = 'block';
            setTimeout(() => {
                successDiv.style.display = 'none';
                formElement.classList.remove('hide');
                deleteCookie('wized_token');
                redirectToLogin();
            }, 5000);
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