import { getCookie, displayUser } from "./auth";
import { logging } from "./utils";

/**
 * Sets up a form with custom submission and response handling.
 * 
 * @param {string} formId - The ID of the form element in the DOM.
 * @param {Function} onSubmitCustom - Function to transform formData before submission.
 * @param {Function} submitFormData - Function that handles the actual submission of the form data.
 * @param {Function|null} responseHandler - Optional function to handle the response after form submission.
 */
export function setupForm(formId, onSubmitCustom, submitFormData, responseHandler = null,show_success=true) {
    const formElement = document.getElementById(formId);
    
    if (!formElement) {
        logging.error({
            message: `setupForm: Form with ID '${formId}' not found`,
            eventName: "form_setup_error",
            extra: {}
        });
        return;
    }

    // Remove Webflow's form styling class
    formElement.parentElement.classList.remove('w-form');

    // Set the form submission event handler
    formElement.onsubmit = async (event) => {
        event.preventDefault();
        const submitButton = formElement.querySelector('[w-el="submitButton"]');

        // Handle the submit button state during form processing
        handleButtonState(submitButton, true);

        try {
            const customData = onSubmitCustom(new FormData(formElement),event);
            const response = await submitFormData(customData);
            handleFormResponse(formElement, response, show_success);

            if (responseHandler) {
                await responseHandler(response);
            }
        } catch (error) {
            logging.error({
                message: "Error during form submission for form " + formId + ": " + error.message,
                eventName: "form_submission_error",
                extra: {}
            });
        } finally {
            // Restore the submit button to its initial state
            handleButtonState(submitButton, false);
        }
    };
}

/**
 * Handles the state of the submit button during form processing.
 * 
 * @param {HTMLElement} button - The submit button element.
 * @param {boolean} isLoading - Indicates if the form is in the loading state.
 */
function handleButtonState(button, isLoading) {
    if (isLoading) {
        button.value = button.getAttribute('data-wait');
    } else {
        button.value = button.getAttribute('data-initial-state');
    }
}

/**
 * Handles the response received from a form submission, displaying appropriate success or error feedback.
 *
 * @param {HTMLFormElement} formElement - The form element associated with the response.
 * @param {Object} response - The response object received from the form submission.
 * @param {string} formType - A string representing the type of form (e.g., 'Email', 'Password').
 */
function handleFormResponse(formElement, response, formType,show_success) {

    //console.log("handleFormResponse: ", formElement,show_success, response)
    // Validate if the form element is an HTMLFormElement
    if (!(formElement instanceof HTMLFormElement)) {
        logging.error({
            message: 'handleFormResponse: Invalid form element. FormElementType: ' + typeof formElement,
            eventName: 'handleFormResponse_invalid_input',
            extra: {}
        });
        return;
    }

    // Ensure the response is an object
    if (typeof response !== 'object' || response === null) {
        logging.error({
            message: 'handleFormResponse: Invalid response object. ResponseType: ' + typeof response,
            eventName: 'handleFormResponse_invalid_response',
            extra: {}
        });
        return;
    }

    const successDiv = formElement.parentNode.querySelector('[w-el="form_success"]');
    const errorDiv = formElement.parentNode.querySelector('[w-el="form_error"]');

    if (!successDiv || !errorDiv) {
        logging.error({
            message: 'handleFormResponse: Success or Error division not found in the form for form_id: ' + formElement.id,
            eventName: 'handleFormResponse_no_div_found',
            extra: {}
        });
        return;
    }

    if (response.success) {
        formElement.reset();
        if (show_success) {
            formElement.classList.add('hide');
            successDiv.style.display = 'block';
            setTimeout(() => {
                successDiv.style.display = 'none';
                formElement.classList.remove('hide');
            }, 5000);
        }
    } else {
        displayFormFeedback(formElement, response.message || `Error updating ${formType}`);
    }
}

/**
 * Displays feedback messages for form operations, such as errors or validation messages.
 *
 * @param {HTMLFormElement} formElement - The form element associated with the feedback.
 * @param {string} message - The message to be displayed in the feedback.
 */
function displayFormFeedback(formElement, message) {
    // Validate if the form element is an HTMLFormElement
    if (!(formElement instanceof HTMLFormElement)) {
        logging.error({
            message: 'displayFormFeedback: Invalid form element. formElementType: ' + typeof formElement,
            eventName: 'displayFormFeedback_invalid_input',
            extra: {}
        });
        return;
    }

    // Ensure the message is a string
    if (typeof message !== 'string') {
        logging.error({
            message: 'displayFormFeedback: Non-string message provided. messageType: ' + typeof message,
            eventName: 'displayFormFeedback_invalid_message',
            extra: {}
        });
        return;
    }

    const errorDiv = formElement.parentNode.querySelector('[w-el="form_error"]');

    // Check if the error division exists
    if (!errorDiv) {
        logging.error({
            message: 'displayFormFeedback: Error division not found in the form for form_id: ' + formElement.id,
            eventName: 'displayFormFeedback_no_error_div',
            extra: {}
        });
        return;
    }

    // Check if the error division has a first child for displaying the message
    if (!errorDiv.firstChild) {
        logging.error({
            message: 'displayFormFeedback: No element to display the message in error division for form_id: '+ formElement.id ,
            eventName: 'displayFormFeedback_no_child_element',
            extra: {}
        });
        return;
    }

    errorDiv.firstChild.textContent = message;
    errorDiv.style.display = 'block';

    // Hide the error message after a delay
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

/**
 * Shows a visual feedback indicator next to an input element to inform the user that their changes have been saved.
 * A checkmark image is displayed briefly before disappearing.
 * 
 * @param {HTMLElement} inputElement - The input element near which the feedback should be shown.
 */
function showSavedFeedback(inputElement) {
    if (!(inputElement instanceof HTMLElement)) {
        logging.error({
            message: 'showSavedFeedback: Invalid input element. inputElementType: ' + typeof inputElement,
            eventName: 'showSavedFeedback_invalid_input',
            extra: {}
        });
        return;
    }

    try {
        // Create a container div for the feedback
        const feedbackContainer = document.createElement('div');
        feedbackContainer.className = 'form-saved';

        // Use an image element for better accessibility
        const checkmarkImage = document.createElement('img');
        checkmarkImage.src = "https://assets-global.website-files.com/6425a24ce19fc41cdf5f0029/6425a24ce19fc456025f0084_check-checkbox.svg";
        checkmarkImage.alt = "Saved";
        checkmarkImage.loading = "lazy";

        // Append the image to the container and insert the container in the DOM
        feedbackContainer.appendChild(checkmarkImage);
        inputElement.parentNode.insertBefore(feedbackContainer, inputElement.nextSibling);

        // Remove the feedback after a delay
        setTimeout(() => feedbackContainer.remove(), 2000);

    } catch (error) {
        logging.error({
            message: 'Error in showSavedFeedback: ' + error.message,
            eventName: 'showSavedFeedback_exception',
            extra: {}
        });
    }
}

/**
 * Automatically saves the data of a form field to the server when an event (like 'change') is triggered.
 * It supports both nested and non-nested form fields and can target different endpoints.
 *
 * @param {Event} event - The event that triggered the auto-save function.
 * @param {string} endpointUrl - The URL endpoint to which the form data should be sent.
 */
export async function autoSaveFunction(event, endpointUrl) {
    const token = getCookie('wized_token');
    const formData = new FormData();
    const fieldName = event.target.getAttribute('w-el').split("_").slice(1).join("_");

    // Splitting the field name based on '__' to handle nested objects
    const parts = fieldName.split('__');
    const formValue = event.target.value;

    // Determine if the form field is nested and append data accordingly
    if (parts.length === 2) {
        const [objectName, objectKey] = parts;
        formData.append(`${objectName}[${objectKey}]`, formValue);
    } else {
        formData.append(fieldName, formValue);
    }

    try {

        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (response.ok) {
            showSavedFeedback(event.target);  // Show visual feedback for successful save
        } else {
            const errorResponse = await response.json();
            logging.error({
                message: `Error saving data: ' + ${errorResponse.message}. Url: ${endpointUrl}`,
                eventName: 'autoSaveFunction_error',
                extra: {}
            });
        }
    } catch (error) {
        logging.error({
            message: 'Exception in autoSaveFunction: ' + error.message,
            eventName: 'autoSaveFunction_exception',
            extra: {}
        });
    }
}

/**
 * Populates HTML input fields based on a data object.
 * 
 * @param {Object} data - The data object containing key-value pairs.
 * @param {string} prefix - A prefix used for nested objects to create unique identifiers for fields.
 */
export function fillFieldsFromDatabase(data, prefix = '') {
    if (!data || typeof data !== 'object') {
        logging.error({
            message: "Invalid or null data provided to fillFieldsFromDatabase",
            eventName: "fillFieldsFromDatabase_invalid_data",
            extra: {}
        });
        return;
    }

    Object.entries(data).forEach(([key, value]) => {
        if (value === null || value === '') {
            // Skip null or empty string values
            return;
        } else if (typeof value !== 'object') {
            // For non-object, non-null values, set the input field value
            const inputField = document.querySelector(`[w-el="${prefix}${key}"]`);
            if (inputField) {
                inputField.value = value;
            } else {
                /*
                logging.warning({
                    message: `Input field not found for key: ${prefix}${key}`,
                    eventName: "fillFieldsFromDatabase_field_not_found",
                    extra: {}
                });
                */
            }
        } else {
            // If value is an object, recursively call the function with concatenated key
            fillFieldsFromDatabase(value, `${prefix}${key}__`);
        }
    });
}

/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds have elapsed
 * since the last time the debounced function was invoked.
 * 
 * The debounce technique allows for grouping a series of sequential calls to a function into a single
 * call, especially useful for events like scrolling, resizing, keystroke, or mouse movements.
 *
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @returns {Function} - A new debounced function.
 */
export function debounce(func, wait) {
    let timeoutId;

    // Returns a function that, as long as it continues to be invoked, will not be triggered
    return function(...args) {
        // Clear the timeout if the function is called again within the wait period
        clearTimeout(timeoutId);

        // Set a new timeout
        timeoutId = setTimeout(() => {
            timeoutId = null; // Clear timeoutId once the function is executed
            func.apply(this, args); // Apply the function with 'this' context and arguments
        }, wait);
    };
}
