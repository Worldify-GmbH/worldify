const { getCookie } = require("../../auth");

function createDashboardCard (module,is_pinned=false, is_completed=false) {
    let pinClass = "";
    let completedClass = "";
    let completedText = "Open Task";
    if (is_pinned) {    
        pinClass = "is-pinned";
    } else if (is_completed) {
        completedClass = "is-completed";
        completedText = "Completed";
        pinClass = 'hide';
    }
    return `
<div w-el="module_item" id=${module.id} class="card is-no-margin is-hover">
    <div class="task-item">
        <div class="task_progress-color-wrapper">
            <div class="task_progress-color background-color-light-blue ${completedClass}"></div>
        </div>
        <div class="task_meta-wrapper">
            <div w-el="module_pinButton" class="pin-button">
                <div class="pin-button_icon w-embed ${pinClass}">
                    <svg width="74" height="74" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.6866 53.3504L21.1008 51.9362L19.6866 50.522L6.38494 37.2203C5.57291 36.4083 5.29235 35.6333 5.28076 35.0128C5.2693 34.4017 5.513 33.6921 6.22866 32.9764C10.6477 28.5574 19.2996 27.1345 28.1763 31.2918L29.3518 31.8423L30.3334 30.9928L42.402 20.5469L43.3574 19.72L43.021 18.5021C41.4916 12.9662 40.9287 8.01808 41.2424 5.48661C41.394 4.34834 41.7859 3.66432 42.1421 3.30805C42.5181 2.93204 42.9181 2.8003 43.2936 2.81512C43.6811 2.83041 44.2172 3.01213 44.7901 3.58504L71.0001 29.795C71.5566 30.3516 71.7439 30.8886 71.7609 31.2881C71.7773 31.675 71.6438 32.0759 71.2769 32.4428C70.9434 32.7763 70.2533 33.161 69.0741 33.3181C66.5427 33.6319 61.5944 33.0689 56.0583 31.5394L54.8404 31.203L54.0135 32.1584L43.5676 44.2271L42.7182 45.2087L43.2687 46.3842C47.4259 55.2608 46.003 63.9128 41.584 68.3318C40.8683 69.0475 40.1587 69.2911 39.5476 69.2798C38.9271 69.2681 38.1522 68.9876 37.3402 68.1756L24.0385 54.8739L22.6243 53.4597L21.2101 54.8739L9.75649 66.3275C8.0822 68.0017 6.19501 69.1886 4.67968 69.8839C5.37073 68.3679 6.55726 66.4798 8.23303 64.804L19.6866 53.3504Z" fill="currentColor" stroke="black" stroke-width="4"></path>
                    </svg>
                </div>
            </div>
            <a w-el="module_link" href="${module.module_link}" class="open-task-button w-inline-block">
                <div class="task_open-text">${completedText}</div>
                <div class="icon-embed-xsmall w-embed">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14.5931 0.983396C14.5753 0.4314 14.1133 -0.00160407 13.5613 0.0162529L4.56602 0.307258C4.01402 0.325115 3.58102 0.787073 3.59887 1.33907C3.61673 1.89106 4.07869 2.32407 4.63068 2.30621L12.6265 2.04754L12.8852 10.0434C12.903 10.5954 13.365 11.0284 13.917 11.0105C14.469 10.9926 14.902 10.5307 14.8841 9.97869L14.5931 0.983396ZM2.16725 14.6684L14.3232 1.6996L12.864 0.331856L0.708052 13.3007L2.16725 14.6684Z" fill="currentColor"></path>
                    </svg>
                </div>
            </a>
        </div>
        <a w-el="module_link" href="${module.module_link}" class="task_header-wrapper w-inline-block">
            <h3 w-el="module_title" class="heading-style-h6">${module.module_title}</h3>
            <div class="spacer-small"></div>
            <p class="text-size-small">${module.module_description}</p>
        </a>
    </div>
</div>
    `;
}

async function getModules () {

    // Construct the Authorization token
    const wized_token = getCookie("wized_token");
    const token = "Bearer " + wized_token;

    try {
        const response = await fetch(BASE_URL + '/modules', {
            method: 'GET',
            headers: {
                Authorization: token,
            }
        });

        const data = await response.json();

        if (response.ok) {
            return data;
        }

    } catch (error) {
        
    }
};

function createHtmlObject() {
    
}

// Usage:
// let htmlObject = createHtmlObject();
// document.body.innerHTML += htmlObject;

export async function render () {

    const listWrapper = document.querySelector('[w-el="module_list"]');
    if (listWrapper.hasChildNodes) {
        while (listWrapper.firstChild) {
            listWrapper.removeChild(listWrapper.firstChild);
        }
    }

    let pinnedList = [];
    let normalList = [];
    let completedList = [];

    let data = await getModules();

    let moduleList;

    if (Array.isArray(data)) {
        moduleList = data;
    } else if (typeof data === 'object' && data !== null) {
        moduleList = Object.values(data);
    } else {
        console.error("Data is neither an array nor an object:", data);
    }

    console.log(moduleList);

    moduleList.forEach(element => {
        let htmlObject;
        if(element.is_completed) {
            htmlObject = createDashboardCard(element._modules[0],false,true);
            completedList.push(htmlObject);
        } else if (element.is_pinned) {
            htmlObject = createDashboardCard(element._modules[0],true);
            pinnedList.push(htmlObject);
        } else if (element[0] === 0) {
            //skip this element 
        } else {
            htmlObject = createDashboardCard(element._modules[0]);
            normalList.push(htmlObject);
        }
    })
    pinnedList.forEach(element => {
        listWrapper.innerHTML += element;
    });

    normalList.forEach(element => {
        listWrapper.innerHTML += element;
    });

    completedList.forEach(element => {
        listWrapper.innerHTML += element;
    });



        

    

}
