import { getCookie } from "./auth";
import { setupForm } from "./form_handling";
import {
  validFileType,
  returnFileSize,
  toSafeFileName,
  downloadFileFromUrl,
  handleLoaderRemoval,
  reloadPage,
  logging,
  getQueryParam,
  hasChildWithClass,
  hasChildWithSelector,
  setQueryParam,
  downloadAllFilesSubmodule,
} from "./utils";

/**
 * Asynchronously retrieves documents related to a specific submodule.
 * The function fetches a list of documents from a server endpoint,
 * processing each document's details including its upload status and attachment data.
 *
 * @param {string} submodule_id - The ID of the submodule for which documents are being retrieved.
 * @returns {Promise<Array| null>} - An array of document objects on success, or null on failure.
 */
export async function getDocuments(submodule_id) {
  // Retrieve the authentication token
  const wized_token = getCookie("wized_token");
  const token = "Bearer " + wized_token;

  // Construct the request URL with query parameters
  const baseURL = BASE_URL + "/documents/utils/docsForModule";
  const url = new URL(baseURL);
  url.searchParams.append("module_id", submodule_id);

  try {
    // Perform the GET request to fetch documents
    const response = await fetch(url, {
      method: "GET",
      headers: { Authorization: token },
    });

    // Check if the response is OK and process the JSON response
    if (response.ok) {
      let jsonResponse = await response.json();
      // Process each document, parsing the attachment data if uploaded
      return jsonResponse.map((element) => {
        return element.document_uploaded === 1
          ? { ...element, attachment: JSON.parse(element.attachment) }
          : element;
      });
    } else {
      // Log a warning if the response is not OK
      await logging.warning({
        message: "Failed to fetch documents: Non-OK response from server",
        eventName: "getDocuments_non_ok_response",
      });
      return null;
    }
  } catch (error) {
    // Log an error if an exception occurs
    await logging.error({
      message: `Error while getting documents: ${error.message}`,
      eventName: "getDocuments_exception",
    });
    return null;
  }
}

/**
 * Appends an HTML structure representing a missing file item to a given parent element.
 *
 * @param {Object} doc - An object containing the document metadata. It should have an 'id' and 'document_title' property.
 * @param {HTMLElement} parentElement - The parent DOM element to which the constructed HTML will be appended.
 */
function missingFileItem(doc) {
  var is_required = "";

  if (doc.status === "mandatory") {
    is_required = "";
  } else {
    is_required = "hide";
  }

  // Create the main HTML content using template literals.
  const html = `
    <div class="upload_form w-form" id="${doc.document_id}">
      <form id="upload_document_${doc.document_id}" form-id="${doc.document_id}" name="email-form" data-name="Document Upload" method="get" class="upload_component" data-wf-page-id="64da509a57ec161d3037c211" data-wf-element-id="a4aa46e6-6db6-9b6a-1795-f5373f7b8a0c" aria-label="Email Form">
        <div class="upload_header">
            <div w-el="document_missing_fileName" id="w-node-bb0ca9e4-6a1b-f92d-7785-b8698d5d14a4-3037c211" class="upload_title">${doc.document_name}</div>
            <div id="w-node-_512173ee-2851-8070-77fa-7e4b8af0d09b-3037c211" class="upload_button-wrapper">
              <div class="upload_required-label ${is_required}">
                  <div>Required</div>
              </div>
              <div id="w-node-c5d6a9d2-e381-2e0b-4771-6b07f89a7db0-3037c211" class="upload-item_header_file-upload">
                  <div class="module-upload_file-upload w-embed" w-el="upload_uploadButton">
                    <label w-el="document_missing_fileLabel" class="upload_upload-button" for="document_${doc.document_id}">
                    Upload Document
                    <input id="document_${doc.document_id}" class="input_files" type="file" accept="image/*,.pdf" w-el="document_missing_file">
                    </label>
                    <style>
                        .input_files {
                        display: none;
                        }
                    </style>
                  </div>
              </div>
              <a href="#" class="button is-alternate hide w-inline-block" w-el="upload_closeButton">
                  <div class="icon-embed-xsmall w-embed">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--ic" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M18.3 5.71a.996.996 0 0 0-1.41 0L12 10.59L7.11 5.7A.996.996 0 1 0 5.7 7.11L10.59 12L5.7 16.89a.996.996 0 1 0 1.41 1.41L12 13.41l4.89 4.89a.996.996 0 1 0 1.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"></path>
                    </svg>
                  </div>
              </a>
            </div>
        </div>
        <div w-el="upload_previewFileWrapper" class="upload-item_preview-file hide">
            <div w-el="upload_previewText" class="upload-item_preview_text-wrapper">
              <div>No file currently selected for upload.</div>
              <div>File name:&nbsp;<span>file_name</span>, file size:&nbsp;<span>file_size</span></div>
            </div>
            <input w-el="submitButton" type="submit" value="Submit" data-wait="Please wait..." data-initial-state="Submit" class="button w-button">
        </div>
      </form>
      <div w-el="form_success" class="upload_success w-form-done" tabindex="-1" role="region" aria-label="Email Form success">
        <div>The document was successfully uploaded.</div>
      </div>
      <div w-el="form_error" class="w-form-fail" tabindex="-1" role="region" aria-label="Email Form failure">
        <div class="account_error-text">Oops! Something went wrong while submitting the document.</div>
      </div>
    </div>
  `;
  return html;
}

/**
 * Appends an HTML structure representing a uploaded file item to a given parent element.
 *
 * @param {Object} doc - An object containing the document metadata. It should have an 'id' and 'document_title' property.
 * @param {HTMLElement} parentElement - The parent DOM element to which the constructed HTML will be appended.
 */
export function uploadedFileItem(doc) {
  const file = doc.attachment;
  const url = "https://xfa3-mghj-yd9n.n7c.xano.io" + file.path;

  var is_required = "";

  if (doc.status === "mandatory") {
    is_required = "";
  } else {
    is_required = "hide";
  }

  const html = `
  <div class="download_component" id=${doc.upload_id}>
   <div class="download_title">${doc.document_name}</div>
   <div class="download_file-size hide-mobile-landscape">
      <div w-el="file_type" class="file-item_tag background-color-black">
         <div w-el="document_uploaded_fileType">${file.type}</div>
      </div>
      <div w-el="document_uploaded_fileSize" class="text-size-small hide-mobile-landscape">${returnFileSize(
         file.size
         )}
      </div>
   </div>
   <div class="file-item_icon-wrapper">
      <div class="upload_required-label ${is_required}">
         <div>Required</div>
      </div>
      <div class="upload_action-button-wrapper">
         <a w-el="document_uploaded_see" id="w-node-c6f311e6-05e5-1000-6f16-ee2717c27409-3037c211" href="${url}" target="_blank" class="file-item_button w-inline-block">
            <div id="w-node-c6f311e6-05e5-1000-6f16-ee2717c2740a-3037c211" class="file-item_button-image w-embed">
               <svg width="30" height="21" viewBox="0 0 30 21" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.0034 16.1667C16.5785 16.1667 17.9161 15.6154 19.0161 14.5127C20.1161 13.4101 20.6661 12.0712 20.6661 10.4961C20.6661 8.92091 20.1148 7.58333 19.0122 6.48333C17.9096 5.38333 16.5707 4.83333 14.9955 4.83333C13.4203 4.83333 12.0828 5.38464 10.9828 6.48727C9.88276 7.58987 9.33276 8.92876 9.33276 10.5039C9.33276 12.0791 9.88407 13.4167 10.9867 14.5167C12.0893 15.6167 13.4282 16.1667 15.0034 16.1667ZM14.9916 14.2333C13.9524 14.2333 13.0717 13.8696 12.3494 13.1422C11.6272 12.4147 11.2661 11.5314 11.2661 10.4922C11.2661 9.45294 11.6298 8.57222 12.3573 7.85C13.0847 7.12778 13.9681 6.76667 15.0073 6.76667C16.0465 6.76667 16.9272 7.13039 17.6494 7.85783C18.3717 8.5853 18.7328 9.46863 18.7328 10.5078C18.7328 11.5471 18.369 12.4278 17.6416 13.15C16.9141 13.8722 16.0308 14.2333 14.9916 14.2333ZM14.9994 20.5C11.755 20.5 8.82165 19.5778 6.19943 17.7333C3.57721 15.8889 1.62165 13.4778 0.332764 10.5C1.62165 7.52222 3.57721 5.11111 6.19943 3.26667C8.82165 1.42222 11.755 0.5 14.9994 0.5C18.2439 0.5 21.1772 1.42222 23.7994 3.26667C26.4217 5.11111 28.3772 7.52222 29.6661 10.5C28.3772 13.4778 26.4217 15.8889 23.7994 17.7333C21.1772 19.5778 18.2439 20.5 14.9994 20.5Z" fill="currentColor"></path>
               </svg>
            </div>
         </a>
         <a w-el="document_uploaded_download" href="#" attachment=${url} class="file-item_button w-inline-block">
            <div id="w-node-c6f311e6-05e5-1000-6f16-ee2717c2740c-3037c211" class="file-item_button-image w-embed">
               <svg width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.66675 18.5H18.6667V16.7H6.66675V18.5ZM12.5767 14.72L17.3167 10.01L16.0567 8.75L13.5067 11.27V5.3H11.7067V11.27L9.15675 8.75L7.89675 10.01L12.5767 14.72ZM12.6667 24.5C11.0267 24.5 9.47675 24.185 8.01675 23.555C6.55675 22.925 5.28175 22.065 4.19175 20.975C3.10175 19.885 2.24175 18.61 1.61175 17.15C0.981748 15.69 0.666748 14.14 0.666748 12.5C0.666748 10.84 0.981748 9.28 1.61175 7.82C2.24175 6.36 3.10175 5.09 4.19175 4.01C5.28175 2.93 6.55675 2.075 8.01675 1.445C9.47675 0.815 11.0267 0.5 12.6667 0.5C14.3267 0.5 15.8867 0.815 17.3467 1.445C18.8067 2.075 20.0767 2.93 21.1567 4.01C22.2367 5.09 23.0917 6.36 23.7217 7.82C24.3517 9.28 24.6667 10.84 24.6667 12.5C24.6667 14.14 24.3517 15.69 23.7217 17.15C23.0917 18.61 22.2367 19.885 21.1567 20.975C20.0767 22.065 18.8067 22.925 17.3467 23.555C15.8867 24.185 14.3267 24.5 12.6667 24.5Z" fill="currentColor"></path>
               </svg>
            </div>
         </a>
         <a w-el="document_uploaded_delete" href="#" class="file-item_button w-inline-block">
            <div class="file-item_button-image w-embed">
               <svg width="22" height="25" viewBox="0 0 22 25" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4.03341 24.5C3.50008 24.5 3.03341 24.3 2.63341 23.9C2.23341 23.5 2.03341 23.0333 2.03341 22.5V3.5H0.666748V1.5H6.93342V0.5H15.7334V1.5H22.0001V3.5H20.6334V22.5C20.6334 23.0333 20.4334 23.5 20.0334 23.9C19.6334 24.3 19.1667 24.5 18.6334 24.5H4.03341ZM7.56675 19.6333H9.56675V6.33333H7.56675V19.6333ZM13.1001 19.6333H15.1001V6.33333H13.1001V19.6333Z" fill="currentColor"></path>
               </svg>
            </div>
         </a>
         <div w-el="document_uploaded_deleteReminder" class="delete-button_component hide">
            <div class="delete-button_wrapper">
               <a w-el="document_uploaded_deleteConfirm" href="#" class="delete-button w-inline-block">
                  <div>yes</div>
               </a>
               <a w-el="document_uploaded_deleteReject" href="#" class="delete-button is-secondary w-inline-block">
                  <div>no</div>
               </a>
            </div>
         </div>
      </div>
   </div>
</div>`;
  return html;
}

function loaderElement(parentElement) {

  const html = `
  <div class="loader_form">
    <div class="file-skeleton-wrapper">
      <div class="skeleton-loader"></div>
    </div>
  </div>
  `;

  parentElement.insertAdjacentHTML("beforeend", html);

}

/**
 * Renders the list of uploaded and missing documents for a specific submodule.
 * It fetches documents, segregates them based on their upload status,
 * and dynamically updates the DOM to display the appropriate lists.
 *
 * @param {string} submodule_id - The ID of the submodule for which documents are to be rendered.
 */
export async function updateDocuments(parentElementDocumentList,submodule_id) {
  try {

    if (submodule_id === null) {

      while (parentElementDocumentList.firstChild) {
        parentElementDocumentList.removeChild(parentElementDocumentList.lastChild);
      }
      const heading = document.createElement("h2");
      heading.textContent = "Relocation Support for Other Cities";
      const para = document.createElement("p");
      para.textContent =
        "Currently, we only offer tailored support for the cities of Berlin and Munich. If you consider relocating to a different city in Germany, please note that specific assistance might be limited. We're constantly working to expand our services to more locations. Thank you for your understanding!";

      parentElementDocumentList.appendChild(heading);
      parentElementDocumentList.appendChild(para);
      return;
    }
    let num_docs = 10;
  
    // 1. If documents exist, remove current documents
    if (hasChildWithSelector(parentElementDocumentList,".upload_form") || hasChildWithSelector(parentElementDocumentList,".download_component")){
      num_docs = parentElementDocumentList.children.length;
      while (parentElementDocumentList.firstChild){
        parentElementDocumentList.removeChild(parentElementDocumentList.firstChild);
      }
    }
    
    // 2. If no loaders exist, add loaders
    if (!hasChildWithSelector(parentElementDocumentList,".loader_form")){
      for (let i = 0; i < num_docs; i++){
        loaderElement(parentElementDocumentList);
      }
    }

    // 3. Fetch documents and append to a list
    const docs = await getDocuments(submodule_id);
    if (!docs) {
      throw new Error("Failed to retrieve documents.");
    }

    const docList = []

    docs.forEach((doc) => {
      if (doc.document_uploaded === 0) {
        docList.push(missingFileItem(doc));
      } else {
        docList.push(uploadedFileItem(doc));
      }
    });

    // 4. Remove loaders and add the new documents
    handleLoaderRemoval(parentElementDocumentList, ".loader_form");
    if(hasChildWithSelector(parentElementDocumentList,"h2")){
      parentElementDocumentList.querySelector("h2").remove();
      parentElementDocumentList.querySelector("p").remove();
    }
    docList.forEach(item => parentElementDocumentList.insertAdjacentHTML("beforeend", item));

    // 5. Setup all forms
    setupAllForms(parentElementDocumentList, submodule_id);


  } catch (error) {
    console.error(error.message)
    logging.error({
      message: `Error while rendering documents: ${error.message}`,
      eventName: "renderDocuments_exception",
    });
  }
}
/**
 * Attaches an event handler to the list of uploaded documents for handling various document-related actions.
 * This function delegates click events to the appropriate handler based on the action (download, delete, etc.).
 */
export async function handleDocuments(documentsList, submoduleId) {


  // handle all click events on the document list 
  // for the uploaded documents, handle the see, download and delete functions
  // for the not yet uploaded documents, handle the hide preview button, which also clears the form input
  documentsList.addEventListener("click", async function (event) {

    // identify if the event target is an uploaded document or not uploaded document
    const isUploadedDocument = event.target.closest(".download_component") !== null;

    if (isUploadedDocument) {
      const parentLink = event.target.closest("a");

      if (!parentLink) return;

      try {
        if (parentLink.matches('[w-el="document_uploaded_download"]')) {
          await handleDownloadAction(parentLink);
        } else if (parentLink.matches('[w-el="document_uploaded_delete"]')) {
          handleDeleteToggle(parentLink);
        } else if (
          parentLink.matches('[w-el="document_uploaded_deleteReject"]')
        ) {
          handleDeleteReject(parentLink);
        } else if (
          parentLink.matches('[w-el="document_uploaded_deleteConfirm"]')
        ) {
          await handleDeleteConfirm(parentLink, submoduleId,documentsList);
        }
      } catch (error) {
        await logging.error({
          message: `Error handling uploaded document action: ${error.message}`,
          eventName: "handleUploadedDocuments_exception",
        });
      }
    } else {
      hideFilePreview(event);
    }

    
  });

  // handle all the change events on the document list
  // for all the not yet uploaded documents, handle the document upload, which shows the file preview. The submission of the documents is handled above by the 
  documentsList.addEventListener('change', (event) => {
    handleFileInputChange(event);
  });
}

/**
 * Handles the download action for an uploaded document.
 * Triggers the download of the document based on the URL found in the clicked element.
 *
 * @param {Element} parentLink - The clicked link element that initiated the download action.
 */
async function handleDownloadAction(parentLink) {
  const card = parentLink.closest(".download_component");
  const documentTitle = card.querySelector(".download_title").textContent;
  const attachmentUrl = parentLink.getAttribute("attachment");
  const filename =
    toSafeFileName(documentTitle) + "." + attachmentUrl.split(".").pop();
  downloadFileFromUrl(attachmentUrl, filename);
}

/**
 * Toggles the delete reminder for a document.
 * Shows or hides the delete confirmation popup based on the user action.
 *
 * @param {Element} parentLink - The clicked link element that initiated the delete toggle action.
 */
function handleDeleteToggle(parentLink) {
  const card = parentLink.closest(".download_component");
  const deleteReminder = card.querySelector(
    '[w-el="document_uploaded_deleteReminder"]'
  );
  deleteReminder.classList.toggle("hide");
  parentLink.classList.toggle("is-clicked");
}

/**
 * Handles the rejection of the delete action for a document.
 * Hides the delete confirmation popup without performing the delete action.
 *
 * @param {Element} parentLink - The clicked link element that initiated the delete reject action.
 */
function handleDeleteReject(parentLink) {
  const card = parentLink.closest(".download_component");
  const deleteReminder = card.querySelector(
    '[w-el="document_uploaded_deleteReminder"]'
  );
  const deleteButton = card.querySelector('[w-el="document_uploaded_delete"]');
  deleteReminder.classList.add("hide");
  deleteButton.classList.remove("is-clicked");
}

/**
 * Confirms and executes the delete action for a document.
 * Sends a DELETE request to the server for the specified document and reloads the page upon success.
 *
 * @param {Element} parentLink - The clicked link element that initiated the delete confirm action.
 */
async function handleDeleteConfirm(parentLink,submoduleId,documentsList) {
  const card = parentLink.closest(".download_component");
  const documentId = card.id;
  const wized_token = getCookie("wized_token");
  const token = "Bearer " + wized_token;

  const formData = new FormData();
  formData.append("document_id", parseInt(documentId));

  const response = await fetch(BASE_URL + "/documents/" + documentId, {
    method: "DELETE",
    headers: { Authorization: token },
    body: formData,
  });

  if (response.ok) {
    // Select the parent elements for document rendering
    // const parentElementDocumentList = document.querySelector(
    //   '[w-el="document_list"]'
    // );
    // const submoduleId = updateVisaRelocationCity();
    updateDocuments(documentsList, submoduleId);
  } else {
    await logging.error({
      message: `Delete failed: ${response.statusText}`,
      eventName: "handleDeleteConfirm_failure",
    });
  }
}

/**
 * Hides the file preview in an upload form when the close button is clicked.
 * It traverses up the DOM to find the relevant close button within a specified number of levels
 * and toggles visibility of related elements in the upload form.
 *
 * @param {Event} event - The event object from the click event.
 */
export function hideFilePreview(event) {
  let targetElement = event.target;
  const maxLevels = 4; // Maximum number of levels to traverse up the DOM

  for (let level = 0; targetElement != null && level < maxLevels; level++) {
    if (targetElement.matches('[w-el="upload_closeButton"]')) {
      // Find the closest parent element representing the document list item (upload form)
      const card = targetElement.closest(".upload_form");

      // Find elements within the card to toggle visibility
      const previewFileWrapper = card.querySelector(
        '[w-el="upload_previewFileWrapper"]'
      );
      const uploadButton = card.querySelector('[w-el="upload_uploadButton"]');

      // Toggle visibility of the elements
      targetElement.classList.add("hide");
      uploadButton.classList.remove("hide");
      previewFileWrapper.classList.add("hide");

      const formElement = targetElement.closest('form');
      formElement.reset();
      break; // Exit the loop as the close button has been handled
    }

    targetElement = targetElement.parentElement; // Move up to the next parent element
  }
}

/**
 * Handles the change event of file input elements by displaying a preview of the selected file.
 * Updates the UI to show the file name and size and toggles the visibility of related elements.
 *
 * @param {Event} event - The change event object from the file input.
 */
export function handleFileInputChange(event) {
  // Check if the event target is a file input element
  if (event.target.matches('[w-el="document_missing_file"]')) {
    const input = event.target;
    const card = input.closest(".upload_form");

    // Find elements within the card for displaying the file preview and related information
    const previewFileWrapper = card.querySelector(
      '[w-el="upload_previewFileWrapper"]'
    );
    const previewText = card.querySelector('[w-el="upload_previewText"]');
    const closeButton = card.querySelector('[w-el="upload_closeButton"]');
    const uploadButton = card.querySelector('[w-el="upload_uploadButton"]');

    // Clear any existing content in the preview text
    if (previewText) {
      while (previewText.firstChild) {
        previewText.removeChild(previewText.firstChild);
      }
    }

    const curFiles = input.files;
    if (curFiles.length === 1) {
      const file = curFiles[0];
      const para = document.createElement("p");
      para.textContent = `File name: ${file.name}, file size ${returnFileSize(
        file.size
      )}.`;
      previewText.appendChild(para);

      // Update the visibility of related elements
      previewFileWrapper.classList.remove("hide");
      closeButton.classList.remove("hide");
      uploadButton.classList.add("hide");
    } else if (curFiles.length === 0) {
      // Hide the preview wrapper if no files are selected
      previewFileWrapper.classList.add("hide");
    }
  }
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
  // const submoduleId = parseInt(getQueryParam("submoduleId"));

  // Create formData and append relevant information
  const resultFormData = new FormData();
  resultFormData.append("document_title", documentTitle);
  resultFormData.append("document_id", documentId);
  // resultFormData.append("submodules_id", submoduleId);
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

function handleDocumentUploadResponse(response, submoduleId, listWrapper){

  if (response.success) {
    // Select the parent elements for document rendering
    // const parentElementDocumentList = document.querySelector(
    //   '[w-el="document_list"]'
    // );
    // const submoduleId = updateVisaRelocationCity();
    console.log(response)
    console.log(submoduleId)
    console.log(listWrapper)
    updateDocuments(listWrapper, submoduleId);
  } else {
      logging.warning({
          message: "Document upload failed: " + response.message,
          eventName: "documentUpload_failed",
          extra: {}
      });
  }
}

function setupAllForms(listWrapper, submoduleId) {

  // Iterate over each form within the container
  listWrapper.querySelectorAll('.upload_component').forEach(form => {
      // Extract the form's ID
      const formId = form.id;

      // Call your function with the form's ID and other parameters
      setupForm(formId, submoduleId, listWrapper, transformUploadFormData, submitDocumentFormData, handleDocumentUploadResponse, true);
  });
}

export function updateVisaRelocationCity(){

  const formWrapper = document.querySelector('[w-el="formWrapper"]')

  let submoduleId = null;
      var visaType = formWrapper.getAttribute('visatype');
      var relocationCity = document.getElementById('account_relocation_city_germany').value;
      if (relocationCity && visaType) {
          submoduleId = getModuleId(visaType,relocationCity);
          setCityNameInElements(relocationCity);
          setQueryParam('submoduleId',submoduleId);
          return submoduleId;
      } else {
        return null;
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
      "nationalDVisa_": 20,
      "jobseeker_Berlin": 27,
      "jobseeker_Munich": 28
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