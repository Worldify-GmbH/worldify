import {checkAuthentication, displayUser, setupLogout} from './modules/auth.js';
import '@eonasdan/tempus-dominus/dist/css/tempus-dominus.min.css';

// Define routes for account-related pages
const accountRoutes = {
    '/account/login' : () => import('./modules/pages/account/login.js').then(module => module.render()),
    '/account/signup' : () => import('./modules/pages/account/signup.js').then(module => module.render()),
    '/account/onboarding' : () => import('./modules/pages/account/onboarding.js').then(module => module.render()),
    '/account/send-password-reset' : () => import('./modules/pages/account/send_password_reset.js').then(module => module.render()),
    '/account/reset-password': () => import('./modules/pages/account/reset_password.js').then(module => module.render()),
    '/account/resend-email-verification' : () => import('./modules/pages/account/send_email_verification_link.js').then(module => module.render())
}

// Define routes for application-specific pages
const appRoutes = {
    '/app/dashboard' : () => import('./modules/pages/app/dashboard.js').then(module => module.render()),
    '/app/account-settings' : () => import('./modules/pages/account/account_settings.js').then(module => module.render()),
    '/app/document-vault': () => import('./modules/pages/app/vault.js').then(module => module.render()),
    '/app/modules/visa' : () => import('./modules/pages/app/Visa/visa.js').then(module => module.render()),
    '/app/modules/visa-modules/visa-finder' : () => import('./modules/pages/app/Visa/visa_finder.js').then(module => module.render()),
    '/app/modules/visa-modules/residence-permit-module/prepare-residence-permit-application' : () => import('./modules/pages/app/Visa/upload_page.js').then(module => module.render()),
    '/app/modules/visa-modules/blue-card-module/prepare-blue-card-application': () => import('./modules/pages/app/Visa/upload_page.js').then(module => module.render()),
    '/app/modules/visa-modules/freelance-visa-module/prepare-freelance-visa-application': () => import('./modules/pages/app/Visa/upload_page.js').then(module => module.render()),
    '/app/modules/visa-modules/jobseeker-visa-module/prepare-jobseeker-visa-application': () => import('./modules/pages/app/Visa/upload_page.js').then(module => module.render()),
    '/app/modules/visa-modules/family-reunification-module/prepare-family-reunification-visa-application': () => import('./modules/pages/app/Visa/upload_page.js').then(module => module.render()),
    '/app/modules/visa-modules/national-d-visa' : () => import('./modules/pages/app/Visa/prepare_national_d_visa.js').then(module => module.render()),
    '/app/modules/health-insurance' : () => import('./modules/pages/app/Health_Insurance/health_insurance.js').then(module => module.render()),
    '/app/modules/health-insurance-modules/health-insurance-finder' : () => import('./modules/pages/app/Health_Insurance/health_insurance_finder.js').then(module => module.render()),
    '/app/human-support/visa-residence-title-support' : () => import('./modules/pages/app/Human_Support/visa_support.js').then(module => module.render()),

}

// Function to initialize the application
function initApp() {
    //displayLoader();
    const path = window.location.pathname;

    console.log(DOMAIN_URL);
    
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
