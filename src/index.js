import {checkAuthentication, displayUser, setupLogout} from './modules/auth.js';
import { displayLoader, logging } from './modules/utils.js';
import * as Login from './modules/pages/account/login.js';
import * as Signup from './modules/pages/account/signup.js';
import * as Onboarding from './modules/pages/account/onboarding.js';
import * as Dashboard from './modules/pages/app/dashboard.js';
import * as Visa from './modules/pages/app/Visa/visa.js';
import * as VisaFinder from './modules/pages/app/Visa/visa_finder.js';
import * as UploadPage from './modules/pages/app/Visa/upload_page.js';
import * as HealthInsurance from './modules/pages/app/Health_Insurance/health_insurance.js';
import * as HealthInsuranceFinder from './modules/pages/app/Health_Insurance/health_insurance_finder.js';
import * as AccountSettings from './modules/pages/account/account_settings.js';
import * as AccountPage from './modules/form_handling.js';
import * as SendPasswordReset from './modules/pages/account/send_password_reset.js';
import * as PasswordReset from './modules/pages/account/reset_password.js';

// Define routes for account-related pages
const accountRoutes = {
    '/account/login' : Login.render,
    '/account/signup' : Signup.render,
    '/account/onboarding' : Onboarding.render,
    '/account/send-password-reset' : SendPasswordReset.render,
    '/account/reset-password': PasswordReset.render
}

// Define routes for application-specific pages
const appRoutes = {
    '/app/dashboard' : Dashboard.render,
    '/app/account-settings' : AccountSettings.render,
    '/app/modules/visa' : Visa.render,
    '/app/modules/visa-modules/visa-finder' : VisaFinder.render,
    '/app/modules/visa-modules/residence-permit-module/residence-permit-berlin' : UploadPage.render,
    '/app/modules/visa-modules/residence-permit-module/residence-permit-munich' : UploadPage.render,
    '/app/modules/visa-modules/blue-card-module/prepare-blue-card-application-berlin': UploadPage.render,
    '/app/modules/visa-modules/blue-card-module/prepare-blue-card-application-munich': UploadPage.render,
    '/app/modules/visa-modules/freelance-visa-module/prepare-freelance-visa-application-berlin': UploadPage.render,
    '/app/modules/visa-modules/freelance-visa-module/prepare-freelance-visa-application-munich': UploadPage.render,
    '/app/modules/visa-modules/jobseeker-visa-module/prepare-jobseeker-visa-application-berlin': UploadPage.render,
    '/app/modules/visa-modules/jobseeker-visa-module/prepare-jobseeker-visa-application-munich': UploadPage.render,
    '/app/modules/visa-modules/family-reunification-module/prepare-family-reunification-visa-application-berlin': UploadPage.render,
    '/app/modules/visa-modules/family-reunification-module/prepare-family-reunification-visa-application-munich': UploadPage.render,
    '/app/modules/visa-modules/national-d-visa' : UploadPage.render,
    '/app/modules/health-insurance' : HealthInsurance.render,
    '/app/modules/health-insurance-modules/health-insurance-finder' : HealthInsuranceFinder.render

}

// Function to initialize the application
function initApp() {
    displayLoader();
    const path = window.location.pathname;
    
    // Handle authentication and user display for app routes
    if (path.startsWith('/app/')) {
        handleAppRoutes(path);
    } else if (path.startsWith('/account/')) {
        handleAccountRoutes(path);
    }
}

// Handle routing for app pages
async function handleAppRoutes(path) {
    const authResponse = await checkAuthentication();
    if (authResponse.success) {
        displayUser(authResponse.user);
    }

    setupLogout();

    if (appRoutes[path]) {
        appRoutes[path]();
    }
}

// Handle routing for account pages
function handleAccountRoutes(path) {
    if (accountRoutes[path]) {
        accountRoutes[path]();
    }
}

// Listen for when the DOM content is fully loaded, then initialize the app
document.addEventListener("DOMContentLoaded", initApp);
