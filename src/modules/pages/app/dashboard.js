import { logging } from "../../utils";

const { getCookie } = require("../../auth");

/**
 * Renders the dashboard and sets up event listeners for interactive elements.
 */
export async function render() {
    try {
        // Render the dashboard contents
        await renderDashboard();

        // Log information about the rendering process
        logging.info({ message: "Dashboard rendered successfully", eventName: "dashboard_render_success" });

        // Setup event listener for module list interactions
        setupModuleListEventListener();
    } catch (error) {
        // Log any errors encountered during the rendering process
        logging.error({
            message: "Error during rendering dashboard",
            eventName: "dashboard_render_error",
            extra: { errorDetails: error.message }
        });
    }
}

/**
 * Creates an HTML card for a dashboard module.
 * 
 * @param {Object} module - The module data to create a card for.
 * @returns {string} - HTML string representation of the dashboard card.
 */
function createDashboardCard (module) {
    let pinClass = "";
    let completedClass = "";
    let ctaText = "Open Task";
    let comingSoonClass = "";
    let color;
    if (module.is_pinned) {    
        pinClass = "is-pinned";
    } else if (module.is_completed) {
        completedClass = "is-completed";
        ctaText = "Completed";
        pinClass = 'hide';
    }

    if (module.status === "coming soon"){
        comingSoonClass = "is-coming-soon";
        ctaText = "Coming soon"
    }

    switch (module.module_category) {
        case "Before you move":
            color = "background-color-light-blue";
            break;
        case "1-3 months in Germany":
            color = "background-color-light-pink";
            break;
        case "First year in Germany":
            color = "background-color-light-green";
            break;
        case "Life in Germany":
            color = "background-color-light-orange";
            break;
        default:
            break;
    }
    return `
    <div w-el="module_item" id=${module.id} class="card is-no-margin is-hover">
  <div class="task-item ${comingSoonClass}">
    <div class="task_progress-color-wrapper ${comingSoonClass}">
      <div class="task_progress-color ${color} ${completedClass} ${comingSoonClass}"></div>
    </div>
    <div class="task_meta-wrapper">
      <div w-el="module_pinButton" class="pin-button">
        <div class="pin-button_icon w-embed ${pinClass}">
          <svg
            width="74"
            height="74"
            viewBox="0 0 74 74"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.6866 53.3504L21.1008 51.9362L19.6866 50.522L6.38494 37.2203C5.57291 36.4083 5.29235 35.6333 5.28076 35.0128C5.2693 34.4017 5.513 33.6921 6.22866 32.9764C10.6477 28.5574 19.2996 27.1345 28.1763 31.2918L29.3518 31.8423L30.3334 30.9928L42.402 20.5469L43.3574 19.72L43.021 18.5021C41.4916 12.9662 40.9287 8.01808 41.2424 5.48661C41.394 4.34834 41.7859 3.66432 42.1421 3.30805C42.5181 2.93204 42.9181 2.8003 43.2936 2.81512C43.6811 2.83041 44.2172 3.01213 44.7901 3.58504L71.0001 29.795C71.5566 30.3516 71.7439 30.8886 71.7609 31.2881C71.7773 31.675 71.6438 32.0759 71.2769 32.4428C70.9434 32.7763 70.2533 33.161 69.0741 33.3181C66.5427 33.6319 61.5944 33.0689 56.0583 31.5394L54.8404 31.203L54.0135 32.1584L43.5676 44.2271L42.7182 45.2087L43.2687 46.3842C47.4259 55.2608 46.003 63.9128 41.584 68.3318C40.8683 69.0475 40.1587 69.2911 39.5476 69.2798C38.9271 69.2681 38.1522 68.9876 37.3402 68.1756L24.0385 54.8739L22.6243 53.4597L21.2101 54.8739L9.75649 66.3275C8.0822 68.0017 6.19501 69.1886 4.67968 69.8839C5.37073 68.3679 6.55726 66.4798 8.23303 64.804L19.6866 53.3504Z"
              fill="currentColor"
              stroke="black"
              stroke-width="4"
            ></path>
          </svg>
        </div>
      </div>
      <a w-el="module_link" href="${module.module_link}" class="open-task-button w-inline-block ${comingSoonClass}"
        ><div class="task_open-text">${ctaText}</div>
        <div class="icon-embed-xsmall w-embed">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.5931 0.983396C14.5753 0.4314 14.1133 -0.00160407 13.5613 0.0162529L4.56602 0.307258C4.01402 0.325115 3.58102 0.787073 3.59887 1.33907C3.61673 1.89106 4.07869 2.32407 4.63068 2.30621L12.6265 2.04754L12.8852 10.0434C12.903 10.5954 13.365 11.0284 13.917 11.0105C14.469 10.9926 14.902 10.5307 14.8841 9.97869L14.5931 0.983396ZM2.16725 14.6684L14.3232 1.6996L12.864 0.331856L0.708052 13.3007L2.16725 14.6684Z"
              fill="currentColor"
            ></path>
          </svg></div
      ></a>
    </div>
    <a
      w-el="module_link"
      href="${module.module_link}"
      class="task_header-wrapper w-inline-block"
      ><h3 w-el="module_title" class="heading-style-h6">${module.module_title}</h3>
      <div class="spacer-small"></div>
      <p class="text-size-small">
        ${module.module_description}
      </p></a
    >
  </div>
</div>
`;
};

/**
 * Fetches module data from the server.
 * Uses the 'wized_token' from cookies for authorization.
 * 
 * @returns {Promise<Object|null>} The module data if successful, or null if an error occurs.
 */
async function getModules() {
    const token = `Bearer ${getCookie("wized_token")}`;

    try {
        // Send a GET request to the server to fetch modules
        const response = await fetch(`${BASE_URL}/modules`, {
            method: 'GET',
            headers: { Authorization: token }
        });

        // Parse the response to JSON
        const data = await response.json();

        if (response.ok) {
            // Log success using the custom logging framework
            logging.info({
                message: "Modules fetched successfully",
                eventName: "getModules_success",
                extra: { data }
            });
            return data;
        } else {
            // Log non-successful responses using the custom logging framework
            logging.error({
                message: `Failed to fetch modules: ${response.status} - ${response.statusText}`,
                eventName: "getModules_failure",
                extra: { responseStatus: response.status, responseText: response.statusText }
            });
            return null;
        }
    } catch (error) {
        // Log any errors during the fetch process using the custom logging framework
        logging.error({
            message: "Error during getModules",
            eventName: "getModules_error",
            extra: { errorDetails: error.message }
        });
        return null;
    }
}


/**
 * Pins a module by sending a POST request with the module's ID.
 * 
 * @param {string} module_id - The ID of the module to be pinned.
 * @returns {Promise<Object|null>} The response data if successful, or null if an error occurs.
 */
async function pinModule(module_id) {
    logging.info({
        message: "pinModule function called",
        eventName: "pinModule_call",
        extra: { module_id }
    });

    const token = `Bearer ${getCookie("wized_token")}`;

    const formData = new FormData();
    formData.append('module_id', module_id);

    try {
        const response = await fetch(`${BASE_URL}/modules/utils/pin_module`, {
            method: 'POST',
            headers: { Authorization: token },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            logging.info({
                message: "Module pinned successfully",
                eventName: "pinModule_success",
                extra: { data }
            });
            return data;
        } else {
            logging.error({
                message: `Failed to pin module: ${response.status} - ${response.statusText}`,
                eventName: "pinModule_failure",
                extra: { module_id, responseStatus: response.status, responseText: response.statusText }
            });
            return null;
        }
    } catch (error) {
        logging.error({
            message: "Error during pinModule",
            eventName: "pinModule_error",
            extra: { module_id, errorDetails: error.message }
        });
        return null;
    }
}


/**
 * Renders the dashboard by fetching and displaying modules in their respective categories.
 */
async function renderDashboard() {
    try {
        // Define the category lists
        const categoryLists = {
            'Before you move': document.querySelector('[w-el="before_you_move_list"]'),
            '1-3 months in Germany': document.querySelector('[w-el="1_3_months_list"]')
        };

        // Clear all lists before fetching new module data
        Object.keys(categoryLists).forEach(category => {
            clearList(categoryLists[category]);
        });

        // Fetch module data
        const data = await getModules();
        if (!data) {
            logging.error({
                message: "No data returned from getModules",
                eventName: "renderDashboard_getModules_no_data"
            });
            return;
        }

        // Populate each list with filtered and sorted module data
        Object.keys(categoryLists).forEach(category => {
            const filteredModules = filterAndSortModules(data, category);
            populateList(categoryLists[category], filteredModules);
        });
    } catch (error) {
        logging.error({
            message: "Error during renderDashboard",
            eventName: "renderDashboard_error",
            extra: { errorDetails: error.message }
        });
    }
}

function filterAndSortModules(data, category) {
    return data
        .filter(item => item.module_category === category)
        .sort((a, b) => a.order - b.order);
}

function populateList(listElement, modules) {
    const moduleElements = { pinned: [], normal: [], completed: [] };

    modules.forEach(module => {
        const htmlObject = createDashboardCard(module);
        const listType = module.is_completed ? 'completed' : module.is_pinned ? 'pinned' : 'normal';
        moduleElements[listType].push(htmlObject);
    });

    ['pinned', 'normal', 'completed'].forEach(listType => {
        moduleElements[listType].forEach(element => {
            listElement.innerHTML += element;
        });
    });
}

function clearList(listElement) {
    while (listElement.firstChild) {
        listElement.removeChild(listElement.firstChild);
    }
}

/**
 * Sets up an event listener for the module list.
 * Listens for click events to pin modules.
 */
function setupModuleListEventListener() {
    const module_list = document.querySelector('[w-el="before_you_move_list"]');

    module_list.addEventListener('click', async function(event) {
        const target = event.target.closest('[w-el="module_pinButton"]');
        if (target) {
            const module_item = target.closest('[w-el="module_item"]');
            if (module_item && module_item.id) {
                try {
                    await pinModule(module_item.id);
                    await renderDashboard();
                } catch (error) {
                    logging.error({
                        message: "Error during module pinning",
                        eventName: "module_pinning_error",
                        extra: { moduleId: module_item.id, errorDetails: error.message }
                    });
                }
            }
        }
    });
}
