function getQueryParam(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
}

function getCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null; // or undefined, depending on your needs
}

function setCookie(value) {
    document.cookie = "wized_token=" + value + ";path=/";
}

function reloadPage() {
        location.reload();
}

function renderTypeform(form_id, variables) {
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

function toSafeFileName(text) {
    // Replace non-alphanumeric characters with an empty string
    // Replace spaces with underscores, then convert to lowercase
    return text.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_').toLowerCase();
}