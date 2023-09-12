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

            const user = await getUser();

            firstname.textContent = user.firstname;

            successMessage.classList.remove('hide');

            console.log(token);

        } else {
            
            const jsonResponse = await response.json();
            const email = jsonResponse.payload;

            if (email !== undefined && email !== ""){
                console.log(email);
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