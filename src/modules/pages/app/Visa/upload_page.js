//import { renderDocuments, handleUploadedDocuments, handleFileInputChange, handleUpload }
import { getCookie, displayUser, redirectToLogin, resetPassword, emailReset, getAccountSettings, deleteCookie } from "../../../auth.js";
import { autoSaveFunction, debounce, fillFieldsFromDatabase, setupForm } from "../../../form_handling";
import { handleDocuments, handleFileInputChange, handleUpload, hideFilePreview, renderDocuments, updateDocuments, updateVisaRelocationCity } from "../../../upload_files.js";
import { logging,downloadAllFilesSubmodule, setQueryParam, getQueryParam, reloadPage } from  "../../../utils.js";

/**
 * Renders the upload page for visa modules, including document lists and form settings.
 * Handles dynamic content based on user account settings and interaction with the page.
 */
export async function render() {

    try {

        // Select the parent elements for document rendering
        const parentElementDocumentList = document.querySelector(
            '[w-el="document_list"]'
          );

        const response = await getAccountSettings(getCookie('wized_token'));

        if (response.success) {
            fillFieldsFromDatabase(response.user, 'account_');
            const formWrapper = document.querySelector('[w-el="formWrapper"]');
            

            if (formWrapper) {
                formWrapper.addEventListener('change', async function (event) {
                    autoSaveFunction(event, `${BASE_URL}/account_settings`);
                    const submoduleId = updateVisaRelocationCity();
                    updateDocuments(parentElementDocumentList, submoduleId);
                });

            } else {
                logging.warning({
                    message: 'render: Form wrapper not found',
                    eventName: 'render_no_formWrapper',
                });
            }
            const submoduleId = updateVisaRelocationCity();
            updateDocuments(parentElementDocumentList, submoduleId);
            handleDocuments(parentElementDocumentList);
            const downloadAllButton = document.querySelector('[w-el="document_uploaded_downloadAll"]');
            if (downloadAllButton){downloadAllButton.addEventListener('click', function () {
                downloadAllFilesSubmodule(submoduleId);
            })};
        } else {
            logging.error({
                message: 'render: Failed to fetch account settings: ' + response.message,
                eventName: 'render_fetch_error',
                extra: {}
            });
            return;
        }

    } catch (error) {
        logging.error({
            message: 'Error in render function: ' + error.message,
            eventName: 'render_exception',
            extra: {}
        });
    }
}


