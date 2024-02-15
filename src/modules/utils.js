import { getCookie } from "./auth";
import { getDocuments } from "./upload_files";
import * as JSZip from "jszip";
import { TempusDominus } from '@eonasdan/tempus-dominus';



/**
 * Retrieves the value of a query parameter from the current URL.
 * @param {string} paramName - The name of the query parameter.
 * @returns {string|null} The value of the query parameter or null if not found.
 */
export function getQueryParam(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
}

/**
 * Sets a query parameter in the current URL.
 * If the parameter already exists, its value is updated.
 * If it does not exist, it is added.
 *
 * @param {string} paramName - The name of the query parameter.
 * @param {string} paramValue - The value of the query parameter.
 */
export function setQueryParam(paramName, paramValue) {
    // Check if the URL and URLSearchParams are supported
    if (!window.URL || !window.URLSearchParams) {
        logging.error({
            message: 'URL manipulation is not supported in this browser:' + window.navigator.userAgent,
            eventName: "setQueryParam_browser_support_error",
            extra: {}
        });
        return;
    }

    try {
        // Create a URL object based on the current location
        const url = new URL(window.location.href);

        // Update or add the query parameter
        url.searchParams.set(paramName, paramValue);

        // Update the current URL without reloading the page
        window.history.pushState({}, '', url);

    } catch (error) {
        logging.error({
            message: `Error in setting query parameter: ${error.message}. ${paramName} = ${paramValue}`,
            eventName: "setQueryParam_exception",
            extra: {}
        });
    }
}

/**
 * Reloads the current page.
 */
export function reloadPage() {
    window.location.reload();
}

/**
 * Renders a Typeform iframe into a specified container.
 * 
 * @param {string} formId - The ID of the Typeform to be rendered.
 * @param {Object} variables - Key-value pairs to be appended to the Typeform URL as query parameters.
 */
export async function renderTypeform(formId, variables) {
    try {
        const formContainer = document.querySelector('[w-el="visa_finder"]');
        if (!formContainer) {
            await logging.error({
                message: "Form container element not found. Form_id: " + formId,
                eventName: "renderTypeform",
                extra: { /*
                    context: "Initializing form rendering",
                    formId: formId, 
                    variables: JSON.stringify(variables)  // Stringifying for better readability in logs */
                }
            });
            return;
        }

        const queryString = Object.entries(variables)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');

        const iframe = document.createElement('iframe');
        iframe.src = `https://3vosfw9xns2.typeform.com/to/${encodeURIComponent(formId)}?${queryString}`;
        iframe.style.width = "100%";
        iframe.style.height = "500px";
        iframe.frameBorder = "0";
        iframe.scrolling = "no";
        iframe.allowFullscreen = true;
        iframe.sandbox = "allow-scripts allow-same-origin allow-top-navigation";

        formContainer.appendChild(iframe);
    } catch (error) {
        await logging.error({
            message: "Unexpected error in renderTypeform. Form_id: " + formId,
            eventName: "renderTypeform_exception",
            extra: { /*
                context: "Appending iframe to container",
                formId: formId, 
                variables: JSON.stringify(variables),
                errorDetails: error.message */
            }
        });
    }
}

/**
 * Converts a given text to a safe file name format.
 * It removes non-alphanumeric characters (excluding spaces), 
 * replaces spaces with underscores, and converts to lowercase.
 * 
 * @param {string} text - The text to be converted.
 * @returns {string} The converted text as a safe file name.
 */
export function toSafeFileName(text) {
    if (typeof text !== 'string') {
        logging.warning({
            message: "Non-string input provided to toSafeFileName. InputType: " + typeof text + ". Input value: " + text,
            eventName: "toSafeFileName",
            extra: { /*
                inputType: typeof text,
                inputValue: text  // Include the actual input value for reference */
            }
        });
        return '';
    }

    const safeFileName = text
        .replace(/[^a-z0-9\s]/gi, '') // Remove non-alphanumeric characters except spaces
        .replace(/\s+/g, '_')         // Replace spaces with underscores
        .toLowerCase();               // Convert to lowercase
    
    logging.info({
        message: "Converted text to safe file name",
        eventName: "toSafeFileName",
        extra: { /*
            originalText: text, 
            convertedText: safeFileName */
        }
    });

    return safeFileName;
}

/**
 * Checks if the file type of a given file is valid based on a predefined list.
 * 
 * @param {Object} file - The file object to be checked.
 * @returns {boolean} True if the file type is valid, false otherwise.
 */
export function validFileType(file) {

    if (typeof file !== 'object' || typeof file.type !== 'string') {
        logging.warning({
            message: "Invalid input to validFileType. FileType: " + typeof file,
            eventName: "validFileType_input_warning",
            extra: {/* fileType: file ? file.type : null */}
        });
        return false;
    }
    return fileTypes.includes(file.type);
}

/**
 * Converts a file size in bytes to a human-readable format.
 * 
 * @param {number} number - The file size in bytes.
 * @returns {string} The file size in a human-readable format (bytes, KB, or MB).
 */
export function returnFileSize(number) {
    if (typeof number !== 'number' || isNaN(number) || number < 0) {
        logging.error({
            message: "Invalid file size: Input must be a non-negative number. Input: " + number,
            eventName: "returnFileSize_input_error",
            extra: {}
        });
        throw new Error(errorMessage);
    }

    const ONE_KB = 1024;
    const ONE_MB = 1048576;

    if (number < ONE_KB) {
        return `${number} bytes`;
    } else if (number < ONE_MB) {
        return `${(number / ONE_KB).toFixed(1)} KB`;
    } else {
        return `${(number / ONE_MB).toFixed(1)} MB`;
    }
}

/**
 * Fetches a file as a blob from a specified URL.
 * 
 * @param {string} url - The URL from which to fetch the file.
 * @throws {Error} - Throws an error if the URL is invalid, 
 *                   or if the network response is not OK.
 * @returns {Promise<Blob>} - A promise that resolves to the file as a blob.
 */
export async function fetchFile(url) {
    if (typeof url !== 'string' || !url.trim()) {
        throw new Error('Invalid URL provided');
    }
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorMessage = `Network response was not ok (status: ${response.status}) for URL: ${url}`;
            logging.error({
                message: errorMessage,
                eventName: "fetchFile_network_error",
                extra: {}
            });
            throw new Error(errorMessage);
        }
        return response.blob();
    } catch (error) {
        logging.error({
            message: "Error in fetchFile: " + error.message + ". URL: "+ url,
            eventName: "fetchFile_error",
            extra: {}
        });
        throw error;
    }
}

/**
 * Downloads a collection of files from provided URLs and packages them into a ZIP archive.
 * 
 * @param {Array<Object>} data - Array of objects representing the files to be downloaded.
 *                               Each object should have 'attachment.path' and 'document_name' properties.
 * @param {string} [zipName='download.zip'] - The name for the resulting ZIP file.
 * 
 * The function fetches each file in parallel, then adds them to a ZIP archive
 * using the document names provided in the data array. It automatically triggers
 * the download of the ZIP file once the operation is complete.
 */
async function downloadFilesAsZip(data, zipName = 'download.zip') {
    // Creating a new instance of JSZip
    const zip = new JSZip();

    try {
        // Fetch all files as blobs in parallel
        const fileBlobs = await Promise.all(data.map(item => {
            let url = XANO_BASE + item.attachment.path; // Construct the full URL
            return fetchFile(url); // Fetch each file as a blob
        }));

        // Add each fetched file to the ZIP archive
        data.forEach((item, index) => {
            const fileExtension = item.attachment.mime.split('/')[1];
            const filename = toSafeFileName(item.document_name) + '.' + fileExtension;
            zip.file(filename, fileBlobs[index]); // Add file to zip
        });

        // Generate ZIP file and trigger download
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, zipName);
    } catch (error) {
        // Log error and potentially handle it or re-throw
        logging.error({
            message: "Failed to download files as ZIP: "+ error.message,
            eventName: "downloadFilesAsZip_error",
            extra: {}
        });
        throw error; // Rethrow the error if you want calling function to handle it
    }
}

/**
 * Fetches documents, filters out those that have not been uploaded,
 * and downloads the uploaded documents as a ZIP archive.
 * 
 * The function assumes that each document object contains 'document_uploaded'
 * and 'submodule_title' properties.
 */
export async function downloadAllFilesSubmodule() {
    try {
        const files = await getDocuments(getQueryParam("submoduleId"));

        // Ensure that files are received and not empty
        if (!Array.isArray(files) || files.length === 0) {
            throw new Error("No documents received or the array is empty.");
        }

        // Filter the data to include only uploaded documents
        const uploadedDocuments = files.filter(item => item.document_uploaded === 1);

        // Check if there are any uploaded documents
        if (uploadedDocuments.length === 0) {
            alert("You have not uploaded any documents for this module yet.");
            throw new Error("No uploaded documents found.");
        }

        // Create a safe file name for the ZIP archive
        const submodule_name = toSafeFileName(uploadedDocuments[0].submodule_title) + ".zip";

        // Download the uploaded documents as a ZIP archive
        await downloadFilesAsZip(uploadedDocuments, submodule_name);
    } catch (error) {
        logging.error({
            message: "Failed to download all files in submodule: " + error.message,
            eventName: "downloadAllFilesSubmodule_error",
            extra: {}
        });
        throw error; // Re-throw the error for further handling if necessary
    }
}

/**
 * Asynchronously downloads a file from a specified URL.
 * 
 * @param {string} url - The URL from which to download the file.
 * @param {string} filename - The name to be used for the downloaded file.
 * 
 * The function fetches the file as a blob using fetchFile and then triggers 
 * a download with the specified filename. Errors during fetching or downloading 
 * are caught and logged.
 */
export async function downloadFileFromUrl(url, filename) {
    try {
        // Fetch the file as a blob
        const blob = await fetchFile(url);
        
        // Trigger the file download using the 'saveAs' method from 'file-saver'
        saveAs(blob, filename);
    } catch (error) {
        // Log any errors that occur during fetching or downloading the file
        logging.error({
            message: "File download failed. Url: "+ url+". Message: " + error.message,
            eventName: "downloadFileFromUrl_error",
            extra: {/*url: url, 
                filename: filename, 
                errorDetails: error.message */}
        });
    }
}

/**
 * Hides a loader element on the page.
 *
 * This function targets an element with a specific selector and
 * sets its display style to 'none' to hide it. The function assumes
 * the existence of an element with the attribute '[w-el="pageLoader"]'.
 */
export function displayLoader() {
    // Query the DOM for the loader element
    const loader = document.querySelector('[w-el="pageLoader"]');

    if (loader) {
        // Hide the loader after a specified delay (1000ms in this case)
        setTimeout(() => {
            loader.style.display = "none";
        }, 1000);
    } else {
        logging.error({
            message: "Loader element not found in the DOM.",
            eventName: "displayLoader_error"
        });
    }
}

/**
 * Fetches Typeform submission results, retrying a specified number of times.
 * 
 * @param {string} form_id - The ID of the Typeform.
 * @param {string} response_id - The ID of the response to fetch.
 * @param {number} [maxRetries=3] - Maximum number of retry attempts.
 * @param {number} [delay=2000] - Delay in milliseconds between retries.
 * @throws {Error} - Throws an error if the data cannot be retrieved after the specified number of attempts.
 * @returns {Object} - The data fetched from the Typeform submission.
 */
export async function get_tf_result(form_id, response_id, maxRetries = 3, delay = 2000) {
    // Get the authentication token from cookies
    const token = getCookie('wized_token');

    // Prepare the data to be sent in the request
    const formData = new FormData();
    formData.append('form_id', form_id);
    formData.append('response_id', response_id);

    // Retry loop: attempts to fetch the data up to maxRetries times
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Attempt to fetch the response from the server
            const response = await fetch(BASE_URL + '/typeform_submissions', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                body: formData
            });

            // Parse the response data
            const data = await response.json();

            // Check if the response is OK and data is valid
            if (response.ok && data /* Add specific condition for data validity here */) {
                // Return the data if the response is successful and data is valid
                return data;
            } else {
                // Log an informational message if data is not valid, then retry after a delay
                logging.info({
                    message: `Response received but data not valid. Retrying attempt ${attempt} in ${delay}ms...`,
                    eventName: "get_tf_result_retry",
                    extra: { attempt, delay }
                });
                if (attempt < maxRetries) {
                    // Wait for the specified delay before the next retry attempt
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        } catch (error) {
            // Log any errors that occur during the fetch
            logging.error({
                message: 'Error in fetching Typeform response: ' + error.message,
                eventName: "get_tf_result_error",
                extra: { /*errorDetails: error.message, attempt, delay*/ }
            });
            if (attempt < maxRetries) {
                // Log an informational message about the retry after an error, then retry after a delay
                logging.info({
                    message: `Error occurred. Retrying attempt ${attempt} in ${delay}ms...`,
                    eventName: "get_tf_result_retry_error",
                    extra: {}
                });
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    // Throw an error if the maximum number of retries is reached without success
    throw new Error(`Failed to retrieve valid Typeform result after ${maxRetries} attempts.`);
}


/**
 * Fetches the status of a specific module.
 * 
 * @param {string} module - The name or identifier of the module.
 * @returns {Object} The status data of the module if successful, undefined otherwise.
 * 
 * The function makes a GET request to retrieve the status of the given module.
 * It handles potential errors and logs them using the custom logging framework.
 */
export async function getModuleStatus(module) {
    // Construct the Authorization token from the cookie
    const wized_token = getCookie("wized_token");
    const token = "Bearer " + wized_token;

    try {
        // Fetch the module status from the server
        const response = await fetch(BASE_URL + `/modules/status/${module}`, {
            method: 'GET',
            headers: {
                Authorization: token,
            }
        });

        // Parse the JSON response
        const data = await response.json();

        // Check if the response is OK and return the data
        if (response.ok) {
            return data;
        } else {
            // Log an informational message if the response is not OK
            logging.info({
                message: `Received response for ${module} status, but response was not OK`,
                eventName: "getModuleStatus_non_ok_response",
                extra: { /*
                    module: module, 
                    responseStatus: response.status*/ }
            });
        }
    } catch (error) {
        // Log any errors that occur during the fetch
        logging.error({
            message: `Error during get ${module} Status: ${error.message}`,
            eventName: "getModuleStatus_error",
            extra: {}
        });
    }
}

/**
 * Custom logging utility for sending log messages to a server.
 * Supports various severity levels and structured logging.
 *
 * Examples of usage:
 * 
 * Logging a verbose message:
 * logging.verbose({
 *     message: "Detailed debug information",
 *     eventName: "debug_event",
 *     extra: { detail: "More detailed information here" }
 * });
 * 
 * Logging an informational message:
 * logging.info({
 *     message: "User logged in successfully",
 *     eventName: "user_login",
 *     extra: { userId: "12345", timestamp: new Date().toISOString() }
 * });
 * 
 * Logging a warning:
 * logging.warning({
 *     message: "Configuration file missing optional entries",
 *     eventName: "config_warning",
 *     extra: { configFile: "/path/to/config" }
 * });
 * 
 * Logging an error:
 * logging.error({
 *     message: "Failed to connect to the database",
 *     eventName: "db_connection_error",
 *     extra: { errorDetails: "Connection timeout" }
 * });
 * 
 * Logging a critical error:
 * logging.critical({
 *     message: "Application crashed due to unhandled exception",
 *     eventName: "app_crash",
 *     extra: { errorStack: "Stack trace here" }
 * });
 */
export const logging = {

    /**
     * Sends a log message to the server with the specified details.
     * 
     * @param {Object} params - Log parameters including severity, message, eventName, and extra data.
     * @returns {Promise<boolean>} - True if the log is sent successfully, false otherwise.
     */
    async sendLog({ severity = 'info', message, eventName = '', extra = {} }) {
        const formData = new FormData();
        formData.append('severity', severity);
        formData.append('message', message);
        formData.append('eventName', eventName);
        formData.append('extra', JSON.stringify(extra));

        try {
            const response = await fetch(BASE_URL + '/ncscale_logging', {
                method: 'POST',
                body: formData
            });

            // Handle non-OK responses from the server
            if (!response.ok) {
                console.error('Failed to send log:', await response.text());
                return false;
            }

            return true;
        } catch (error) {
            // Handle errors in sending the log
            console.error('Error sending log:', error);
            return false;
        }
    },

    // Each method below sends a log with a different severity level

    verbose(args) {
        return this.sendLog({ severity: 'verbose', ...args });
    },

    info(args) {
        return this.sendLog({ severity: 'info', ...args });
    },

    warning(args) {
        return this.sendLog({ severity: 'warning', ...args });
    },

    error(args) {
        return this.sendLog({ severity: 'error', ...args });
    },

    critical(args) {
        return this.sendLog({ severity: 'critical', ...args });
    }
};

/*
export function attachDatePicker() {
    const datepickerElements = document.querySelectorAll('.datepicker');

    datepickerElements.forEach(element => {
        new Pikaday({
            field: element,
            format: 'YYYY-MM-DD',
            toString(date, format) {
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            return `${year}-${month}-${day}`;
            }
        });
    });

}*/

export function attachDatePicker() {
    const datepickerElements = document.querySelectorAll('.datepicker');

    datepickerElements.forEach(element => {
        new TempusDominus(element, {
            display: {
                components: {
                    decades: false,
                    year: true,
                    month: true,
                    date: true,
                    hours: false,
                    minutes: false,
                    seconds: false
                }
            },
            localization: {
                format: 'yyyy-MM-dd'
            }
        });
    });
}

/**
 * Handles the removal of loader elements from a specified ancestor of a given element.
 * 
 * @param {Element} element - The reference element to start the search from.
 * @param {string} loaderClass - The CSS class of the loader elements to remove.
 * @param {string} parentAttribute - The attribute of the parent element where loaders are located.
 * @param {number} levelLimit - The maximum number of levels to search for the parent element.
 */
export function handleLoaderRemoval(element, loaderClass = '.skeleton-loader', parentAttribute = '[w-el="loader-parent"]') {
    const loaderParent = element.closest(parentAttribute);
    if (loaderParent) {
        const loaders = loaderParent.querySelectorAll(loaderClass);
        // loaders.forEach(loader => setTimeout(() => loader.remove(), 500));
        loaders.forEach(loader => loader.remove());

    } else {
        // Log if the loader's parent element is not found
        logging.warning({
            message: "handleLoaderRemoval: Loader parent not found for element " + element,
            eventName: "handleLoaderRemoval_parent_not_found",
            extra: {}
        });
    }
}

export function hasChildWithSelector(element, selector) {
    const child = element.querySelector(selector);
    return !!child; // !! converts the truthy/falsy value to boolean
  }

