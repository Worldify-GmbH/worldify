import { getCookie, setCookie, redirectToDashboard, getQueryParam, getUser, deleteCookie} from "../../auth";

export async function render () {

    const magicToken = getQueryParam('token');
    const successMessage = document.querySelector('[w-el="verification_successMessage"]');
    const firstname = document.querySelector('[w-el="firstname"]');
    const failedMessage = document.querySelector('[w-el="verification_failedMessage"]');
    const submitButton = document.querySelector('[w-el="submitButton"]');
    //const buttonWrapper = document.querySelector('[w-el="mailVerification_buttonWrapper"]');

    console.log(magicToken);


    const formData = new FormData();

    formData.append('magic_token',magicToken);

    try {
        const response = await fetch(AUTH_URL + '/auth/magic-login', {
            method: 'POST',
            headers: {},
            body: formData
        });

        const data = await response.json();

        console.log(data);
        console.log(response);

        if (response.ok) {
            const token = data;

            setCookie(token);

            const user = await getUser(token);

            firstname.textContent = user.firstname;

            successMessage.classList.remove('hide');

            console.log(token);

        } else {

            failedMessage.classList.remove('hide');
            console.error('Magic Login failed:', response.statusText);
        }
    } catch (error) {
        console.error('Error with magic login:', error);
    }
}