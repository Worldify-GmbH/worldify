//import { renderDocuments, handleUploadedDocuments, handleFileInputChange, handleUpload }
import { getCookie, displayUser, redirectToLogin, resetPassword, emailReset, getAccountSettings, deleteCookie } from "../../../auth.js";
import { autoSaveFunction, debounce, fillFieldsFromDatabase, setupForm } from "../../../form_handling";
import { handleFileInputChange, handleUpload, handleUploadedDocuments, hideFilePreview, renderDocuments } from "../../../upload_files.js";
import { logging,downloadAllFilesSubmodule, setQueryParam, getQueryParam, reloadPage } from  "../../../utils.js";


/**
 * Renders the upload page for visa modules, including document lists and form settings.
 * Handles dynamic content based on user account settings and interaction with the page.
 */
export async function render() {

    try {
        const response = await getAccountSettings(getCookie('wized_token'));
        var submoduleId = null;

        if (response.success) {
            fillFieldsFromDatabase(response.user, 'account_');
            const formWrapper = document.querySelector('[w-el="formWrapper"]');
            var visaType = formWrapper.getAttribute('visatype');
            var relocationCity = document.getElementById('account_relocation_city_germany').value;
            if (relocationCity && visaType) {
                submoduleId = getModuleId(visaType,relocationCity);
                setCityNameInElements(relocationCity);
                setQueryParam('submoduleId',submoduleId)
            }
            

            if (formWrapper) {
                formWrapper.addEventListener('change', debounce((event) => {
                    autoSaveFunction(event, `${BASE_URL}/account_settings`);
                    relocationCity = document.getElementById('account_relocation_city_germany').value;
                    if (relocationCity && visaType) {
                        submoduleId = getModuleId(visaType,relocationCity);
                        setCityNameInElements(relocationCity);
                        setTimeout(reloadPage,1000);
                    }
                }, 500));

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
        
        await renderDocuments(submoduleId);
        handleUploadedDocuments();
        
        const missing_documents_list = document.querySelector('[w-el="document_missing_list"]');
        missing_documents_list.addEventListener('change', (event) => {
            handleFileInputChange(event);
        });
        missing_documents_list.addEventListener('click', (event) => {
            hideFilePreview(event);
        });

        //setup upload forms
        setupAllForms();
        
        const downloadAllButton = document.querySelector('[w-el="document_uploaded_downloadAll"]');
        downloadAllButton.addEventListener('click', downloadAllFilesSubmodule);

    } catch (error) {
        logging.error({
            message: 'Error in render function: ' + error.message,
            eventName: 'render_exception',
            extra: {}
        });
    }
}

/**
 * Gets a module ID based on the provided city name and visa type.
 * 
 * @param {string} cityName - The name of the city.
 * @param {string} visaType - The type of visa.
 * @returns {string|null} - The module ID if found, or null if not.
 */
function getModuleId(visaType, cityName="") {
    // Define a map where the keys are a combination of city name and visa type
    // and the values are corresponding module IDs.
    const moduleMap = {
        "residencePermit_Berlin": 10,
        "residencePermit_Munich": 11,
        "blueCard_Berlin": 12,
        "blueCard_Munich": 13,
        "freelance_Berlin" : 14,
        "freelance_Munich": 15,
        "familyReunification_Berlin": 18,
        "familyReunification_Munich": 19,
        "nationalDVisa_":20
    };

    // Construct the key from the function arguments
    const key = `${visaType}_${cityName}`;

    // Retrieve the module ID from the map
    const moduleId = moduleMap[key];

    // Return the module ID if found, or null otherwise
    return moduleId || null;
}

/**
 * Sets the text of all elements with a specific query selector to a given city name.
 * 
 * @param {string} cityName - The city name to set as the text content.
 */
function setCityNameInElements(cityName) {
    // Find all elements with the query selector '[w-el="cityName"]'
    const elements = document.querySelectorAll('[w-el="cityName"]');

    // Iterate over each element and set its text content to the provided city name
    elements.forEach(element => {
        element.textContent = cityName;
    });
}

function setupAllForms() {

    // Select the container with all the forms
    const uploadListWrapper = document.querySelector('[w-el="document_missing_list"]');

    // Iterate over each form within the container
    uploadListWrapper.querySelectorAll('.upload_component').forEach(form => {
        // Extract the form's ID
        const formId = form.id;

        // Call your function with the form's ID and other parameters
        setupForm(formId, transformUploadFormData, submitDocumentFormData,handleDocumentUploadResponse,true);
    });
}

/**
 * Transforms the form data for submission.
 * 
 * @param {FormData} formData - The original form data.
 * @returns {FormData} - Transformed formData with the file, document title, document id and submodule id.
 */
function transformUploadFormData(formData,event) {

    const form = event.target;

    const fileInput = form.querySelector('.input_files');
    const file = fileInput.files[0];

    const documentTitle = form.querySelector(
        '[w-el="document_missing_fileName"]'
      ).textContent;
        

    // Extract document and submodule IDs
    const documentId = parseInt(form.getAttribute("form-id"));
    const submoduleId = parseInt(getQueryParam("submoduleId"));

    // Create formData and append relevant information
    const resultFormData = new FormData();
    resultFormData.append("document_title", documentTitle);
    resultFormData.append("document_id", documentId);
    resultFormData.append("submodules_id", submoduleId);
    resultFormData.append("file", file);

    return resultFormData;
}

/**
 * Submits form data for a document upload to the server.
 * Sends a POST request with the provided formData and handles the server response.
 * 
 * @param {FormData} formData - The form data to be submitted for document upload.
 * @returns {Promise<Object>} - An object indicating the success status and message of the operation.
 */
async function submitDocumentFormData(formData) {
    try {
        const token = 'Bearer ' + getCookie("wized_token");
        const response = await fetch(BASE_URL + "/documents", {
            method: "POST",
            headers: { Authorization: token },
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            return { success: true, message: "The document was successfully uploaded." };
        } else {
            const errorMessage = data.message || 'Unknown error during document upload';
            logging.error({
                message: `Document upload failed: ${errorMessage}`,
                eventName: "documentUpload_failed"
            });
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        logging.error({
            message: "Error in document upload: " + error.message,
            eventName: "documentUpload_exception"
        });
        return { success: false, message: error.message || "Error occurred while uploading the document." };
    }
}

function handleDocumentUploadResponse(response){

    if (response.success) {
        setTimeout(reloadPage,1000);
    } else {
        logging.warning({
            message: "Document upload failed: " + response.message,
            eventName: "documentUpload_failed",
            extra: {}
        });
    }
}


