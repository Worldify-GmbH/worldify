export function getQueryParam(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
}

export function reloadPage() {
    location.reload();
}

export function renderTypeform(form_id, variables) {
    let formWrapper = document.querySelector('[w-el="visa_finder"]');

    // Create the query string dynamically
    let queryString = Object.entries(variables).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');

    // Create the iframe element
    let iframe = document.createElement('iframe');
    iframe.src = `https://3vosfw9xns2.typeform.com/to/${form_id}?${queryString}`;
    iframe.width = "100%";
    iframe.height = "500";
    iframe.frameBorder = "0";
    iframe.scrolling = "no";
    iframe.allowFullscreen = true;
    iframe.sandbox = "allow-scripts allow-same-origin allow-top-navigation";

    // Append the iframe to the formWrapper or any other container
    formWrapper.appendChild(iframe);
}

export function toSafeFileName(text) {
    // Replace non-alphanumeric characters with an empty string
    // Replace spaces with underscores, then convert to lowercase
    return text.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_').toLowerCase();
}

export function validFileType(file) {
    return fileTypes.includes(file.type);
}

export function returnFileSize(number) {
    if (number < 1024) {
        return `${number} bytes`;
    } else if (number >= 1024 && number < 1048576) {
        return `${(number / 1024).toFixed(1)} KB`;
    } else if (number >= 1048576) {
        return `${(number / 1048576).toFixed(1)} MB`;
    }
}

// Utility function to fetch a file as a blob
export async function fetchFile(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.blob();
}

// Main function to download files from URLs as a ZIP
export async function downloadFilesAsZip(data, zipName = 'download.zip') {
    const zip = new JSZip();

    // Use Promise.all to fetch all the files in parallel
    const fileBlobs = await Promise.all(data.map(item => fetchFile(item.file.url)));

    // Add each file to the ZIP
    data.forEach((item, index) => {
        const filename = toSafeFileName(item.document_title) + '.' + item.file.mime.split('/')[1];  // e.g. "Passport Bio data page.png"
        zip.file(filename, fileBlobs[index]);
    });

    // Generate ZIP and trigger download
    const content = await zip.generateAsync({type: "blob"});
    saveAs(content, zipName);
}

export async function downloadAllFilesSubmodule(){
    const files = await getUploadedDocuments();
    const submodule_name = toSafeFileName(files[0]._submodules[0].title) + ".zip";
    downloadFilesAsZip(files,zipName=submodule_name);
}

export function downloadFileFromUrl(url, filename) {
    fetchFile(url)
        .then(blob => {
            saveAs(blob, filename);
        })
        .catch(error => console.error("Image download failed:", error));
}

