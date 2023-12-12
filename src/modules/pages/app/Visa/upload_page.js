//import { renderDocuments, handleUploadedDocuments, handleFileInputChange, handleUpload }
import { getCookie, displayUser, redirectToLogin, resetPassword, emailReset, getAccountSettings, deleteCookie } from "../../../auth.js";
import { autoSaveFunction, debounce, fillFieldsFromDatabase, setupForm } from "../../../form_handling";
import { handleFileInputChange, handleUpload, handleUploadedDocuments, renderDocuments } from "../../../upload_files.js";
import { logging,downloadAllFilesSubmodule, setQueryParam } from  "../../../utils.js";



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
            }
            

            if (formWrapper) {
                formWrapper.addEventListener('change', debounce((event) => {
                    autoSaveFunction(event, `${BASE_URL}/account_settings`);
                    relocationCity = document.getElementById('account_relocation_city_germany').value;
                    if (relocationCity && visaType) {
                        submoduleId = getModuleId(visaType,relocationCity);
                        renderDocuments(submoduleId);
                        setCityNameInElements(relocationCity);
                        console.log(submoduleId);
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
        
        renderDocuments(submoduleId);
        handleUploadedDocuments();
        
        const missing_documents_list = document.querySelector('[w-el="document_missing_list"]');
        missing_documents_list.addEventListener('change', (event) => {
            handleFileInputChange(event);
        });
        missing_documents_list.addEventListener('click', (event) => {
            handleUpload(event);
        });
        // const uploaded_documents_list = document.querySelector('[w-el="document_uploaded_list"]');
        // uploaded_documents_list.addEventListener('click', (event => {
        //    handleUploadedDocuments(event);
        // }));
        
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