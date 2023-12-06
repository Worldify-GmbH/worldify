import { getCookie, getQueryParam, checkAuthentication} from "../../auth";
import { setupForm } from "../../form_handling";
import { logging } from "../../utils";

export async function render () {
    
    const successBanner = document.querySelector('[w-el="verification_success"]');
    const failedBanner = document.querySelector('[w-el="verification_failed"]');

    //get cookie and check if user is already verified
    const authResponse = await checkAuthentication();
    console.log(authResponse.user.is_verified)
    if (authResponse.success) {
        if (!authResponse.user.is_verified) {
            const magicToken = getQueryParam('token');
            const formData = new FormData();

            formData.append('magic_token',magicToken);

            try {
                const response = await fetch(AUTH_URL + '/auth/magic-login', {
                    method: 'POST',
                    headers: {},
                    body: formData
                });

                const data = await response.json();
                const authResponse = await checkAuthentication();
                console.log(data);
                console.log(response);

                if (response.ok && authResponse.user.is_verified) {
                    successBanner.classList.remove('hide');
                    setTimeout(() => {
                        successBanner.classList.add('hide');
                    }, 10000);
                } else {
                    failedBanner.classList.remove('hide');
                    setTimeout(() => {
                        failedBanner.classList.add('hide');
                        //redirectVerifyEmail();
                    }, 10000);
                }
            } catch (error) {
                console.error('Error with magic login:', error);
            }
        }
    }
    setupForm('onboarding_form_1',transformOnboardingFormData,submitOnboardingFormData,handleOnboardingResponse1,false)
    setupForm('onboarding_form_2',transformOnboardingFormData,submitOnboardingFormData,handleOnboardingResponse2,false)
    //setup form

    //if not get the query parameter and perform all these actions.

    //if this worked, show the success banner, hide it again after 10 seconds

    // if it didnt work, show the error banner with the error message and redirect to the page where you can resend the link in 10 seconds (with timer).    
}

function transformOnboardingFormData(formData) {
    const transformedData = new FormData();

    for (const [key, value] of formData.entries()) {

        const fieldName = key.split("_").slice(1).join("_");

        // Splitting the key based on '__' to handle nested objects
        const parts = fieldName.split('__');

        // Determine if the form field is nested and append data accordingly
        if (parts.length === 2) {
            const [objectName, objectKey] = parts;
            transformedData.append(`${objectName}[${objectKey}]`, value);
        } else {
            transformedData.append(fieldName, value);
        }
    }
    return transformedData;
}

/**
 * Submits the signup form data to the server.
 * 
 * @param {FormData} formData - The transformed form data.
 * @returns {Promise<Object>} - The response data from the server.
 */
async function submitOnboardingFormData(inputFormData) {
    
    const token = getCookie("wized_token");

    for (const [key, value] of inputFormData.entries()) {
        console.log(`${key}: ${value}`);
    }

    try {
        const response = await fetch(`${BASE_URL}/onboarding`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: inputFormData,
            
        });

        const data = await response.json();

        console.log(data)

        // Check the response status
        if (response.ok) {
            logging.info({
                message: "Signup request successful",
                eventName: "signup_success",
                extra: {}
            });
            return { success: true, message: "Submitting onboarding information was successful.",user:data };
        } else {
            const errorMessage = data.message || 'Signup failed due to unknown error';
            logging.error({
                message: `Signup request failed: ${errorMessage}`,
                eventName: "signup_failed",
                extra: { response: data }
            });
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        logging.error({
            message: "Error during signup process",
            eventName: "signup_process_error",
            extra: { errorDetails: error.message }
        });
        return { success: false, message: error.message || "Error occurred during the onboarding submission process" };
    }
}

/**
 * Handles the response received after signup form submission.
 * 
 * @param {Object} response - The response object received from the form submission.
 */
async function handleOnboardingResponse1(response) {
    const formElement = document.getElementById('onboarding_form_1').parentElement;
    const nextFormElement = document.getElementById('onboarding_form_2').parentElement;

    if (formElement && nextFormElement) {
        formElement.classList.add('hide')
        nextFormElement.classList.remove('hide')
    }
}

/**
 * Handles the response received after signup form submission.
 * 
 * @param {Object} response - The response object received from the form submission.
 */
async function handleOnboardingResponse2(response) {
    const formElement = document.getElementById('onboarding_form_2').parentElement;
    const nextFormElement = document.getElementById('onboarding_pricing');

    if (formElement && nextFormElement) {
        formElement.classList.add('hide')
        nextFormElement.classList.remove('hide')
    }
}
/*
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

*/
