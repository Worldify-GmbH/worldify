/*
// The event handler function
async function getUser() {
    
    const wized_token = getCookie("wized_token");
    const token = 'Bearer ' + wized_token;

    try {
        const response = await fetch(authUrl + '/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        if (response.ok) {
            const jsonResponse = await response.json();
            console.log(jsonResponse);
            return jsonResponse; // Return the response data
        } else {
            console.error('Get User failed:', response.statusText);
            return null; // Return null or any other value to indicate failure
        }
    } catch (error) {
        console.error('Error getting user:', error);
        alert('An error occurred. Please try again.');
        return null; // Return null or any other value to indicate an error
    }
}
*/


async function sendVerificationMail (email) {

    const baseURL = authUrl + '/auth/magic-link';

    // Create a new URL object
    const url = new URL(baseURL);

    // Define the query parameters
    const params = {
        email: email
    };

    // Append the query parameters to the URL
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));


    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {},
        });

        if (response.ok) {
            const jsonResponse = await response.json();
            console.log(jsonResponse);

        } else {
            const jsonResponse = await response.json();
            console.log(jsonResponse);
        }
    } catch (error) {
        console.error('Error while sending verification mail:', error);
    }

}

async function magicLogin () {
    const magicToken = getQueryParam('token');
    const successMessage = document.querySelector('[w-el="mailVerification_successMessage"]');
    const firstname = document.querySelector('[w-el="mailVerification_firstname"]');
    const failedMessage = document.querySelector('[w-el="mailVerification_failedMessage"]');
    const resendButton = document.querySelector('[w-el="mailVerification_resendButton"]');
    const buttonWrapper = document.querySelector('[w-el="mailVerification_buttonWrapper"]');


    const formData = new FormData();

    formData.append('magic_token',magicToken);

    try {
        const response = await fetch(authUrl + '/auth/magic-login', {
            method: 'POST',
            headers: {},
            body: formData
        });

        if (response.ok) {
            const token = await response.json();

            setCookie(token);

            await checkAuthentication();

            firstname.textContent = currentUser.firstname;

            successMessage.classList.remove('hide');

            console.log(token);

        } else {
            
            const jsonResponse = await response.json();
            const email = jsonResponse.payload;

            if (email !== undefined && email !== ""){
                //console.log(email);
                resendButton.addEventListener('click', function () {
                    sendVerificationMail(email);
                });
                buttonWrapper.classList.remove('hide');
            }
            
            failedMessage.classList.remove('hide');
            console.error('Magic Login failed:', response.statusText);
        }
    } catch (error) {
        console.error('Error with magic login:', error);
    }
}

async function resendVerificationMail () {
    const verifiedComponent = document.querySelector('[w-el="resendEmail_verifiedComponent"]');
    const notVerifiedComponent = document.querySelector('[w-el="resendEmail_notVerifiedComponent"]');
    const firstname = document.querySelectorAll('[w-el="resendEmail_firstname"]');
    const resendButton = document.querySelector('[w-el="resendEmail_button"]');

    const wized_token = getCookie("wized_token");
    const token = 'Bearer ' + wized_token;

    const isAuthenticated = await verifyToken(token);

    if (isAuthenticated) {

        firstname.forEach(name => {
            name.textContent = currentUser.firstname;
        });

        if (!currentUser.is_verified) {

            resendButton.addEventListener('click', function () {
                sendVerificationMail(currentUser.email);
            });

            notVerifiedComponent.classList.remove('hide');

        } else {

            verifiedComponent.classList.remove('hide');

        }
        
    }

}

// Global variable to store the current user's details after successful token verification.
let currentUser = null;

/**
 * Verifies the provided token by making a request to the authentication endpoint.
 * If the token is valid and the response contains user details, it sets the global `currentUser` variable.
 * 
 * @param {string} token - The authentication token to verify.
 * @returns {boolean} - Returns `true` if the token is verified successfully, otherwise returns `false`.
 */
async function verifyToken(token) {
    
    try {
        // Make a GET request to the authentication endpoint with the token in the headers.
        const response = await fetch(authUrl + '/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });
        
        // Parse the response to JSON.
        const data = await response.json();

        // Check if the response status indicates success (e.g., 200 OK).
        if (response.ok) {
            // If the token is authenticated and user details are provided in the response...
            if (data.id) {

                // Store the user details in the global variable.
                // Assuming the user details are stored in the "user" key in the returned data.
                currentUser = data; 
                return true;

            } else {
                // If the token is not authenticated, reset the user details to null.
                currentUser = null;
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

async function checkAuthentication() {
    
    const wized_token = getCookie("wized_token");
    const token = 'Bearer ' + wized_token;
    
    if (!token) {
        redirectToLogin();
    } else {
        const isAuthenticated = await verifyToken(token);
        if (!isAuthenticated) {
            redirectToLogin();
        } else {
            if (!currentUser.is_verified) {
                redirectToEmailVerification();
            }

            else {
                //do nothing, user was successfully authenticated and user is stored in currentUser
            }
        }
    }
}

function redirectToLogin() {
    window.location.href = domainUrl + '/account/login';
}

function redirectToEmailVerification() {
    window.location.href = domainUrl + '/account/send-email-verification';
}

document.addEventListener("DOMContentLoaded", function() {
    const path = window.location.pathname;

    if (path.startsWith('/account/send-email-verification')){
        resendVerificationMail();
    }
    if (path.startsWith('/app/')) {
        checkAuthentication();
    }
});
