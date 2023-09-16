
const TOKEN_KEY = 'wized_token';

export function getCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null; // or undefined, depending on your needs
}

export function setCookie(value) {
    document.cookie = "wized_token=" + value + ";path=/";
}

export function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;';
}

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

export function getQueryParam(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
}

export async function sendVerificationMail (email,sendgrid_template,redirect_uri) {

    // Define the query parameters
    const formData = new FormData();

    formData.append('email',email);
    formData.append('sendgrid_template',sendgrid_template);
    formData.append('redirect_uri',redirect_uri);

    try {
        const response = await fetch(AUTH_URL + '/auth/magic-link', {
            method: 'POST',
            headers: {},
            body: formData
        });

        const jsonResponse = await response.json();

        if (response.ok) {
            return jsonResponse;

        } else {
            return jsonResponse;
        }
    } catch (error) {
        console.error('Error while sending verification mail:', error);
    }

}

/**
 * Verifies the provided token by making a request to the authentication endpoint.
 * If the token is valid and the response contains user details, it sets the global `currentUser` variable.
 * 
 * @param {string} token - The authentication token to verify.
 * @returns {boolean} - Returns `true` if the token is verified successfully, otherwise returns `false`.
 */

export async function verifyToken(token) {
    
    try {
        // Make a GET request to the authentication endpoint with the token in the headers.
        const response = await fetch(AUTH_URL + '/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        // Parse the response to JSON.
        const data = await response.json();

        // Check if the response status indicates success (e.g., 200 OK).
        if (response.ok) {
            // If the token is authenticated and user details are provided in the response...
            if (data.id) {

                return true;

            } else {

                return false;
            }
        } else {
            // Log an error message if the token verification failed. 
            // Use the provided error message from the response or a default "Unknown error" message.
            console.error('Token verification failed:', data.message || 'Unknown error');
            return false;
        }
    } catch (error) {
        // Log any errors that occurred during the token verification process.
        console.error('Error verifying token:', error);
        return false;
    }
}

export async function getUser(token) {
    
    try {
        // Make a GET request to the authentication endpoint with the token in the headers.
        const response = await fetch(AUTH_URL + '/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        // Parse the response to JSON.
        const data = await response.json();

        // Check if the response status indicates success (e.g., 200 OK).
        if (response.ok) {
            // If the token is authenticated and user details are provided in the response...
            if (data.id) {

                return data;

            } else {

                return response;
            }
        } else {
            // Log an error message if the token verification failed. 
            // Use the provided error message from the response or a default "Unknown error" message.
            console.error('Token verification failed:', data.message || 'Unknown error');
            return false;
        }
    } catch (error) {
        // Log any errors that occurred during the token verification process.
        console.error('Error verifying token:', error);
        return false;
    }
}

async function resetPassword() {

    const wized_token = getCookie("wized_token");
    const token = 'Bearer ' + wized_token;

    const password = document.querySelector('[w-el="passwordReset_password_1"]').value;
    const errorWrapper = document.querySelector('[w-el="passwordReset_error"]');

    const formData = new FormData();

    formData.append('password',password);

    try {

        buttonLoader.classList.remove('hide');
        // Send a POST request to your authentication endpoint
        const response = await fetch(authUrl+"/auth/reset-password", {
            method: "POST",
            headers: {
                'Authorization': token
            },
            body: formData
        });

        // Parse the response
        const data = await response.json();

        buttonLoader.classList.add('hide');

        // Check the response
        if (response.ok) {
            
            redirectToLogin();
        } else {

            if (errorWrapper.hasChildNodes) {
                while (errorWrapper.firstChild) {
                    errorWrapper.removeChild(errorWrapper.firstChild);
                }
            }
            const para = document.createElement('p');
            para.classList.add('error-message-text');

            para.textContent = "Something went wrong... Please try again in a few minutes. If the error persists please contact us: hello@getworldify.com.";

            errorWrapper.appendChild(para);
            errorWrapper.classList.remove('hide');
            // Display an error message
            console.error("Login failed:", data.message || "Unknown error");
        }
    } catch (error) {
        console.error("Error during password reset:", error);
    }
}

async function sendPasswordResetLink(){
    const emailInput = document.querySelector('[w-el="passwordReset_email"]').value;
    const buttonLoader = document.querySelector('[w-el="button_loader"]');
    const errorWrapper = document.querySelector('[w-el="passwordReset_error"]');

    try {

        buttonLoader.classList.remove('hide');

        var response = await sendVerificationMail(email=emailInput, sendgrid_template="password_reset",redirect_uri=domainUrl+"/account/reset-password");

        buttonLoader.classList.add('hide');

        // Check the response
        if (response.message.success) {
            // Successful signup

            // Redirect to Page where you can reset your password
            redirectToPasswordPending();
        } else {

            if (errorWrapper.hasChildNodes) {
                while (errorWrapper.firstChild) {
                    errorWrapper.removeChild(errorWrapper.firstChild);
                }
            }
            const para = document.createElement('p');
            para.classList.add('error-message-text');

            if (response.message === "No user found for that email.") {
                const signupLink = domainUrl+"/account/signup"; // replace with your signup link
                para.innerHTML = "We couldn't find a user for the email you provided. If you want to signup for a new account, please click <a href='" + signupLink + "'>here</a>.";

            } else if (response.message === "email is required but was not suppiled.") {
                para.textContent = "You did not provide an email address. Please type in the email you used for the account.";
            } else {
                para.textContent = "Something went wrong... Please try again in a few minutes. If the error persists please contact us: hello@getworldify.com."
            }

            errorWrapper.appendChild(para);
            errorWrapper.classList.remove('hide');
            // Display an error message
            console.error("Login failed:", response.message || "Unknown error");
        }
    } catch (error) {
        console.error("Error during login:", error);
    }
}

export async function checkAuthentication() {
    
    const token = getCookie(TOKEN_KEY);
    
    if (!token) {
        redirectToLogin();
    } else {
        const isAuthenticated = await verifyToken(token);
        if (!isAuthenticated) {
            deleteCookie(TOKEN_KEY);
            redirectToLogin();
        }
    }
}

export async function displayUser() {
    const firstnames = document.querySelectorAll('[w-el="firstname"]');
    const lastnames = document.querySelectorAll('[w-el="lastname"]');
    const emails = document.querySelectorAll('[w-el="email"]');

    const token = getCookie('wized_token');
    const user = await getUser(token);

    firstnames.forEach (firstname => {firstname.textContent = user.firstname});
    lastnames.forEach (lastname => {lastname.textContent = user.lastname});
    emails.forEach (email => {email.textContent = user.email});

}

export function redirectToLogin() {
    window.location.href = DOMAIN_URL + '/account/login';
}

export function redirectToEmailVerification() {
    window.location.href = DOMAIN_URL + '/account/send-email-verification';
}

export function redirectToDashboard () {
    window.location.href = DOMAIN_URL + '/app/dashboard';
}

export function redirectToOnboarding () {
    window.location.href = DOMAIN_URL + '/account/onboarding';
}

export function redirectToVerificationPending () {
    window.location.href = DOMAIN_URL + '/account/email-verification-pending';
}

export function redirectToPasswordPending() {
    window.location.href = DOMAIN_URL + '/account/password-reset-pending';
}

export function redirectVerifyEmail () {
    window.location.href = DOMAIN_URL + '/account/verify-email';
}