import { getCookie, getUser, redirectToLogin, redirectToVerificationPending, sendVerificationMail } from "../../auth";

export async function render () {


    const verifyEmailComponent = document.querySelector('[w-el="verifyMail_component"]');
    const alreadyVerifiedComponent = document.querySelector('[w-el="alreadyVerified_component"]');
    const submitButton = document.querySelector('[w-el="submitButton"]');
    const errorWrapper = document.querySelector('[w-el="error"]');
    const firstname = document.querySelectorAll('[w-el="firstname"]');

    const token = getCookie('wized_token');

    const user = await getUser(token);


    firstname.forEach(name => {
        name.textContent = user.firstname;
    });

    console.log(user);

    if (user.id) {
        //its a user
        if (user.is_verified) {
            // display card Email is already verified
            alreadyVerifiedComponent.classList.remove('hide');
            
        } else {
            try {

                verifyEmailComponent.classList.remove('hide');
                //send email with verification link
                submitButton.addEventListener('click', async function () {
                    submitButton.firstChild.textContent = 'Please wait ...';
                    var response = await sendVerificationMail(user.email, "email_verification",DOMAIN_URL+"/account/email-verification");
                    submitButton.firstChild.textContent = 'Send Verification Email';
                    
                    if (response.message.success) {
                        redirectToVerificationPending();
                    } else {
                        errorWrapper.classList.remove('hide');
                        errorWrapper.firstChild.textContent = response.message;
                    }
                });
                
            } catch (error) {
                console.error("Error during email verification:", error);
            }     

        }
        
    } else {
        redirectToLogin();
    }
        

        
    
        //is verified???

    document.addEventListener("DOMContentLoaded", async function() {

        
    
    
    });

}

