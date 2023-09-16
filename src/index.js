import {checkAuthentication, displayUser} from './modules/auth.js';
import * as Login from './modules/pages/account/login.js';
import * as Signup from './modules/pages/account/signup.js';
import * as Onboarding from './modules/pages/account/onboarding.js';
import * as SendMailVerification from './modules/pages/account/send_mail_verification.js';
import * as EmailVerification from './modules/pages/account/verify_mail.js';
import * as Dashboard from './modules/pages/app/dashboard.js';

const account_routes = {
    '/account/login' : Login.render,
    '/account/signup' : Signup.render,
    '/account/onboarding' : Onboarding.render,
    '/account/verify-email' : SendMailVerification.render,
    '/account/email-verification' : EmailVerification.render
}

const app_routes = {
    '/app/dashboard' : Dashboard.render,
}


console.log(AUTH_URL);
document.addEventListener("DOMContentLoaded", function() {
    const path = window.location.pathname;

    if (path.startsWith('/app/')) {
        checkAuthentication();
        displayUser();

        if (app_routes[path]) {
            app_routes[path]();
        }

    } else if (path.startsWith('/account/')) {

        if (account_routes[path]) {
            account_routes[path]();
        }
    }


});