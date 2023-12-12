import { logging } from "./utils";
export const TOKEN_KEY = 'wized_token';

/**
 * Retrieves the value of a specified cookie from the document.
 * 
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {string|null} - The value of the cookie if found, null otherwise.
 */
export function getCookie(name) {
    if (!name || typeof name !== 'string') {
        logging.warning({
            message: `getCookie: Invalid cookie name '${name}'`,
            eventName: "getCookie_invalid_name",
            extra: {}
        });
        return null;
    }

    const encodedName = encodeURIComponent(name) + "=";
    const cookieArray = document.cookie.split('; ');

    for (let i = 0; i < cookieArray.length; i++) {
        const cookie = cookieArray[i];
        if (cookie.indexOf(encodedName) === 0) {
            return decodeURIComponent(cookie.substring(encodedName.length));
        }
    }

    logging.info({
        message: `getCookie: Cookie '${name}' not found`,
        eventName: "getCookie_not_found",
        extra: {}
    });
    return null;
}

/**
 * Sets a cookie in the document with specified name and value.
 * 
 * @param {string} name - The name of the cookie to set.
 * @param {string} value - The value of the cookie.
 * @param {number} [days=30] - The number of days until the cookie expires.
 * @param {string} [path='/'] - The path for the cookie.
 */
export function setCookie(name, value, days = 30, path = '/') {
    if (!name || typeof name !== 'string' || !value || typeof value !== 'string') {
        logging.warning({
            message: `setCookie: Invalid name or value. Name: ${name}, Value: ${value}`,
            eventName: "setCookie_invalid_input",
            extra: {}
        });
        return;
    }

    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const encodedValue = encodeURIComponent(value);
    document.cookie = `${encodeURIComponent(name)}=${encodedValue};expires=${expires};path=${path}`;

    logging.info({
        message: "Cookie set successfully",
        eventName: "setCookie_success",
        extra: {}
    });
}

/**
 * Deletes a cookie from the document by setting its expiration date to a past date.
 * 
 * @param {string} name - The name of the cookie to be deleted.
 * @param {string} [path='/'] - The path of the cookie. Defaults to root ('/').
 */
export function deleteCookie(name, path = '/') {
    if (!name || typeof name !== 'string') {
        logging.warning({
            message: `deleteCookie: Invalid cookie name. Name: ${name}`,
            eventName: "deleteCookie_invalid_name",
            extra: {}
        });
        return;
    }

    // Set the cookie with an expiration date in the past
    document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;

    logging.info({
        message: `Cookie deleted successfully`,
        eventName: "deleteCookie_success",
        extra: {}
    });
}

//TODO
export function check_password(x,y) {
	const constraint_characters = document.getElementById("password_constraint_characters");
  const constraint_upperlower = document.getElementById("password_constraint_upperlower");
  const constraint_number = document.getElementById("password_constraint_number");
  const constraint_special = document.getElementById("password_constraint_special");
  const constraint_correctness = document.getElementById("password_constraint_correctness");
  
  // Initialize all constraints to false
    var isLengthValid = false;
    var isUpperLowerValid = false;
    var isNumberValid = false;
    var isSpecialValid = false;
    var isCorrectnessValid = false;

    // Check length 5-20 characters
    if (x.length >= 5 && x.length <= 20) {
        constraint_characters.classList.remove("text-color-red");
        isLengthValid = true;
    } else {
    		if (!constraint_characters.classList.contains("text-color-red")) {
        	constraint_characters.classList.add("text-color-red");
        }
        
    }

    // Check at least one upper and one lower case 
    if (/[a-z]/.test(x) && /[A-Z]/.test(x)) {
        constraint_upperlower.classList.remove("text-color-red");
        isUpperLowerValid = true;
    } else {
        if (!constraint_upperlower.classList.contains("text-color-red")){
        	constraint_upperlower.classList.add("text-color-red");
        }
    }

    // Check at least one number
    if (/\d/.test(x)) {
        constraint_number.classList.remove("text-color-red");
        isNumberValid = true;
    } else {
        if (!constraint_number.classList.contains("text-color-red")) {
        	constraint_number.classList.add("text-color-red");
        }
    }

    // Check at least one special character
    if (/[!@#$%^&*(),.?":{}|<>]/.test(x)) {
        constraint_special.classList.remove("text-color-red");
        isSpecialValid = true;
    } else {
        if (!constraint_special.classList.contains("text-color-red")) {
        	constraint_special.classList.add("text-color-red");
        }
    }

    // Check correctness of the two passwords
    if (x === y & x !== "") {
        constraint_correctness.classList.remove("text-color-red");
        isCorrectnessValid = true;
    } else {
        if (!constraint_correctness.classList.contains("text-color-red")) {
        	constraint_correctness.classList.add("text-color-red");
        }
    }

    // Only if all conditions are met, show the submit button.
    if (isLengthValid && isUpperLowerValid && isNumberValid && isSpecialValid && isCorrectnessValid){
        return true;
    } else {
        return false;
    }
}

/**
 * Retrieves the value of a query parameter from the current URL.
 * 
 * @param {string} paramName - The name of the query parameter.
 * @returns {string|null} The value of the query parameter or null if not found.
 */
export function getQueryParam(paramName) {
    if (!paramName || typeof paramName !== 'string') {
        logging.warning({
            message: `getQueryParam: Invalid parameter name. Parameter name: ${paramName}`,
            eventName: "getQueryParam_invalid_param",
            extra: {}
        });
        return null;
    }

    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has(paramName)) {
        const value = urlParams.get(paramName);
        logging.info({
            message: "Query parameter retrieved",
            eventName: "getQueryParam_success",
            extra: { /*paramName, value */}
        });
        return value;
    } else {
        logging.info({
            message: `Query parameter not found. Parameter name: ${paramName}`,
            eventName: "getQueryParam_not_found",
            extra: {}
        });
        return null;
    }
}

/**
 * Sends a verification email using specified template and redirect URI.
 * 
 * @param {string} email - The email address to send the verification mail to.
 * @param {string} sendgrid_template - The SendGrid template to be used.
 * @param {string} redirect_uri - The URI to redirect to after email verification.
 * @returns {Promise<Object|null>} - The response object on success, or null if an error occurs.
 */
export async function sendVerificationMail(email, sendgrid_template, redirect_uri) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('sendgrid_template', sendgrid_template);
    formData.append('redirect_uri', redirect_uri);

    try {
        const response = await fetch(`${AUTH_URL}/auth/magic-link`, {
            method: 'POST',
            headers: {},
            body: formData
        });

        const jsonResponse = await response.json();

        if (!response.ok) {
            // Log an error if the response is not OK
            logging.error({
                message: `Sending verification mail to ${email} failed: ${jsonResponse}`,
                eventName: "sendVerificationMail_failed",
                extra: {}
            });
            return null;
        }

        logging.info({
            message: "Verification mail sent successfully",
            eventName: "sendVerificationMail_success",
            extra: {}
        });

        return jsonResponse;
    } catch (error) {
        logging.error({
            message: "Error while sending verification mail to " + email + ". Message: " + error.message,
            eventName: "sendVerificationMail_exception",
            extra: {}
        });
        return null;
    }
}


/**
 * Verifies the provided token and retrieves user details if the token is valid.
 * 
 * @param {string} token - The authentication token to verify.
 * @returns {Promise<Object|boolean>} - Returns user data if the token is valid, `false` otherwise.
 */
async function verifyAndGetUser(token) {
    if (!token || typeof token !== 'string') {
        logging.warning({
            message: "verifyAndGetUser: Invalid or missing token",
            eventName: "verifyAndGetUser_invalid_input",
            extra: {}
        });
        return {success: false, user: null};
    }

    try {
        const response = await fetch(AUTH_URL + '/auth/me', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const data = await response.json();

        if (response.ok && data.id) {
            return {success: true, user: data};
        } else {
            const errorMessage = data.message || 'Unknown error';
            logging.error({
                message: `Token verification failed: ${errorMessage}`,
                eventName: "verifyAndGetUser_failed",
                extra: {}
            });
            return {success: false, user: null};
        }
    } catch (error) {
        logging.error({
            message: `Error in verifyAndGetUser: ${error.message}`,
            eventName: "verifyAndGetUser_exception",
            extra: {}
        });
        return {success: false, user: null};
    }
}

/**
 * Fetches account settings for the authenticated user.
 * 
 * @param {string} token - The authentication token for the user.
 * @returns {Promise<{success: boolean, response: Object|null}>} - 
 *          Returns an object with success status and response data.
 */
export async function getAccountSettings(token) {
    if (!token || typeof token !== 'string') {
        logging.warning({
            message: "getAccountSettings: Invalid or missing token",
            eventName: "getAccountSettings_invalid_token",
            extra: { token }
        });
        return {};
    }

    try {
        const response = await fetch(`${BASE_URL}/account_settings`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            if (data.id) {
                logging.info({
                    message: `Account settings retrieved successfully for user ${data.id}`,
                    eventName: "getAccountSettings_success",
                    extra: {}
                });
                return { success: true, user: data };
            } else {
                logging.warning({
                    message: "Account settings response lacks ID",
                    eventName: "getAccountSettings_no_id",
                    extra: { response: data }
                });
                return {};
            }
        } else {
            const errorMessage = data.message || 'Unknown error during account settings retrieval';
            logging.error({
                message: `Account settings retrieval failed: ${errorMessage}`,
                eventName: "getAccountSettings_failed",
                extra: { response: data }
            });
            return {};
        }
    } catch (error) {
        logging.error({
            message: "Error in getAccountSettings",
            eventName: "getAccountSettings_exception",
            extra: { errorDetails: error.message }
        });
        return {};
    }
}


/**
 * Resets the password by sending a request to the server.
 * Validates password criteria and ensures the new password and confirmation match.
 * 
 * @param {string} password - The new password.
 * @param {string} confirmPassword - The confirmation of the new password.
 * @returns {Promise<Object>} - An object containing the success status and message.
 */
export async function resetPassword(inputFormData) {
    
    const password = inputFormData.get('password');
    const confirmPassword = inputFormData.get('confirmPassword');
    // Validate password criteria
    // Check if passwords are not empty
    if (password === "" || confirmPassword === "") {
        return {success: false, message: 'Password fields cannot be empty.'}
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

    // Retrieve the token from cookies
    const wized_token = getCookie("wized_token");
    const token = 'Bearer ' + wized_token;

    // Prepare the form data for the request
    const formData = new FormData();
    formData.append('password', password);    

    try {
        // Send the POST request to the server
        const response = await fetch(AUTH_URL +'/auth/reset-password', {
            method: "POST",
            headers: { 'Authorization': token },
            body: formData
        });

        // Parse the response
        const data = await response.json();

        // Check the response status
        if (response.ok) {
            logging.info({
                message: "Password reset request sent successfully to " + data.email,
                eventName: "resetPassword_success",
                extra: {}
            });
            return { success: true, message: "Password reset was successful." };
        } else {
            const errorMessage = data.message || 'Unknown error during password reset';
            logging.error({
                message: `Password reset request failed: ${errorMessage}`,
                eventName: "resetPassword_failed",
                extra: { /*response: data*/ }
            });
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        logging.error({
            message: "Error in resetPassword: " + error.message,
            eventName: "resetPassword_exception",
            extra: {}
        });
        return { success: false, message: error.message || "Error occurred during password reset" };
    }
}

/**
 * Resets the user's email by sending a request to the server.
 * It checks if the provided email and confirmation email are valid and match.
 * 
 * @param {string} email - The new email address.
 * @param {string} confirmEmail - The confirmation of the new email address.
 * @returns {Promise<Object>} - An object containing the success status and message.
 */
export async function emailReset(inputFormData) {

    const email = inputFormData.get('email');
    const confirmEmail = inputFormData.get('confirmEmail');
    // Regular expression to validate the format of the email address
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    // Validate email addresses
    if (!emailRegex.test(email) || !emailRegex.test(confirmEmail)) {
        return { success: false, message: 'Please provide a valid email address.' };
    }
    if (email !== confirmEmail) {
        return { success: false, message: 'The email addresses do not match.' };
    }

    // Prepare the form data for the request
    const formData = new FormData();
    formData.append('email', email);

    const token = 'Bearer ' + getCookie("wized_token");

    try {
        // Send the POST request to the server
        const response = await fetch(`${AUTH_URL}/auth/reset-email`, {
            method: "POST",
            headers: { 'Authorization': token },
            body: formData
        });

        // Parse the response
        const data = await response.json();

        // Check the response status
        if (response.ok) {
            logging.info({
                message: `Email reset request sent successfully. Old email: ${email}, New email: ${data.email}`,
                eventName: "emailReset_success",
                extra: {}
            });
            return { success: true, message: "Your email address was successfully changed. \n\nYou will be logged out in a few seconds. Please login with your new credentials.", user:data };
        } else {
            const errorMessage = data.message || 'Unknown error during email reset';
            logging.error({
                message: `Email reset request failed: ${errorMessage}`,
                eventName: "emailReset_failed",
                extra: { /*response: data*/ }
            });
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        logging.error({
            message: "Error in emailReset: " + error.message,
            eventName: "emailReset_exception",
            extra: {}
        });
        return { success: false, message: error.message || "Error occurred during email reset" };
    }
}

/**
 * Checks if the user is authenticated by verifying the stored token.
 * Redirects to the login page if the token is invalid or missing.
 * 
 * @returns {Promise<Object>} An object indicating the authentication status and the user details if authenticated.
 */
export async function checkAuthentication() {
    const token = getCookie(TOKEN_KEY);

    // If no token is found, redirect to the login page and return unauthenticated status
    if (!token) {
        redirectToLogin();
        return { success: false, user: null };
    }

    try {
        // Verify the token and get user details
        const response = await verifyAndGetUser(token);

        // If the token is invalid, delete the cookie, redirect to login, and return unauthenticated status
        if (!response.success) {
            deleteCookie(TOKEN_KEY);
            redirectToLogin();
            return { success: false, user: null };
        }

        // Return successful authentication with user details
        return { success: true, user: response.user };
    } catch (error) {
        logging.error({
            message: "Error in checkAuthentication: " + error.message,
            eventName: "checkAuthentication_exception",
            extra: {}
        });

        // In case of an error, consider the user unauthenticated
        return { success: false, user: null };
    }
}

/**
 * Displays the user's details (first name, last name, email) on the page.
 * 
 * @param {Object} user - The user object containing first_name, last_name, and email.
 */
export async function displayUser(user) {
    if (!user || typeof user !== 'object') {
        logging.error({
            message: "displayUser: Invalid user object for user: " + user.id,
            eventName: "displayUser_invalid_input",
            extra: {}
        });
        return;
    }

    // Define the user detail fields
    const fields = [
        { attribute: 'first_name', elements: document.querySelectorAll('[w-el="first_name"]') },
        { attribute: 'last_name', elements: document.querySelectorAll('[w-el="last_name"]') },
        { attribute: 'email', elements: document.querySelectorAll('[w-el="email"]') }
    ];

    // Iterate over each field and update the corresponding elements
    fields.forEach(field => {
        if (user[field.attribute] !== undefined) {
            field.elements.forEach(element => {
                element.textContent = user[field.attribute];
            });
        } else {
            logging.warning({
                message: `displayUser: Missing user attribute '${field.attribute}' for user ${user.id}`,
                eventName: "displayUser_missing_attribute",
                extra: {}
            });
        }
    });
}

/**
 * Redirects to a specified path on the domain.
 * 
 * @param {string} path - The path to redirect to.
 */
function redirectTo(path) {
    if (!path || typeof path !== 'string') {
        logging.error({
            message: "redirectTo: Invalid path. Path: " + path,
            eventName: "redirectTo_invalid_input",
            extra: {}
        });
        return;
    }

    window.location.href = `${DOMAIN_URL}${path}`;
}

// Specific redirection functions using redirectTo
export const redirectToLogin = () => redirectTo('/account/login');
export const redirectToEmailVerification = () => redirectTo('/account/send-email-verification');
export const redirectToDashboard = () => redirectTo('/app/dashboard');
export const redirectToOnboarding = () => redirectTo('/account/onboarding');
export const redirectToVerificationPending = () => redirectTo('/account/email-verification-pending');
export const redirectToPasswordPending = () => redirectTo('/account/password-reset-pending');
export const redirectVerifyEmail = () => redirectTo('/account/verify-email');
export const redirectSendPasswordReset = () => redirectTo('/account/send-password-reset');
export const redirectResendEmailVerification = () => redirectTo('/account/resend-email-verification');


/**
 * Sets up the logout functionality by attaching an event listener to the logout button.
 * When clicked, it deletes the authentication token cookie.
 */
export function setupLogout() {
    const logoutButton = document.querySelector('[w-el="logout_button"]');

    // Check if the logout button exists in the DOM
    if (logoutButton) {
        // Attach click event listener to the logout button
        logoutButton.addEventListener('click', (event) => {
            // Delete the authentication token cookie
            deleteCookie(TOKEN_KEY);
            logging.info({
                message: "User logged out successfully",
                eventName: "logout_success"
            });

            // Optionally, redirect to the login page or perform other actions after logout
            redirectToLogin();
        });
    } else {
        // Log warning if the logout button is not found
        logging.warning({
            message: "Logout button not found in the DOM",
            eventName: "logout_button_not_found"
        });
    }
}
