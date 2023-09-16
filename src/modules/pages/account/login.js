import { getCookie, setCookie, redirectToDashboard } from "../../auth";

export function render () {
    if (window.Webflow) {
        window.Webflow.push(async () => {
            try {
                let errorDiv;
                let successDiv;
    
                // 1. Remove w-form to prevent Webflow from handling it
                const formElement = document.getElementById('wf-form-Login-Form');
    
                if (formElement && formElement.parentElement) {
                    formElement.parentElement.classList.remove('w-form');
    
                    // 2. Find the error and success divs
                    errorDiv = formElement.parentElement.querySelector('[w-el="error"]');
                    errorDiv.style.display = 'none';
    
                    // 3. Add our own submit handler
                    formElement.onsubmit = async (event) => {
                        try {
                            event.preventDefault();

                            const submitButton = document.querySelector('[w-el="submitButton"]');
                            submitButton.value = submitButton.getAttribute('data-wait');
    
                            // 4. Get the form data
                            const formData = new FormData(formElement);

                            // Create a new FormData object
                            const submitFormData = new FormData();
                            
                            // Iterate over the original FormData
                            for (let [key, value] of formData.entries()) {
                                if (key === 'login_email') {
                                    submitFormData.append('email', value);
                                } else if (key === 'login_password') {
                                    submitFormData.append('password', value);
                                } else {
                                    // Append any other key-value pairs without modification
                                    submitFormData.append(key, value);
                                }
                            }
                            
                            // 5. Get the form entries as an object
                            const data = Object.fromEntries(submitFormData.entries());
                            
                            // 6. Send the data to the server
                            const response = await fetch(AUTH_URL + '/auth/login', {
                                method: 'POST',
                                body: submitFormData,
                                headers: {}
                            });

                            // 6. Handle the response
                            const responseData = await response.json();

                            if (response.ok) {
                                setCookie(responseData.authToken);
                                // redirect to Dashboard
                                redirectToDashboard();
                            }
    
                            else {
                                
                                if (responseData.message === "No Account for this Email.") {
                                    errorDiv.firstChild.textContent = responseData.message;
                    
                                } else if (responseData.message === "Invalid Credentials.") {
                                    errorDiv.firstChild.textContent = responseData.message;
                                } else {
                                    errorDiv.firstChild.textContent = "Something went wrong... Please try again in a few minutes. If the error persists please contact us: hello@getworldify.com."
                                }

                                errorDiv.style.display = 'block';
                            }

                            submitButton.value = "Login";
                        
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

