import { handleDocuments, updateDocuments } from "../../upload_files";
import { downloadAllFilesSubmodule } from "../../utils";

export async function render () {

    // dic object for all the different vault sections, each items needs the section selector and the submoduleId from Xano
    const vault_sections = [
        {
            'name': 'Personal Vault',
            'sectionSelector':'.section_vault-personal',
            'submoduleId':21
        },
        {
            'name': 'Language Vault',
            'sectionSelector':'.section_vault-language',
            'submoduleId':22
        },
        {
            'name': 'Visa Vault',
            'sectionSelector':'.section_vault-visa',
            'submoduleId':23
        },
        {
            'name': 'Housing Vault',
            'sectionSelector':'.section_vault-housing',
            'submoduleId':24
        },
        {
            'name': 'Health Insurance Vault',
            'sectionSelector':'.section_vault-health-insurance',
            'submoduleId':25
        },
        {
            'name': 'Employment Vault',
            'sectionSelector':'.section_vault-employment',
            'submoduleId':26
        },

    ]

    try {

        // for each vault section, render the documents, intialise the event listeners (handleDocuments) and setup the downloadAll buttons
        vault_sections.forEach(element => {
            const section = document.querySelector(element.sectionSelector);
            const listWrapper = section.querySelector('.document_list-wrapper');
            const downloadAllButton = section.querySelector('.button');
            updateDocuments(listWrapper, element.submoduleId);
            handleDocuments(listWrapper);
            if (downloadAllButton){downloadAllButton.addEventListener('click', function () {
                downloadAllFilesSubmodule(element.submoduleId);
            })};
    
        });

    } catch (error) {
        logging.error({
            message: 'Error in vault render function: ' + error.message,
            eventName: 'render_exception',
            extra: {}
        });
    }

}
