/**
 * Missing Documents
 * 
 * 
 *
 * 
 */


/**
 * Asynchronously fetches the missing documents based on the provided submodule ID.
 * 
 * How it works:
 * 1. Retrieves the submodule ID from the DOM using a custom attribute 'w-el'.
 * 2. Gets the 'wized_token' cookie and constructs the Authorization token.
 * 3. Builds the URL for the request, appending the submodule ID as a query parameter.
 * 4. Sends a GET request to the server to fetch the missing documents.
 * 
 * @async
 * @function
 * @returns {Object|null} - Returns the missing documents in JSON format if successful, or null otherwise.
 *                          Throws an error if there's an issue with the fetch request.
 * 
 * @throws {Error} - If there's a problem during the fetch request.
 * 
 * Pre-requisites:
 * - 'baseUrl' must be globally defined and should contain the base path of the API.
 * - A DOM element with attribute 'w-el' set to 'submodule_id' must be present in the HTML.
 * - The 'getCookie' function should be defined elsewhere to retrieve the 'wized_token'.
 */
async function getMissingDocuments() {
  const submodule_id = document.querySelector('[w-el="submodule_id"]').value;
  const wized_token = getCookie("wized_token");
  const token = "Bearer " + wized_token;

  const baseURL = baseUrl + "/documents/module/missingDocuments";

  // Create a new URL object
  const url = new URL(baseURL);

  // Define the query parameters
  const params = {
    submodule_id: submodule_id,
  };

  // Append the query parameters to the URL
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: token,
      },
    });

    if (response.ok) {
      const jsonResponse = await response.json();
      return jsonResponse;
    } else {
      const jsonResponse = await response.json();
      return null;
    }
  } catch (error) {
    console.error("Error while getting missing documents:", error);
  }
}

/**
 * Event handler function that manages the file upload process when an upload button is clicked.
 *
 * The function is responsible for:
 * 1. Detecting if the clicked element is related to the upload process.
 * 2. Gathering necessary information about the file, including its title, document ID, and submodule ID.
 * 3. Uploading the file using a POST request.
 * 4. Providing feedback to the user after a successful or unsuccessful upload.
 * 5. Updating the user interface post-upload.
 *
 * @async
 * @function
 * @param {Event} event - The event object, typically originating from a button click.
 *
 * Pre-requisites:
 * - The event target must be within an element with the attribute 'w-el' set to 'document_missing_submitButton'.
 * - There should be specific DOM structure and attributes present to provide the necessary data.
 * - 'baseUrl' must be globally defined, pointing to the base path of the API.
 * - The 'getCookie' function should be defined elsewhere to retrieve the 'wized_token' value.
 *
 * @throws {Error} - Logs an error message if there's a problem during the file upload.
 */
async function handleUpload(event) {
  // Ensure the clicked element is related to the upload button
  if (
    event.target.parentNode.matches('[w-el="document_missing_submitButton"]')
  ) {
    const button = event.target;

    // Get the closest parent card and its related input and title elements
    const card = button.closest('[w-el="document_missing_listitem"]');
    const fileInput = card.querySelector(
      'input[type="file"][w-el="document_missing_file"]'
    );
    const file = fileInput.files[0];
    const documentTitle = card.querySelector(
      '[w-el="document_missing_fileName"]'
    ).textContent;

    // Extract document and submodule IDs
    const documentId = parseInt(card.id);
    const submoduleId = parseInt(
      document.querySelector('[w-el="submodule_id"]').value
    );

    // Construct the Authorization token
    const wized_token = getCookie("wized_token");
    const token = "Bearer " + wized_token;

    // Check if a file has been selected for upload
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    // Create formData and append relevant information
    const formData = new FormData();
    formData.append("document_title", documentTitle);
    formData.append("document_id", documentId);
    formData.append("submodules_id", submoduleId);
    formData.append("file", file);

    // Try uploading the document
    try {
      const response = await fetch(baseUrl + "/documents", {
        method: "POST",
        headers: {
          Authorization: token,
        },
        body: formData,
      });

      // Handle response based on success or failure
      if (response.ok) {
        const jsonResponse = await response.json();

        // Clear the card and display a success message
        while (card.firstChild) {
          card.removeChild(card.firstChild);
        }
        const successWrapper = document.createElement("div");
        successWrapper.classList.add("upload-item_component");
        const successMessage = document.createElement("p");
        successMessage.textContent = "Upload successful!";
        successWrapper.appendChild(successMessage);
        card.appendChild(successWrapper);

        // After a delay, update the UI to reflect the successful upload
        setTimeout(() => {
          card.remove();
          renderMissingDocuments();
          renderUploadedDocuments();
        }, 3000);
      } else {
        console.error("Upload failed:", response.statusText);
        alert("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("An error occurred. Please try again.");
    }
  }
}


/**
 * Appends an HTML structure representing a missing file item to a given parent element.
 *
 * @param {Object} doc - An object containing the document metadata. It should have an 'id' and 'document_title' property.
 * @param {HTMLElement} parentElement - The parent DOM element to which the constructed HTML will be appended.
 */
function missingFileItem(doc, parentElement) {
  // SVG markup for the document icon
  const svgContent = `
        <svg width="24" height="31" viewBox="0 0 24 31" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.9625 24.125H18.0375V21.875H5.9625V24.125ZM5.9625 17.75H18.0375V15.5H5.9625V17.75ZM2.25 30.5C1.65 30.5 1.125 30.275 0.675 29.825C0.225 29.375 0 28.85 0 28.25V2.75C0 2.15 0.225 1.625 0.675 1.175C1.125 0.725 1.65 0.5 2.25 0.5H15.7875L24 8.7125V28.25C24 28.85 23.775 29.375 23.325 29.825C22.875 30.275 22.35 30.5 21.75 30.5H2.25ZM14.6625 9.725H21.75L14.6625 2.75V9.725Z" fill="currentColor"></path>
        </svg>
    `;

  // Create the main HTML content using template literals.
  const html = `
        <div w-el="document_missing_listitem" id="${doc.id}" class="card is-no-margin">
            <div w-el="document_missing_itemComponent" class="upload-item_component">
                <div class="upload-item_header">
                    <div class="icon-embed-medium hide-mobile-landscape w-embed">
                        ${svgContent}
                    </div>
                    <div w-el="document_missing_fileName" id="w-node-bb0ca9e4-6a1b-f92d-7785-b8698d5d14a4-3037c211" class="text-size-small">${doc.document_title}</div>
                    <div id="w-node-c5d6a9d2-e381-2e0b-4771-6b07f89a7db0-3037c211" class="upload-item_header_file-upload">
                        <div class="module-upload_file-upload w-embed">
                            <label w-el="document_missing_fileLabel" class="button is-secondary" for="document_${doc.id}">Choose document to upload (image/pdf)
                                <input id="document_${doc.id}" class="input_files" type="file" accept="image/*,.pdf" w-el="document_missing_file" />
                            </label>
                        </div>
                    </div>
                </div>
                <div class="upload-item_meta hide">
                    <div w-el="document_missing_documentId">document_id</div>
                </div>
                <div w-el="document_missing_previewFileWrapper" class="upload-item_preview-file hide">
                    <div w-el="document_missing_previewFile" class="upload-item_preview_document-wrapper"></div>
                    <div w-el="document_missing_previewText" class="upload-item_preview_text-wrapper">
                        <div>No file currently selected for upload.</div>
                        <div>File name:&nbsp;<span>file_name</span>, file size:&nbsp;<span>file_size</span></div>
                    </div>
                    <div class="button-group">
                        <a w-el="document_missing_submitButton" href="#" class="button w-inline-block">
                            <div>Submit</div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;

  parentElement.insertAdjacentHTML("beforeend", html);
}

/**
 * Asynchronously fetches and renders the list of missing documents on the page.
 *
 * This function works by:
 * 1. Calling the `getMissingDocuments` function to fetch the list of missing documents.
 * 2. Clearing any existing child elements in the target parent element.
 * 3. Iterating through the fetched documents and rendering each of them using the `missingFileItem` function.
 *
 * @async
 * @function
 * 
 * Pre-requisites:
 * - The 'getMissingDocuments' function should be defined and working correctly.
 * - The 'missingFileItem' function should be defined to handle the rendering of each missing document.
 * - A parent element with the attribute 'w-el' set to 'document_missing_list' should exist in the DOM.
 *
 * @throws {Error} - Logs an error message if there's a problem during rendering.
 */
async function renderMissingDocuments() {
  try {

    // Select the parent element where the missing documents should be rendered
    const parentElement = document.querySelector(
      '[w-el="document_missing_list"]'
    );

    // Clear any existing child elements of the parent element
    if (parentElement.firstChild) {
      while (parentElement.firstChild) {
        parentElement.removeChild(parentElement.firstChild);
      }
    }

    

    // Fetch the list of missing documents
    const docs = await getMissingDocuments();
    
    if (docs.length === 0) {
      const para = document.createElement('p');
      para.textContent = "Great! You have uploaded all documents!"
      parentElement.appendChild(para);
    } else {
      // Render each missing document in the parent element
      docs.forEach((doc) => {
        missingFileItem(doc, parentElement);
      });
    }

  } catch (error) {
    console.error("Error while rendering missing documents:", error);
  }
}


/**
 * Uploaded Documents
 * 
 * 
 *
 * 
 */

/**
 * Asynchronously fetches the documents uploaded for a specific submodule ID.
 * 
 * How it works:
 * 1. Retrieves the submodule ID from the DOM using a custom attribute 'w-el'.
 * 2. Obtains the 'wized_token' cookie and constructs the Authorization token.
 * 3. Constructs the request URL, appending the submodule ID as a query parameter.
 * 4. Sends a GET request to fetch the uploaded documents for the given submodule ID.
 * 
 * @async
 * @function
 * @returns {Object|null} - Returns the uploaded documents in JSON format if the request is successful, 
 *                          or null if the request results in an error status.
 *                          If there's an issue during the fetch request, it logs an error message and does not return.
 * 
 * Pre-requisites:
 * - 'baseUrl' must be globally defined and should point to the base path of the API.
 * - A DOM element with attribute 'w-el' set to 'submodule_id' should be present in the HTML.
 * - The 'getCookie' function should be defined elsewhere to retrieve the 'wized_token' value.
 * 
 * @throws {Error} - Logs an error message if there's a problem during the fetch request.
 */
async function getUploadedDocuments() {
    const submodule_id = document.querySelector('[w-el="submodule_id"]').value;
    const wized_token = getCookie("wized_token");
    const token = "Bearer " + wized_token;
  
    const baseURL = baseUrl + "/documents/module/uploadedDocuments";
  
    // Create a new URL object
    const url = new URL(baseURL);
  
    // Define the query parameters
    const params = {
      submodule_id: submodule_id,
    };
  
    // Append the query parameters to the URL
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );
  
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });
  
      if (response.ok) {
        const jsonResponse = await response.json();
        return jsonResponse;
      } else {
        const jsonResponse = await response.json();
        return null;
      }
    } catch (error) {
      console.error("Error while getting uploaded documents:", error);
    }
  }


/**
 * Event handler function for clicks on the view, download and delete buttons
 * This function is triggered when a user clicks on the buttons and then selects the correct operation
 * @param {Event} event - The change event object.
 */
async function handleUploadedDocuments(event) {
  const parentLink = event.target.closest("a");

  // See button: click triggers preview to open and close
  if (parentLink.matches('[w-el="document_uploaded_see"]')) {
    const card = parentLink.closest('[w-el="document_uploaded_listitem"]');
    const previewWrapper = card.querySelector(
      '[w-el="document_uploaded_previewWrapper"]'
    );

    if (parentLink.classList.contains("is-clicked")) {
      previewWrapper.classList.add("hide");
      parentLink.classList.remove("is-clicked");
    } else {
      previewWrapper.classList.remove("hide");
      parentLink.classList.add("is-clicked");
    }
  }

  // Download Button: click triggers delete pop-up to open
  else if (parentLink.matches('[w-el="document_uploaded_download"]')) {
    const card = parentLink.closest('[w-el="document_uploaded_listitem"]');
    const documentTitle = card.querySelector('[w-el="document_uploaded_fileName"]').textContent;
    const attachmentUrl = parentLink.getAttribute('attachment');
    console.log(documentTitle,attachmentUrl)
    const filename = toSafeFileName(documentTitle) + '.' + attachmentUrl.split('.').pop();  // e.g. "application_form_videx_or_paper.png"
    downloadFileFromUrl(attachmentUrl, filename);
  }

  // Delete Button: click triggers delete pop-up to open
  else if (parentLink.matches('[w-el="document_uploaded_delete"]')) {
    const card = parentLink.closest('[w-el="document_uploaded_listitem"]');
    const deleteReminder = card.querySelector(
      '[w-el="document_uploaded_deleteReminder"]'
    );

    if (!parentLink.classList.contains("is-clicked")) {
      deleteReminder.classList.remove("hide");
      parentLink.classList.add("is-clicked");
    } else {
      //Do nothing
    }
  }

  // Delete Popup Reject: click triggers pop-up to close
  else if (parentLink.matches('[w-el="document_uploaded_deleteReject"]')) {
    const card = parentLink.closest('[w-el="document_uploaded_listitem"]');
    const deleteReminder = card.querySelector(
      '[w-el="document_uploaded_deleteReminder"]'
    );
    const deleteButton = card.querySelector(
      '[w-el="document_uploaded_delete"]'
    );

    deleteReminder.classList.add("hide");
    deleteButton.classList.remove("is-clicked");
  }

  // Delete Pop-up Confirm: click triggers POST request to delete the document
  else if (parentLink.matches('[w-el="document_uploaded_deleteConfirm"]')) {
    const card = parentLink.closest('[w-el="document_uploaded_listitem"]');
    const itemComponent = card.querySelector(
      '[w-el="document_uploaded_itemComponent"]'
    );

    //Fetch all needed information
    const documentId = card.id;
    const wized_token = getCookie("wized_token");
    const token = "Bearer " + wized_token;

    //create form element
    const formData = new FormData();
    formData.append("document_id", parseInt(documentId));

    try {
      const response = await fetch(baseUrl + "/documents/" + documentId, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
        body: formData,
      });

      if (response.ok) {
        const jsonResponse = await response.json();

        // Remove all child elements from the card
        while (itemComponent.firstChild) {
          itemComponent.removeChild(itemComponent.firstChild);
        }

        // Create and display a success message within the card
        const successMessage = document.createElement("p");
        successMessage.textContent = "Delete successful!";
        itemComponent.appendChild(successMessage);

        // Wait for 5 seconds, then remove the card and reload the site
        setTimeout(() => {
          card.remove();
          renderMissingDocuments();
          renderUploadedDocuments();
        }, 3000);
      } else {
        console.error("Upload failed:", response.statusText);
        alert("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("An error occurred. Please try again.");
    }
  }
}

/**
 * Event handler function for changes to file input elements.
 * This function is triggered when a user selects a file using the file input.
 * It then displays a preview of the selected file.
 *
 * @param {Event} event - The change event object.
 */
async function handleFileInputChange(event) {
  // Check if the event target (changed element) is a file input element
  if (event.target.matches('[w-el="document_missing_file"]')) {
    const input = event.target;

    // Find the closest parent element representing the document list item
    const card = input.closest('[w-el="document_missing_itemComponent"]');

    // Find elements within the card to display the file preview and related information
    const previewFileWrapper = card.querySelector(
      '[w-el="document_missing_previewFileWrapper"]'
    );
    const previewFile = card.querySelector(
      '[w-el="document_missing_previewFile"]'
    );
    const previewText = card.querySelector(
      '[w-el="document_missing_previewText"]'
    );

    // Check if previewText is not null before trying to access its properties
    if (previewText) {
      while (previewText.firstChild) {
        previewText.removeChild(previewText.firstChild);
      }
    }

    // Check if previewFile is not null before trying to access its properties
    if (previewFile) {
      while (previewFile.firstChild) {
        previewFile.removeChild(previewFile.firstChild);
      }
    }

    // Hide the preview wrapper if no files are selected
    previewFileWrapper.classList.remove("hide");

    // Extract the files selected by the user
    const curFiles = input.files;

    // Check if the user has selected any files
    if (curFiles.length === 0) {
      // Hide the preview wrapper if no files are selected
      previewFileWrapper.classList.add("hide");
    } else {
      // Loop through each selected file
      for (const file of curFiles) {
        const para = document.createElement("p");

        // Check if the file type is valid
        if (validFileType(file)) {
          // Display file details
          para.textContent = `File name ${
            file.name
          }, file size ${returnFileSize(file.size)}.`;

          let attachment;
          // Check the file type to determine how to display the preview
          if (file.type === "application/pdf") {
            // For PDFs, use an iframe to display the content
            attachment = document.createElement("iframe");
            attachment.src = URL.createObjectURL(file);
            attachment.style.height = "15rem";
            attachment.style.width = "10rem";
            attachment.setAttribute("frameborder", "0");
          } else {
            // For images, use an img element
            attachment = document.createElement("img");
            attachment.classList.add("upload-item_preview_document");
            attachment.src = URL.createObjectURL(file);
            //attachment.style.height = "15rem";
          }

          // Add the preview to the DOM
          previewFile.appendChild(attachment);
          previewText.appendChild(para);
        } else {
          // If the file type is invalid, display a warning message
          para.textContent = `File name ${file.name}: Not a valid file type. Update your selection.`;
          previewText.appendChild(para);
        }
      }
    }
  }
}

/**
 * Appends an HTML structure representing a uploaded file item to a given parent element.
 *
 * @param {Object} doc - An object containing the document metadata. It should have an 'id' and 'document_title' property.
 * @param {HTMLElement} parentElement - The parent DOM element to which the constructed HTML will be appended.
 */
function uploadedFileItem(doc, parentElement) {
    const svgContentDoc = 
        `<svg width="24" height="31" viewBox="0 0 24 31" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M5.9625 24.125H18.0375V21.875H5.9625V24.125ZM5.9625 17.75H18.0375V15.5H5.9625V17.75ZM2.25 30.5C1.65 30.5 1.125 30.275 0.675 29.825C0.225 29.375 0 28.85 0 28.25V2.75C0 2.15 0.225 1.625 0.675 1.175C1.125 0.725 1.65 0.5 2.25 0.5H15.7875L24 8.7125V28.25C24 28.85 23.775 29.375 23.325 29.825C22.875 30.275 22.35 30.5 21.75 30.5H2.25ZM14.6625 9.725H21.75L14.6625 2.75V9.725Z"
                fill="currentColor"
            ></path>
        </svg>`;

    const svgContentView = 
        `<svg width="30" height="21" viewBox="0 0 30 21" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M15.0034 16.1667C16.5785 16.1667 17.9161 15.6154 19.0161 14.5127C20.1161 13.4101 20.6661 12.0712 20.6661 10.4961C20.6661 8.92091 20.1148 7.58333 19.0122 6.48333C17.9096 5.38333 16.5707 4.83333 14.9955 4.83333C13.4203 4.83333 12.0828 5.38464 10.9828 6.48727C9.88276 7.58987 9.33276 8.92876 9.33276 10.5039C9.33276 12.0791 9.88407 13.4167 10.9867 14.5167C12.0893 15.6167 13.4282 16.1667 15.0034 16.1667ZM14.9916 14.2333C13.9524 14.2333 13.0717 13.8696 12.3494 13.1422C11.6272 12.4147 11.2661 11.5314 11.2661 10.4922C11.2661 9.45294 11.6298 8.57222 12.3573 7.85C13.0847 7.12778 13.9681 6.76667 15.0073 6.76667C16.0465 6.76667 16.9272 7.13039 17.6494 7.85783C18.3717 8.5853 18.7328 9.46863 18.7328 10.5078C18.7328 11.5471 18.369 12.4278 17.6416 13.15C16.9141 13.8722 16.0308 14.2333 14.9916 14.2333ZM14.9994 20.5C11.755 20.5 8.82165 19.5778 6.19943 17.7333C3.57721 15.8889 1.62165 13.4778 0.332764 10.5C1.62165 7.52222 3.57721 5.11111 6.19943 3.26667C8.82165 1.42222 11.755 0.5 14.9994 0.5C18.2439 0.5 21.1772 1.42222 23.7994 3.26667C26.4217 5.11111 28.3772 7.52222 29.6661 10.5C28.3772 13.4778 26.4217 15.8889 23.7994 17.7333C21.1772 19.5778 18.2439 20.5 14.9994 20.5Z"
          fill="currentColor">
          </path>
      </svg>`;

    const svgContentDownload = 
        `<svg
        width="25"
        height="25"
        viewBox="0 0 25 25"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.66675 18.5H18.6667V16.7H6.66675V18.5ZM12.5767 14.72L17.3167 10.01L16.0567 8.75L13.5067 11.27V5.3H11.7067V11.27L9.15675 8.75L7.89675 10.01L12.5767 14.72ZM12.6667 24.5C11.0267 24.5 9.47675 24.185 8.01675 23.555C6.55675 22.925 5.28175 22.065 4.19175 20.975C3.10175 19.885 2.24175 18.61 1.61175 17.15C0.981748 15.69 0.666748 14.14 0.666748 12.5C0.666748 10.84 0.981748 9.28 1.61175 7.82C2.24175 6.36 3.10175 5.09 4.19175 4.01C5.28175 2.93 6.55675 2.075 8.01675 1.445C9.47675 0.815 11.0267 0.5 12.6667 0.5C14.3267 0.5 15.8867 0.815 17.3467 1.445C18.8067 2.075 20.0767 2.93 21.1567 4.01C22.2367 5.09 23.0917 6.36 23.7217 7.82C24.3517 9.28 24.6667 10.84 24.6667 12.5C24.6667 14.14 24.3517 15.69 23.7217 17.15C23.0917 18.61 22.2367 19.885 21.1567 20.975C20.0767 22.065 18.8067 22.925 17.3467 23.555C15.8867 24.185 14.3267 24.5 12.6667 24.5Z"
          fill="currentColor"
        ></path>
      </svg>`;

    const svgContentDelete = 
        `<svg
        width="22"
        height="25"
        viewBox="0 0 22 25"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.03341 24.5C3.50008 24.5 3.03341 24.3 2.63341 23.9C2.23341 23.5 2.03341 23.0333 2.03341 22.5V3.5H0.666748V1.5H6.93342V0.5H15.7334V1.5H22.0001V3.5H20.6334V22.5C20.6334 23.0333 20.4334 23.5 20.0334 23.9C19.6334 24.3 19.1667 24.5 18.6334 24.5H4.03341ZM7.56675 19.6333H9.56675V6.33333H7.56675V19.6333ZM13.1001 19.6333H15.1001V6.33333H13.1001V19.6333Z"
          fill="currentColor"
        ></path>
      </svg>`;

    var previewContent = "";
    
    if (doc.file.type === 'image'){
        previewContent = 
            `<img
            src=${doc.file.url}
            loading="lazy"
            w-el="document_uploaded_image"
            alt=""
            class="file-item_preview_image"
          />`;
    } else if (doc.file.type === 'pdf') {
        previewContent = 
            `<iframe src=${doc.file.url}
                width="100%" 
                height="100%" 
                frameborder="0" 
                allowfullscreen 
                sandbox>
            </iframe>`;
    } else {}


  
  const html = `<div w-el="document_uploaded_listitem" class="card is-no-margin" id=${doc.id}>
      <div w-el="document_uploaded_itemComponent" class="file-item">
       <div w-el="applicationForm_Uploaded" class="file-item_component">
        <div
          id="w-node-_2d992cd4-db3c-509f-cfc1-bc66ab1bacef-3037c211"
          class="icon-embed-medium hide-mobile-landscape w-embed">
          ${svgContentDoc}
        </div>
        <div
          w-el="document_uploaded_fileName"
          id="w-node-_2d992cd4-db3c-509f-cfc1-bc66ab1bacf0-3037c211"
          class="text-size-small">
          ${doc.document_title}
        </div>
        <div
          w-el="file_type"
          id="w-node-_2d992cd4-db3c-509f-cfc1-bc66ab1bacf2-3037c211"
          class="file-item_tag background-color-black hide-mobile-landscape">
          <div w-el="document_uploaded_fileType">${doc.file.mime}</div>
        </div>
        <div
          w-el="document_uploaded_fileSize"
          id="w-node-_28edd459-e8a3-7387-69b5-00adad88d57e-3037c211"
          class="text-size-small hide-mobile-landscape">
          ${returnFileSize(doc.file.size)}
        </div>
        <div
          id="w-node-_2d992cd4-db3c-509f-cfc1-bc66ab1bacf9-3037c211"
          class="file-item_tag background-color-green hide-mobile-landscape">
          <div w-el="document_uploaded_submodule">
            ${doc._submodules[0].title}
          </div>
        </div>
        <div
          id="w-node-_2d992cd4-db3c-509f-cfc1-bc66ab1bacfc-3037c211"
          class="file-item_icon-wrapper">
          <a
            w-el="document_uploaded_see"
            id="w-node-_72b72abc-b275-bb2b-8f55-2906cd86c81e-3037c211"
            href="#"
            class="file-item_button w-inline-block"
            ><div
              id="w-node-_2d992cd4-db3c-509f-cfc1-bc66ab1bacfd-3037c211"
              class="file-item_button-image w-embed">
              ${svgContentView}
              </div></a
          ><a
            w-el="document_uploaded_download"
            href="#"
            attachment=${doc.file.url}
            class="file-item_button w-inline-block"
            ><div
              id="w-node-e272a60c-fcec-14eb-17c5-7d7442abc98d-3037c211"
              class="file-item_button-image w-embed"
            >
             ${svgContentDownload} 
            </div></a
          ><a
            w-el="document_uploaded_delete"
            href="#"
            class="file-item_button w-inline-block"
            ><div class="file-item_button-image w-embed">
             ${svgContentDelete} 
            </div
          ></a>
          <div
            w-el="document_uploaded_deleteReminder"
            class="delete-button_component hide"
          >
            <div class="delete-button_wrapper">
              <a
                w-el="document_uploaded_deleteConfirm"
                href="#"
                class="delete-button w-inline-block"
                ><div>yes</div></a
              ><a
                w-el="document_uploaded_deleteReject"
                href="#"
                class="delete-button is-secondary w-inline-block"
                ><div>no</div></a
              >
            </div>
          </div>
        </div>
      </div>
      <div w-el="document_uploaded_previewWrapper" class="file-item_preview hide">
        <div class="file-item_preview_image-wrapper">
          ${previewContent}
        </div>
      </div>
    </div>
  </div>`;

  parentElement.insertAdjacentHTML("beforeend", html);
}

/**
 * Asynchronously fetches and renders the list of uploaded documents on the page.
 *
 * The function achieves this by:
 * 1. Invoking the `getUploadedDocuments` function to fetch the list of uploaded documents.
 * 2. Clearing any pre-existing child elements in the designated parent element.
 * 3. Iterating over the fetched documents and using the `uploadedFileItem` function to render each one.
 *
 * @async
 * @function
 * 
 * Pre-requisites:
 * - The 'getUploadedDocuments' function should be defined and working correctly.
 * - The 'uploadedFileItem' function should be present to manage the rendering of each uploaded document.
 * - A parent element with the attribute 'w-el' set to 'document_uploaded_list' should exist in the DOM.
 *
 * @throws {Error} - Logs an error message if there's an issue during rendering.
 */
async function renderUploadedDocuments() {
  try {

    // Identify the parent element where the uploaded documents should be rendered
    const parentElement = document.querySelector(
      '[w-el="document_uploaded_list"]'
    );

      // Remove any existing child elements from the parent element
      if (parentElement.firstChild) {
        while (parentElement.firstChild) {
            parentElement.removeChild(parentElement.firstChild);
        }
      }

      

      // Fetch the list of uploaded documents
      const docs = await getUploadedDocuments();

      if (docs.length === 0) {
        const para = document.createElement('p');
        para.textContent = "No documents uploaded yet."
        parentElement.appendChild(para);

        const downloadAllButton = document.querySelector('[w-el="document_uploaded_downloadAll"]')
        downloadAllButton.classList.add('hide');

      } else {
        // Render each uploaded document within the parent element
        docs.forEach((doc) => {
          uploadedFileItem(doc, parentElement);
        });

        const downloadAllButton = document.querySelector('[w-el="document_uploaded_downloadAll"]')
        downloadAllButton.classList.remove('hide');
      }
  } catch (error) {
      console.error("Error while rendering uploaded documents:", error);
  }
}
