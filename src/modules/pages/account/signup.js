import { check_password, getCookie, setCookie, redirectToOnboarding } from "../../auth";

export function render () {

    let isValidPassword = false;
    // 1. Remove w-form to prevent Webflow from handling it
    const formElement = document.getElementById('wf-form-Signup-Form');
    let errorDiv = formElement.parentElement.querySelector('[w-el="error"]');
    errorDiv.style.display = 'none';
    let successDiv;


    const password1 = document.querySelector('[w-el="signup_password"]');
    const password2 = document.querySelector('[w-el="signup_password2"]');

    password1.addEventListener('change', function () {
        isValidPassword = check_password(password1.value,password2.value);
        errorDiv.style.display = 'none';
    });

    password2.addEventListener('change', function () {
        isValidPassword = check_password(password1.value,password2.value);
        errorDiv.style.display = 'none';
    });

    if (window.Webflow) {
        window.Webflow.push(async () => {
            try {

                console.log(formElement);
    
                if (formElement && formElement.parentElement) {
                    formElement.parentElement.classList.remove('w-form');
    
                    // 2. Find the error and success divs
                    
    
                    // 3. Add our own submit handler
                    formElement.onsubmit = async (event) => {
                        try {

                            event.preventDefault();

                            const submitButton = document.querySelector('[w-el="submitButton"]');
                            submitButton.value = submitButton.getAttribute('data-wait');


                            if (!isValidPassword) {
                                errorDiv.firstChild.textContent = "Please check the password requirements.";
                                errorDiv.style.display = 'block';
                                submitButton.value = "Signup";
                            } else {
                                // 4. Get the form data
                                const formData = new FormData(formElement);

                                // Create a new FormData object
                                const submitFormData = new FormData();

                                // Iterate over the original FormData
                                for (let [key, value] of formData.entries()) {
                                    if (key === 'signup_email') {
                                        submitFormData.append('email', value);
                                    } else if (key === 'signup_password') {
                                        submitFormData.append('password', value);
                                    }
                                }
                                
                                // 5. Get the form entries as an object
                                const data = Object.fromEntries(submitFormData.entries());
                                console.log(data);
                                
                                // 6. Send the data to the server
                                const response = await fetch(AUTH_URL + '/auth/signup_form', {
                                    method: 'POST',
                                    body: submitFormData,
                                    headers: {}
                                });

                                // 6. Handle the response
                                const responseData = await response.json();

                                console.log(responseData);

                                if (response.ok) {
                                    setCookie(responseData.authToken);
                                    // redirect to Dashboard
                                    redirectToOnboarding();
                                }
        
                                else {
                                    /*
                                    if (responseData.message === "No Account for this Email.") {
                                        errorDiv.firstChild.textContent = responseData.message;
                        
                                    } else if (responseData.message === "Invalid Credentials.") {
                                        errorDiv.firstChild.textContent = responseData.message;
                                    } else {
                                        errorDiv.firstChild.textContent = "Something went wrong... Please try again in a few minutes. If the error persists please contact us: hello@getworldify.com."
                                    }
                                    */

                                    errorDiv.style.display = 'block';
                                }
                                submitButton.value = "Signup";
                            }
                        } catch (error) {
                            // 7. Handle the error
                            console.error("Error during login:", error);
                        }
                    
                    }
                    
                };
            } catch (e) {
                console.error('error', e);
                // errorDiv.style.display = 'block';
            }
        });
    }
}

