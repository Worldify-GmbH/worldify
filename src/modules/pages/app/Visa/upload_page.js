import { renderDocuments, handleUploadedDocuments, handleFileInputChange, handleUpload } from "../../../upload_files.js";
import { downloadAllFilesSubmodule } from "../../../utils.js";

export async function render() {
    renderDocuments();
    handleUploadedDocuments();
    
    const missing_documents_list = document.querySelector('[w-el="document_missing_list"]');
    missing_documents_list.addEventListener('change', (event) => {
        handleFileInputChange(event);
    });
    missing_documents_list.addEventListener('click', (event) => {
        handleUpload(event);
    });
    /*
    const uploaded_documents_list = document.querySelector('[w-el="document_uploaded_list"]');
    uploaded_documents_list.addEventListener('click', (event => {
        handleUploadedDocuments(event);
    }));
    */
    const downloadAllButton = document.querySelector('[w-el="document_uploaded_downloadAll"]');
    downloadAllButton.addEventListener('click', downloadAllFilesSubmodule);
    
}