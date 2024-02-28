import { handleDocuments, updateDocuments } from "../../../upload_files";
import { downloadAllFilesSubmodule } from "../../../utils";

export async function render () {

    try {
        const section = document.querySelector('.section_upload');
        const submoduleId = 20;
        const listWrapper = section.querySelector('.document_list-wrapper');
        const downloadAllButton = section.querySelector('.button');
        updateDocuments(listWrapper, submoduleId);
        handleDocuments(listWrapper, submoduleId);
        if (downloadAllButton){downloadAllButton.addEventListener('click', function () {
            downloadAllFilesSubmodule(element.submoduleId);
        })};

    } catch (error) {
        logging.error({
            message: 'Error in vault render function: ' + error.message,
            eventName: 'render_exception',
            extra: {}
        });
    }

}
