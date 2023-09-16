import { getCookie, redirectVerifyEmail } from "../../auth";

export function render () {

    // 1. Remove w-form to prevent Webflow from handling it
    const formElement = document.getElementById('wf-form-Onboarding-Form');

    if (window.Webflow) {
        window.Webflow.push(async () => {
            try {

                console.log(formElement);
    
                if (formElement && formElement.parentElement) {
                    formElement.parentElement.classList.remove('w-form');

                    let errorDiv = formElement.parentElement.querySelector('[w-el="error"]');
                    errorDiv.style.display = 'none';
                    let successDiv;
                    
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

                            const userAddress = {
                                address_line_1 : "",
                                address_line_2 : "",
                                city : "",
                                zip : "",
                                state : "",
                                country : ""
                            }

                            const userBirthDay = {
                                year : "",
                                month : "",
                                day : ""
                            }

                            // Iterate over the original FormData
                            for (let [key, value] of formData.entries()) {
                                if (key === 'onboarding_firstname') {
                                    submitFormData.append('firstname', value);
                                } else if (key === 'onboarding_middlename') {
                                    submitFormData.append('middle_name', value);
                                } else if (key === 'onboarding_lastname') {
                                    submitFormData.append('lastname', value);
                                } else if (key === 'onboarding_birth_day') {
                                    if (value.length <2) {
                                        userBirthDay.day = "0" + value;
                                    } else {
                                        userBirthDay.day = value;
                                    }
                                } else if (key === 'onboarding_birth_month') {
                                    if (value.length <2) {
                                        userBirthDay.month = "0" + value;
                                    } else {
                                        userBirthDay.month = value;
                                    }
                                } else if (key === 'onboarding_birth_year') {
                                    userBirthDay.year = value;
                                } else if (key === 'onboarding_citizenship1') {
                                    submitFormData.append('citizenship', value);
                                } else if (key === 'onboarding_citizenship2') {
                                    submitFormData.append('citizenship_2', value);
                                } else if (key === 'onboarding_addressLine1') {
                                    userAddress.address_line_1 = value;
                                } else if (key === 'onboarding_addressLine2') {
                                    userAddress.address_line_2 = value;
                                } else if (key === 'onboarding_city') {
                                    userAddress.city = value;
                                } else if (key === 'onboarding_zip') {
                                    userAddress.zip = value;
                                } else if (key === 'onboarding_state') {
                                    userAddress.state = value;
                                } else if (key === 'onboarding_country') {
                                    userAddress.country = value;
                                } else if (key === 'onboarding_residenceStatus') {
                                    submitFormData.append('german_residence_status', value);
                                } else if (key === 'onboarding_gender_passport') {
                                    submitFormData.append('gender_passport', value);
                                } else if (key === 'onboarding_gender_chosen') {
                                    submitFormData.append('gender_chosen', value);
                                } else if (key === 'onboarding_marriageStatus') {
                                    submitFormData.append('marriage_status', value);
                                } else if (key === 'onboarding_parentalStatus') {
                                    submitFormData.append('parental_status', value);
                                } 
                            }

                            const userbirthString = `${userBirthDay.year}-${userBirthDay.month}-${userBirthDay.day}`;
                            const updatedUserAddress = JSON.stringify(userAddress);

                            submitFormData.append('birth_date',userbirthString);
                            submitFormData.append('address',updatedUserAddress);
                            
                            // 5. Get the form entries as an object
                            const data = Object.fromEntries(submitFormData.entries());
                            console.log(data);

                            // Construct the Authorization token
                            const wized_token = getCookie("wized_token");
                            const token = "Bearer " + wized_token;
                            
                            // 6. Send the data to the server
                            const response = await fetch(AUTH_URL + '/auth/onboarding', {
                                method: 'POST',
                                body: submitFormData,
                                headers: {
                                    Authorization: token,
                                }
                            });

                            // 6. Handle the response
                            const responseData = await response.json();

                            console.log(responseData);

                            console.log(response);

                            if (response.ok) {
                                if(!responseData.is_verified) {
                                    //send email verification
                                    redirectVerifyEmail();
                                }
                                

                                
                                
                            }
    
                            else {
                                
                                if (responseData.message === "No Account for this Email.") {
                                    errorDiv.firstChild.textContent = responseData.message;
                    
                                } else if (responseData.message === "Invalid Credentials.") {
                                    errorDiv.firstChild.textContent = responseData.message;
                                } else {
                                    errorDiv.firstChild.textContent = "Something went wrong... Please try again in a few minutes. If the error persists please contact us: hello@getworldify.com. Please add the following error message: "+response.message;
                                }

                                errorDiv.style.display = 'block';
                            }
                            
                            submitButton.value = "Submit";
                        
                        } catch (error) {
                            // 7. Handle the error
                            console.error("Error during onboarding:", error);
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

