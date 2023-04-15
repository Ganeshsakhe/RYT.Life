const MailHelper = require('../../../helpers/email_helpers');
const validators = require("../../../helpers/validators");
// const html_content = require("../../../views");
const ejs = require("ejs");
const handlebars = require("handlebars");

// ! local machine
// const base_URL = "/Users/xyz/Desktop/RYT_all/ryt-life/app/views/";
// const employee_base_URL = "/Users/xyz/Desktop/RYT_all/ryt-life/app/views1/";

// // Stage and Dev Path 
// const base_URL = "/home/uipep/ryt-life/app/views/";
// const employee_base_URL = "/home/uipep/ryt-life/app/views1/";

// //* Production Path 
const base_URL = "/opt/bitnami/projects/ryt-life/app/views/";
const employee_base_URL = "/opt/bitnami/projects/ryt-life/app/views1/";

const signupConfirmationEmail = (dataObj, next) => {
    console.log('inside signupConfirmationEmail');
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Hi ${dataObj.first_name},<br/>
        // <br/>
        // Thank you for registering with Ryt.Life<br/>
        // <br/>
        // Kindly use your regsitered email id or mobile number to login into <a href="consult.ryt.life">consult.ryt.life</a>. You can either use the password provided at the time of sign up or use the OTP feature.<br/>
        // <br/>
        // We hope to provide a great experience to you. For any issues / concerns / feedback, you can reach us at <a href="info@ryt.life">info@ryt.life</a> <br/>
        // <br/>
        // Cheers,<br/>
        // Team Ryt Life<br/>

        // </p><br/>`;
        // const mailData = {
        //     from: 'no-reply@ryt.life',
        //     to: `${dataObj.emailId}`,
        //     subject: 'Registration successful',
        //     html: content,
        //     text: 'You have successfully registerd to rytlife!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);
        //         next(err, null);
        //     } else {
        //         console.dir("data");
        //         console.dir(data);
        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });
        var msgData = {
            "flow_id": "614c5e207779317853709f4a",
            "sender": "RYTCON",
            "recipients": [{ "mobiles": 91 + `${dataObj.mobileNo}`, "name": `${dataObj.first_name}` }]
        }
        MailHelper.sendSMS(msgData, (err, data) => {
            if (err) {
                console.log("SMS err");

                console.log(data);
                next(err, null);
            } else {
                console.log("sms data");
                console.log(data);

                next(null, { success: true, data });
            }
        })
        MailHelper.readHTMLFile(base_URL + "email-signupConfirmation.html", function (err, data) {
            var template = handlebars.compile(data);
            var replacements = {
                first_name: dataObj.first_name
            }
            var htmlToSend = template(replacements);
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: 'no-reply@ryt.life',
                    to: `${dataObj.emailId}`,
                    subject: 'Registration successful',
                    html: htmlToSend,
                    text: 'You have successfully registerd to rytlife!'
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })

            }
        })
    }
};

const doctorsignupConfirmationEmail = (dataObj, next) => {
    console.log('inside signupConfirmationEmail');
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.name},<br/>
        // <br/>
        // Thank you for providing your details. We will be shortly sharing your login details.<br/>
        // <br/>
        // Cheers<br/>
        // Team RytLife<br/>

        // </p><br/>`;

        // const mailData = {
        //     from: 'patner@ryt.life',
        //     to: `${dataObj.emailId}`,
        //     subject: 'We have received your details!',
        //     html: content,
        //     text: 'We have received your details!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);
        //         next(err, null);
        //     } else {
        //         console.dir("data");
        //         console.dir(data);
        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });

        MailHelper.readHTMLFile(base_URL + "email-doctorSignupConfirmation.html", function (err, data) {
            var template = handlebars.compile(data);
            var replacements = {
                name: dataObj.name
            }
            var htmlToSend = template(replacements);
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: 'patner@ryt.life',
                    to: `${dataObj.emailId}`,
                    subject: 'We have received your details!',
                    html: htmlToSend,
                    text: 'We have received your details!'
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })

            }
        })

    }
};

const employeebookingConfirmationEmail = (dataObj, next) => {
    console.log('inside employeebookingConfirmationEmail');
    console.log("for email", dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.name},<br/>
        // <br/>
        // Thank you for providing your details. We will be shortly sharing your login details.<br/>
        // <br/>
        // Cheers<br/>
        // Team RytLife<br/>

        // </p><br/>`;

        // const mailData = {
        //     from: 'patner@ryt.life',
        //     to: `${dataObj.emailId}`,
        //     subject: 'We have received your details!',
        //     html: content,
        //     text: 'We have received your details!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);
        //         next(err, null);
        //     } else {
        //         console.dir("data");
        //         console.dir(data);
        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });

        MailHelper.readHTMLFile(employee_base_URL + "email-bookingSuccessful_employee.html", function (err, data) {
            var template = handlebars.compile(data);
            var replacements = {
                name: dataObj.name,
                user_first_name: dataObj.user_first_name,
                order_id: dataObj.order_id,
                bookedslots_date: dataObj.bookedslots_date,
                bookedslots_slots_from: dataObj.bookedslots_slots_from,
                doctor_name: dataObj.doctor_name,
            }
            var htmlToSend = template(replacements);
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: 'no-reply@ryt.life',
                    to: `${dataObj.emailId}`,
                    subject: 'We have received your details!',
                    html: htmlToSend,
                    text: 'We have received your details!'
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })

            }
        })

    }
};

const doctorbookingConfirmationEmail = (dataObj, next) => {
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.name},<br/>
        // <br/>
        // Thank you for providing your details. We will be shortly sharing your login details.<br/>
        // <br/>
        // Cheers<br/>
        // Team RytLife<br/>

        // </p><br/>`;

        // const mailData = {
        //     from: 'patner@ryt.life',
        //     to: `${dataObj.emailId}`,
        //     subject: 'We have received your details!',
        //     html: content,
        //     text: 'We have received your details!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);
        //         next(err, null);
        //     } else {
        //         console.dir("data");
        //         console.dir(data);
        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });

        MailHelper.readHTMLFile(employee_base_URL + "email-doctorBookingSuccessful_employee.html", function (err, data) {
            var template = handlebars.compile(data);
            var replacements = {
                name: dataObj.name,
                user_first_name: dataObj.user_first_name,
                order_id: dataObj.order_id,
                bookedslots_date: dataObj.bookedslots_date,
                bookedslots_slots_from: dataObj.bookedslots_slots_from,
                doctor_name: dataObj.doctor_name,
            }
            var htmlToSend = template(replacements);
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: 'no-reply@ryt.life',
                    to: `${dataObj.emailId}`,
                    subject: 'We have received your details!',
                    html: htmlToSend,
                    text: 'We have received your details!'
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })

            }
        })

    }
};


const welcomeConfirmationEmail = (dataObj, next) => {
    console.log('inside loginConfirmationEmail');
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.first_name},<br/>
        // <br/>
        // Welcome to RytLife!!<br/>
        // <br/>
        // RYT.life is your safe space. We understand your needs and are here to hear you. We as an online platform help you in consulting the trusted and experienced psychologists/psychiatrists, at your convenience. You can trust us to provide you with easy, accessible and professional services.<br/>
        // <br/>
        // For any issue or query feel free to drop us a note at <a href="info@ryt.life">info@ryt.life</a><br/>
        // <br/>
        // Choose Life. Choose RYTLife!
        // <br/>
        // </p><b/>`;


        // const mailData = {
        //     from: 'no-reply@ryt.life',
        //     to: `${dataObj.emailId}`,
        //     subject: 'Welcome to RytLife',
        //     html: content,
        //     text: 'Welcome to rytlife!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);
        //         next(err, null);
        //     } else {
        //         console.dir("data");
        //         console.dir(data);
        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });


        MailHelper.readHTMLFile(base_URL + "welcomeConfirmation.html", function (err, data) {
            var template = handlebars.compile(data);
            var replacements = {
                first_name: dataObj.first_name
            }
            var htmlToSend = template(replacements);
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: 'no-reply@ryt.life',
                    to: `${dataObj.emailId}`,
                    subject: 'Welcome to RytLife',
                    html: htmlToSend,
                    text: 'Welcome to rytlife!',
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })

            }
        })
    }
};

const doctorwelcomeConfirmationEmail = (dataObj, next) => {
    console.log('inside doctorwelcomeConfirmationEmail');
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.name},<br/>
        // <br/>
        // Congratulations, you are now a RytLife Partner!!<br/>
        // <br/>
        // Kinldy register as a New user on <a href="partner.ryt.life">partner.ryt.life</a> to create your password. You can use either your mobile number or email id as your username.<br/>
        // <br/>
        // If you face any issue, then contact us at 9513328086.<br/>
        // <br/>
        // Cheers,<br/>
        // Team RytLife<br/>

        // </p><b/>`;


        // const mailData = {
        //     from: 'partner@ryt.life',
        //     to: `${dataObj.emailId}`,
        //     subject: 'Welcome Onboard!',
        //     html: content,
        //     text: 'Welcome Onboard!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);
        //         next(err, null);
        //     } else {
        //         console.dir("data");
        //         console.dir(data);
        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });



        MailHelper.readHTMLFile(base_URL + "doctorWelcomeConfirmation.html", function (err, data) {
            var template = handlebars.compile(data);
            var replacements = {
                name: dataObj.name
            }
            var htmlToSend = template(replacements);
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: 'partner@ryt.life',
                    to: `${dataObj.emailId}`,
                    subject: 'Welcome Onboard!',
                    html: htmlToSend,
                    text: 'Welcome Onboard!',
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })

            }
        })
    }
};

const resetConfirmationEmail = (dataObj, next) => {
    console.log('inside resetConfirmationEmail');
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.first_name},<br/>
        // <br/>
        // You password has been reset. If you have not requested for the same then please write to us at <a href="info.ryt.life">info.ryt.life</a><br/>
        // <br/>
        // Cheers<br/>
        // Team RYTLife<br/>

        // </p><br/>`;
        // const mailData = {
        //     from: 'no-reply@ryt.life',
        //     to: `${dataObj.emailId}`,
        //     subject: 'Password reset',
        //     html: content,
        //     text: 'Your Password has been successfully reset!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);


        //         next(err, null);


        //     } else {
        //         console.dir("data");
        //         console.dir(data);

        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // }); 


        MailHelper.readHTMLFile(base_URL + "resetConfirmation.html", function (err, data) {
            var template = handlebars.compile(data);
            var replacements = {
                first_name: dataObj.first_name
            }
            var htmlToSend = template(replacements);
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: 'no-reply@ryt.life',
                    to: `${dataObj.emailId}`,
                    subject: 'Password reset',
                    html: htmlToSend,
                    text: 'Your Password has been successfully reset!',
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })

            }
        })

    }
};


const sendEmailOtp = (dataObj, next) => {
    console.log("===========================================>", dataObj);
    MailHelper.readHTMLFile(base_URL + "email-otp.html", function (err, data) {
        var template = handlebars.compile(data);
        var replacements = {
            otp: dataObj.otp
        };
        var htmlToSend = template(replacements);
        if (err) {
            console.log(err);
        } else {
            var mainOptions = {
                from: 'no-reply@ryt.life',
                to: `${dataObj.emailId}`,
                subject: 'OTP for login to RytLife',
                html: htmlToSend
            };

            MailHelper.htmlGrid(mainOptions, (err, data) => {
                if (err) {
                    console.dir("email-template err");
                    console.dir(data);
                    next(err, null);
                } else {

                    console.dir("data");
                    console.dir(data);

                    next(null, { success: true, data });
                    console.log(data);
                }
            })

        }

    });


}


// const sendEmailOtp = (dataObj , next) => {
//     console.log('inside sendEmailOtp');
//     console.log(dataObj);
//     if (dataObj) {

//             let content = `<p>
//             Dear ${dataObj.firstName},<br/>
//             <br/>
//             Kindly enter the below OTP to login to <a href="consult.ryt.life">consult.ryt.life</a><br/>
//             ${dataObj.otp}<br/>
//             <br/>
//             Cheers<br/>
//             Team RYTLife<br/>

//             </p><br/>`;

//             const mailData = {
//                 from: 'no-reply@ryt.life',
//                 to: `${dataObj.emailId}`,
//                 subject: 'OTP for login to RytLife',
//                 html: content,
//                 text: 'Your OTP has been sent!'
//             };
//             MailHelper.sendgridMail(mailData, (err, data) => {
//                 if (err) {
//                     console.dir("err");
//                     console.dir(data);


//                     next(err, null);


//                 } else {
//                     MailHelper.sendSMS(mailData,(err, data) => {
//                         if(err){
//                             console.dir("err");
//                             console.dir(data);
//                             next(err, null);
//                         }else{
//                             console.dir("data sms");
//                             console.dir(data);
//                             // next(null,{success:true,data});
//                             console.log(data);
//                         }
//                     })
//                     console.dir("data otp");
//                     console.dir(data);

//                      next(null, { success: true, data });
//                     console.log(data);
//                 }
//             });
//     }
// };

const sendEmailOtpDoctor = (dataObj, next) => {
    console.log('inside sendEmailOtp');
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.firstName},<br/>
        // <br/>
        // Kindly enter the below OTP to login to <a href="partner.ryt.life">partner.ryt.life</a><br/>
        // ${dataObj.otp}<br/>
        // <br/>
        // Cheers<br/>
        // Team RYTLife<br/>

        // </p><br/>`;

        // const mailData = {
        //     from: 'no-reply@ryt.life',
        //     to: `${dataObj.emailId}`,
        //     subject: 'Email OTP!',
        //     html: content,
        //     text: 'Your OTP has been sent!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);


        //         next(err, null);


        //     } else {
        //         console.dir("data");
        //         console.dir(data);

        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });

        MailHelper.readHTMLFile(base_URL + "email-doctorOtp.html", function (err, data) {
            var template = handlebars.compile(data);
            var replacements = {
                firstName: dataObj.firstName,
                otp: dataObj.otp
            };
            console.log(dataObj);
            var htmlToSend = template(replacements);
            if (err) {
                console.log(err);
            }
            // else if(dataObj.blocked == true){
            //     console.log(dataObj.blocked == true);
            // } 
            else {
                var mainOptions = {
                    from: 'no-reply@ryt.life',
                    to: `${dataObj.emailId}`,
                    subject: 'Email OTP!',
                    html: htmlToSend,
                    text: 'Your OTP has been sent!',
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })

            }

        });
    }
};

const paymentSuccessEmail = (dataObj, next) => {
    console.log('inside paymentSuccessEmail');
    console.log(dataObj);
    if (dataObj) {

        // let content= `<p>
        // Hi ${dataObj.user_firstName},<br/>
        // <br/>
        // We would like to confirm the we have received your payment and your order id is ${dataObj.order_id}. You will receive the appointment confirmation in a separate email.<br/>
        // <br/>
        // In case of any query please reach out to us at <a href="info@ryt.life">info@ryt.life</a> <br/>
        // <br/>
        // Cheers<br/>
        // Team RYTLife<br/>

        // </p><br/>`;
        // const mailData = {
        //     from: 'orders@ryt.life',
        //     to: `${dataObj.user_emailId}`,
        //     subject: 'Payment received',
        //     html: content,
        //     text: 'Your payment has been successfully recieved!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);


        //         next(err, null);


        //     } else {
        //         console.dir("data");
        //         console.dir(data);

        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });



        MailHelper.readHTMLFile(base_URL + "paymentSuccess.html", function (err, data) {
            var template = handlebars.compile(data);
            var replacements = {
                first_name: dataObj.user_firstName,
                order_id: dataObj.order_id
            }
            var htmlToSend = template(replacements);
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: 'orders@ryt.life',
                    to: `${dataObj.user_emailId}`,
                    subject: 'Payment received',
                    html: htmlToSend,
                    text: 'Your payment has been successfully recieved!',
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })

            }
        })

    }
};

const paymentUnsuccessEmail = (dataObj, next) => {
    console.log('inside paymentUnsuccessEmail');
    //console.log(dataObj);
    if (dataObj) {
        // let content = `<p>
        // Hi ${dataObj.user_firstName},<br/>
        // <br/>
        // We regret to inform that your payment was not successful.
        // <br/>
        // In case the money was debited then the same will be refunded through the original payment mode. Feel free to reach out to us if the refund does not take place in 7 working days.<br/>
        // <br/>
        // Cheers<br/>
        // Team RYTLife<br/>

        // </p><br/>`;

        //     const mailData = {
        //         from: 'orders@ryt.life',
        //         to: `${dataObj.user_emailId}`,
        //         subject: 'Payment failure',
        //         html: content,
        //         text: 'Your Payment has been failed!',
        //     };
        //     MailHelper.sendgridMail(mailData, (err, data) => {
        //         if (err) {
        //             console.dir("err");
        //             console.dir(data);


        //         } else {
        //             console.dir("data");
        //             console.log(data);
        //         }
        //     });

        MailHelper.readHTMLFile(base_URL + "paymentUnsuccess.html", function (err, data) {
            var template = handlebars.compile(data);
            var replacements = {
                first_name: dataObj.user_firstName
            }
            var htmlToSend = template(replacements);
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: 'orders@ryt.life',
                    to: `${dataObj.user_emailId}`,
                    subject: 'Payment failure',
                    html: htmlToSend,
                    text: 'Your Payment has been failed!',
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })

            }
        })
    }
};

const bookingSuccessEmail = (dataObj, next) => {
    console.log('inside bookingSuccessEmail');
    console.log("DataObj*************", dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.userId.first_name},<br/>
        // <br/>
        // Your appointment is confirmed and here are the details:<br/>
        // <br/>
        // Booking id: ${dataObj.order.id}<br/>
        // Date of appointment: ${dataObj.bookedslots.date}<br/>
        // Time: ${dataObj.bookedslots.slots[0].from}<br/>
        // Councellor: ${dataObj.doctorId.name}<br/>
        // <br/>
        // We request you to login to <a href="consult.ryt.life">consult.ryt.life</a> before the session begins. The meeting link will be active on the Home screen 5 mins before the call.<br/>
        // <br/>
        // In case you are unable to make it, the reschedule option is available 2 hrs prior to the call. Kindly note that while rescheduling the councellor/therapist cannot be changed.<br/>
        // <br/>
        // We wish a great session for you.<br/>
        // <br/>
        // In case you have any query then reach out to us at <a href="info@ryt.life">info@ryt.life</a><br/>
        // <br/>
        // Cheers<br/>
        // Team RYTLife<br/>

        // </p><br/>`;

        // let content1 = `<p>
        // Dear ${dataObj.doctorId.name},<br/>
        // <br/>
        // An appointment is confirmed with you and below are the details: <br/>
        // <br/>
        // Booking id: ${dataObj.order.id}<br/>
        // Date of appointment: ${dataObj.bookedslots.date}<br/>
        // Time: ${dataObj.bookedslots.slots[0].from}<br/>
        // Client: ${dataObj.userId.first_name}<br/>
        // <br/>
        // We request you to login into <a href="partner.ryt.life">partner.ryt.life</a> before the session. The meeting link will be active on the Home screen 5 mins before the call.<br/>
        // <br/>
        // In case you have any query then reach out to us at <a href="info@ryt.life">info@ryt.life</a><br/>
        // <br/>
        // Cheers<br/>
        // Team RYTLife<br/>

        // </p><br/>`;

        // const mailData = 
        // [
        //     {
        //         from: 'orders@ryt.life',
        //         to: `${dataObj.doctorId.emailId}`,
        //         cc: ['mohan@trutechlabs.in','prateeksingh16@gmail.com'],
        //         subject: 'Appointment booking confirmation',
        //         html: content1,
        //         text: 'Your Appointment has been Booked!',
        //     },
        //     {
        //         from: 'orders@ryt.life',
        //         to: `${dataObj.userId.emailId}`,
        //         subject: 'Appointment Confirmation',
        //         html: content,
        //         text: 'Your Appointment has been Confirmed!',
        //     }
        // ];
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);
        //         next(err, null);
        //     } else {
        //         console.dir("data");
        //         console.dir(data);
        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });

        var bookslotTime = dataObj.bookedslots.date + ' ' + dataObj.bookedslots.slots[0].from;

        var msgData = {
            "flow_id": "612dcdc62a27eb1ec16b47b9",
            "sender": "RYTCON",
            "recipients": [{ "mobiles": 91 + `${dataObj.userId.mobileNo}`, "name": `${dataObj.doctorId.name}`, "date": `${bookslotTime}` }]
        }
        MailHelper.sendSMS(msgData, (err, data) => {
            if (err) {
                console.log("SMS err");

                console.log(data);
                next(err, null);
            } else {
                console.log("sms data");
                console.log(data);

                next(null, { success: true, data });
            }
        })



        if (dataObj.userId !== null) {
            MailHelper.readHTMLFile(base_URL + "email-bookingSuccessful.html", function (err, data) {
                var template = handlebars.compile(data);
                var replacements = {
                    user_first_name: dataObj.userId.first_name,
                    order_id: dataObj.order.id,
                    bookedslots_date: dataObj.bookedslots.date,
                    bookedslots_slots_from: dataObj.bookedslots.slots[0].from,
                    doctor_name: dataObj.doctorId.name
                };
                var htmlToSend = template(replacements);
                MailHelper.readHTMLFile(base_URL + "email-doctorBookingSuccessful.html", function (err, data1) {
                    var template1 = handlebars.compile(data1);
                    var htmlToSend1 = template1(replacements);
                    if (err) {
                        console.log(err);
                    } else {
                        var mainOptions = [
                            {
                                from: 'orders@ryt.life',
                                to: `${dataObj.doctorId.emailId}`,
                                cc: ['mohan@trutechlabs.in', 'prateeksingh16@gmail.com'],
                                subject: 'Appointment booking confirmation',
                                html: htmlToSend1,
                                text: 'Your Appointment has been Booked!',
                            },
                            {
                                from: 'orders@ryt.life',
                                to: `${dataObj.userId.emailId}`,
                                subject: 'Appointment Confirmation',
                                html: htmlToSend,
                                text: 'Your Appointment has been Confirmed!',
                            }
                        ];
                        MailHelper.htmlGrid(mainOptions, (err, data) => {
                            if (err) {
                                console.dir("email-template err");
                                console.dir(data);
                                next(err, null);
                            } else {

                                console.dir("data");
                                console.dir(data);

                                next(null, { success: true, data });
                                console.log(data);
                            }
                        })

                    }
                })


            });
        }



    }
};

const bookingUnsuccessEmail = (dataObj, next) => {
    console.log('inside bookingUnsuccessEmail');
    console.log(dataObj);
    if (dataObj) {
        // let content = `<p>
        // Hi ${dataObj.user_firstName},<br/>
        // <br/>
        // Something went wrong. Request you try again to book the appointment.<br/>
        // If you face the issue again then do let us know at <a href="info@ryt.life">info@ryt.life</a><br/>
        // <br/>
        // Cheers<br/>
        // Team RYTLife
        // <br/>
        // </p><br/>`;

        // const mailData = {
        //     from: 'orders@ryt.life',
        //     to: `${dataObj.user_emailId}`,
        //     subject: 'Booking unsuccessful',
        //     html: content,
        //     text: 'Your appointment has been not booked!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);
        //         next(err, null);
        //     } else {
        //         console.dir("data");
        //         console.dir(data);
        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });

        MailHelper.readHTMLFile(base_URL + "bookingUnsuccessful.html", function (err, data) {
            var template = handlebars.compile(data);
            var replacements = {
                user_first_name: dataObj.user_firstName
            };
            var htmlToSend = template(replacements);
            var mainOptions = {
                from: 'orders@ryt.life',
                to: `${dataObj.user_emailId}`,
                subject: 'Booking unsuccessful',
                html: htmlToSend,
                text: 'Your appointment has been not booked!',
            };
            MailHelper.htmlGrid(mainOptions, (err, data) => {
                if (err) {
                    console.dir("email-template err");
                    console.dir(data);
                    next(err, null);
                } else {

                    console.dir("data");
                    console.dir(data);

                    next(null, { success: true, data });
                    console.log(data);
                }
            })
        });

    }
};


const employeebookingUnsuccessEmail = (dataObj, next) => {
    console.log('inside employeebookingUnsuccessEmail');
    console.log(dataObj);
    if (dataObj) {
        // let content = `<p>
        // Hi ${dataObj.user_firstName},<br/>
        // <br/>
        // Something went wrong. Request you try again to book the appointment.<br/>
        // If you face the issue again then do let us know at <a href="info@ryt.life">info@ryt.life</a><br/>
        // <br/>
        // Cheers<br/>
        // Team RYTLife
        // <br/>
        // </p><br/>`;

        // const mailData = {
        //     from: 'orders@ryt.life',
        //     to: `${dataObj.user_emailId}`,
        //     subject: 'Booking unsuccessful',
        //     html: content,
        //     text: 'Your appointment has been not booked!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);
        //         next(err, null);
        //     } else {
        //         console.dir("data");
        //         console.dir(data);
        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });

        MailHelper.readHTMLFile(employee_base_URL + "bookingUnsuccessful_employee.html", function (err, data) {
            var template = handlebars.compile(data);
            var replacements = {
                user_first_name: dataObj.user_first_name
            };
            var htmlToSend = template(replacements);
            var mainOptions = {
                from: 'orders@ryt.life',
                to: `${dataObj.emailId}`,
                subject: 'Booking unsuccessful',
                html: htmlToSend,
                text: 'Your appointment has been not booked!',
            };
            MailHelper.htmlGrid(mainOptions, (err, data) => {
                if (err) {
                    console.dir("email-template err");
                    console.dir(data);
                    next(err, null);
                } else {

                    console.dir("data");
                    console.dir(data);

                    next(null, { success: true, data });
                    console.log(data);
                }
            })
        });

    }
};


const rescheduleAppointmentEmail = (dataObj, next) => {
    console.log('inside rescheduleAppointmentEmail');
    console.log("dataObj", dataObj);
    if (dataObj) {

        //         let content = `<p>
        //         Dear ${dataObj.userId.first_name},<br/>
        //         <br/>
        //         You have successfully rescheduled your appointment. Below are the details:
        //         <br/>
        //         Booking id: ${dataObj.order.id}<br/>
        //         Date of appointment:  ${dataObj.bookedslots.date}<br/>
        //         Time: ${dataObj.bookedslots.slots[0].from}<br/>
        //         Councellor: ${dataObj.doctorId.name}<br/>
        //         <br/>
        //         We request you to login to <a href="consult.ryt.life">consult.ryt.life</a> before the session. The meeting link will be active on the Home screen 5 min before the call. Recheduling of the appointment is allowed only once hence you will not be able reschedule this appointment.<br/>
        //         <br/>
        //         We wish a great session for you.<br/>
        //         <br/>
        //         In case you have any query then reach out to us at <a href="info@ryt.life">info@ryt.life</a><br/>
        //         <br/>
        //         Cheers<br/>
        //         Team RYTLife<br/>

        //         </p><br/>`;

        //         let content1 = `<p>
        //         Dear ${dataObj.doctorId.name},<br/>
        //         <br/>
        //         Your appointment has been reschedule by the client. Below are the updated details:
        //         <br/>
        //         Booking id: ${dataObj.order.id}<br/>
        //         Date of appointment:  ${dataObj.bookedslots.date}<br/>
        //         Time: ${dataObj.bookedslots.slots[0].from}<br/>
        //         Client: ${dataObj.userId.first_name}<br/>
        //         <br/>
        //         We request you to login to <a href="consult.ryt.life">partner.ryt.life</a> before the session. The meeting link will be active on the Home screen 5 min before the call. Recheduling of the appointment is allowed only once hence you will not be able reschedule this appointment.<br/>
        //         <br/>
        //         We wish a great session for you.<br/>
        //         <br/>
        //         In case you have any query then reach out to us at <a href="info@ryt.life">info@ryt.life</a><br/>
        //         <br/>
        //         Cheers<br/>
        //         Team RYTLife<br/>

        //         </p><br/>`;
        //         const mailData = 
        //         [
        //             {
        //                 from: 'orders@ryt.life',
        //                 to: `${dataObj.doctorId.emailId}`,
        //                 bcc: ['mohan@trutechlabs.in','prateeksingh16@gmail.com'],
        //                 subject: 'Rescheduling notification',
        //                 html: content1,
        //                 text: 'Your Appointment has been rescheduled!',
        //             },
        //             {
        //             from: 'orders@ryt.life',
        //             to: `${dataObj.userId.emailId}`,
        //             subject: 'Appointment rescheduled',
        //             html: content,
        //             text: 'Your Appointment has been rescheduled!',
        //         }
        // ];
        //         MailHelper.sendgridMail(mailData, (err, data) => {
        //             if (err) {
        //                 console.dir("err");
        //                 console.dir(data);


        //                 next(err, null);


        //             } else {
        //                 console.dir("data");
        //                 console.dir(data);

        //                  next(null, { success: true, data });
        //                 console.log(data);
        //             }
        //         });



        var msgData = {
            "flow_id": "614c5f6515a3566f8508fe69",
            "sender": "RYTCON",
            "recipients": [{ "mobiles": 91 + `${dataObj.userId.mobileNo}`, "name": `${dataObj.doctorId.name}`, "date and time": `${dataObj.bookedslots.date}` + " " + `${dataObj.bookedslots.slots[0].from}` }]
        }
        MailHelper.sendSMS(msgData, (err, data) => {
            if (err) {
                console.log("SMS err");

                console.log(data);
                next(err, null);
            } else {
                console.log("sms data");
                console.log(data);

                next(null, { success: true, data });
            }
        })


        if (dataObj.userId !== null) {
            MailHelper.readHTMLFile(base_URL + "email-reschedule.html", function (err, data) {
                var template = handlebars.compile(data);
                var replacements = {
                    user_first_name: dataObj.userId.first_name,
                    order_id: dataObj.order.id,
                    bookedslots_date: dataObj.bookedslots.date,
                    bookedslots_slots_from: dataObj.bookedslots.slots[0].from,
                    doctor_name: dataObj.doctorId.name
                };
                var htmlToSend = template(replacements);
                MailHelper.readHTMLFile(base_URL + "email-doctorReschedule.html", function (err, data1) {
                    var template1 = handlebars.compile(data1);
                    var htmlToSend1 = template1(replacements);
                    if (err) {
                        console.log(err);
                    } else {
                        var mainOptions = [
                            {
                                from: 'orders@ryt.life',
                                to: `${dataObj.doctorId.emailId}`,
                                cc: ['mohan@trutechlabs.in', 'prateeksingh16@gmail.com'],
                                subject: 'Rescheduling notification',
                                html: htmlToSend1,
                                text: 'Your Appointment has been rescheduled!',
                            },
                            {
                                from: 'orders@ryt.life',
                                to: `${dataObj.userId.emailId}`,
                                subject: 'Appointment Confirmation',
                                html: htmlToSend,
                                text: 'Your Appointment has been rescheduled!',
                            }
                        ];
                        MailHelper.htmlGrid(mainOptions, (err, data) => {
                            if (err) {
                                console.dir("email-template err");
                                console.dir(data);
                                next(err, null);
                            } else {

                                console.dir("data");
                                console.dir(data);

                                next(null, { success: true, data });
                                console.log(data);
                            }
                        })

                    }
                })


            });
        }

    }
};


const employeerescheduleAppointmentEmail = (dataObj, next) => {
    console.log("dataObj", dataObj);
    if (dataObj) {

        //         let content = `<p>
        //         Dear ${dataObj.userId.first_name},<br/>
        //         <br/>
        //         You have successfully rescheduled your appointment. Below are the details:
        //         <br/>
        //         Booking id: ${dataObj.order.id}<br/>
        //         Date of appointment:  ${dataObj.bookedslots.date}<br/>
        //         Time: ${dataObj.bookedslots.slots[0].from}<br/>
        //         Councellor: ${dataObj.doctorId.name}<br/>
        //         <br/>
        //         We request you to login to <a href="consult.ryt.life">consult.ryt.life</a> before the session. The meeting link will be active on the Home screen 5 min before the call. Recheduling of the appointment is allowed only once hence you will not be able reschedule this appointment.<br/>
        //         <br/>
        //         We wish a great session for you.<br/>
        //         <br/>
        //         In case you have any query then reach out to us at <a href="info@ryt.life">info@ryt.life</a><br/>
        //         <br/>
        //         Cheers<br/>
        //         Team RYTLife<br/>

        //         </p><br/>`;

        //         let content1 = `<p>
        //         Dear ${dataObj.doctorId.name},<br/>
        //         <br/>
        //         Your appointment has been reschedule by the client. Below are the updated details:
        //         <br/>
        //         Booking id: ${dataObj.order.id}<br/>
        //         Date of appointment:  ${dataObj.bookedslots.date}<br/>
        //         Time: ${dataObj.bookedslots.slots[0].from}<br/>
        //         Client: ${dataObj.userId.first_name}<br/>
        //         <br/>
        //         We request you to login to <a href="consult.ryt.life">partner.ryt.life</a> before the session. The meeting link will be active on the Home screen 5 min before the call. Recheduling of the appointment is allowed only once hence you will not be able reschedule this appointment.<br/>
        //         <br/>
        //         We wish a great session for you.<br/>
        //         <br/>
        //         In case you have any query then reach out to us at <a href="info@ryt.life">info@ryt.life</a><br/>
        //         <br/>
        //         Cheers<br/>
        //         Team RYTLife<br/>

        //         </p><br/>`;
        //         const mailData = 
        //         [
        //             {
        //                 from: 'orders@ryt.life',
        //                 to: `${dataObj.doctorId.emailId}`,
        //                 bcc: ['mohan@trutechlabs.in','prateeksingh16@gmail.com'],
        //                 subject: 'Rescheduling notification',
        //                 html: content1,
        //                 text: 'Your Appointment has been rescheduled!',
        //             },
        //             {
        //             from: 'orders@ryt.life',
        //             to: `${dataObj.userId.emailId}`,
        //             subject: 'Appointment rescheduled',
        //             html: content,
        //             text: 'Your Appointment has been rescheduled!',
        //         }
        // ];
        //         MailHelper.sendgridMail(mailData, (err, data) => {
        //             if (err) {
        //                 console.dir("err");
        //                 console.dir(data);


        //                 next(err, null);


        //             } else {
        //                 console.dir("data");
        //                 console.dir(data);

        //                  next(null, { success: true, data });
        //                 console.log(data);
        //             }
        //         });


        /*
         var msgData = {
             "flow_id": "614c5f6515a3566f8508fe69",
             "sender": "RYTCON",
             "recipients": [{ "mobiles": 91 + `${dataObj.userId.mobileNo}`, "name": `${dataObj.doctorId.name}`, "date and time": `${dataObj.bookedslots.date}` + " " + `${dataObj.bookedslots.slots[0].from}` }]
         }
         MailHelper.sendSMS(msgData, (err, data) => {
             if (err) {
                 console.log("SMS err");
 
                 console.log(data);
                 next(err, null);
             } else {
                 console.log("sms data");
                 console.log(data);
 
                 next(null, { success: true, data });
             }
         })
        
         */

        if (dataObj.userId !== null) {
            MailHelper.readHTMLFile(employee_base_URL + "email-reschedule_employee.html", function (err, data) {
                var template = handlebars.compile(data);
                var replacements = {
                    user_first_name: dataObj.user_first_name,
                    order_id: dataObj.order_id,
                    bookedslots_date: dataObj.bookedslots_date,
                    bookedslots_slots_from: dataObj.bookedslots_from,
                    doctor_name: dataObj.doctor_name
                };
                var htmlToSend = template(replacements);
                MailHelper.readHTMLFile(employee_base_URL + "email-doctorReschedule_employee.html", function (err, data1) {
                    var template1 = handlebars.compile(data1);
                    var htmlToSend1 = template1(replacements);
                    if (err) {
                        console.log(err);
                    } else {
                        var mainOptions = [
                            {
                                from: 'orders@ryt.life',
                                to: `${dataObj.doctor_email_id}`,
                                // cc: ['mohan@trutechlabs.in', 'prateeksingh16@gmail.com'],
                                subject: 'Rescheduling notification',
                                html: htmlToSend1,
                                text: 'Your Appointment has been rescheduled!',
                            },
                            {
                                from: 'orders@ryt.life',
                                to: `${dataObj.employee_email_id}`,
                                subject: 'Appointment Confirmation',
                                html: htmlToSend,
                                text: 'Your Appointment has been rescheduled!',
                            }
                        ];
                        MailHelper.htmlGrid(mainOptions, (err, data) => {
                            if (err) {
                                console.dir("email-template err");
                                console.dir(data);
                                next(err, null);
                            } else {
                                console.dir("data");
                                console.dir(data);
                                next(null, { success: true, data });
                                console.log(data);
                            }
                        })

                    }
                })
            });
        }

    }
};

const appointmentCancelEmail = (dataObj, next) => {
    console.log('inside appointmentCancelEmail');
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.userId.first_name},<br/>
        // <br/>
        // We are sorry to inform that your councellor is unable to make it for the appointment due to some unforeseen circumstances. We request you to reschedule the appointment to the next available slot of your councellor. You would be able to do so after logging into <a href="consult.ryt.life">consult.ryt.life</a><br/>
        // <br/>
        // In case of query, do reach out to us at <a hef="info@ryt.life">info@ryt.life</a><br/>
        // <br/>
        // Regards<br/>
        // Team RYTLife<br/>

        // </p><br/>`;

        // const mailData = {
        //     from: 'orders@ryt.life',
        //     to: `${dataObj.userId.emailId}`,
        //     subject: 'Request for Rescheduling!',
        //     html: content,
        //     text: 'Your Appointment has been cancelled!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);


        //         next(err, null);


        //     } else {
        //         console.dir("data");
        //         console.dir(data);

        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // }); 

        var bookslotTime = dataObj.bookedslots.date + ' ' + dataObj.bookedslots.slots[0].from;
        var msgData = {
            "flow_id": "6151a7cf171d797e3f3591f4",
            "sender": "RYTCON",
            "recipients": [{ "mobiles": 91 + `${dataObj.userId.mobileNo}`, "name": `${dataObj.doctorId.name}`, "date": `${bookslotTime}` }]
        }
        MailHelper.sendSMS(msgData, (err, data) => {
            if (err) {
                console.log("SMS err");

                console.log(data);
                next(err, null);
            } else {
                console.log("sms data");
                console.log(data);

                next(null, { success: true, data });
            }
        })


        if (dataObj.userId !== null) {
            MailHelper.readHTMLFile(base_URL + "email-cancelAppointment.html", function (err, data) {
                var template = handlebars.compile(data);
                var replacements = {
                    user_first_name: dataObj.userId.first_name
                };
                var htmlToSend = template(replacements);
                var mainOptions = {
                    from: 'orders@ryt.life',
                    to: `${dataObj.userId.emailId}`,
                    subject: 'Request for Rescheduling!',
                    html: htmlToSend,
                    text: 'Your Appointment has been cancelled!',
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })
            });
        }

    }
};

const appointmentCancelEmail_employee = (dataObj, next) => {
    console.log('inside appointmentCancelEmail_employee');
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.userId.first_name},<br/>
        // <br/>
        // We are sorry to inform that your councellor is unable to make it for the appointment due to some unforeseen circumstances. We request you to reschedule the appointment to the next available slot of your councellor. You would be able to do so after logging into <a href="consult.ryt.life">consult.ryt.life</a><br/>
        // <br/>
        // In case of query, do reach out to us at <a hef="info@ryt.life">info@ryt.life</a><br/>
        // <br/>
        // Regards<br/>
        // Team RYTLife<br/>

        // </p><br/>`;

        // const mailData = {
        //     from: 'orders@ryt.life',
        //     to: `${dataObj.userId.emailId}`,
        //     subject: 'Request for Rescheduling!',
        //     html: content,
        //     text: 'Your Appointment has been cancelled!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);


        //         next(err, null);


        //     } else {
        //         console.dir("data");
        //         console.dir(data);

        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // }); 

        var bookslotTime = dataObj.bookedslots.date + ' ' + dataObj.bookedslots.slots[0].from;
        var msgData = {
            "flow_id": "6151a7cf171d797e3f3591f4",
            "sender": "RYTCON",
            "recipients": [{ "mobiles": 91 + `${dataObj.employeeId.mobileNo}`, "name": `${dataObj.doctorId.name}`, "date": `${bookslotTime}` }]
        }
        MailHelper.sendSMS(msgData, (err, data) => {
            if (err) {
                console.log("SMS err");

                console.log(data);
                next(err, null);
            } else {
                console.log("sms data");
                console.log(data);

                next(null, { success: true, data });
            }
        })


        if (dataObj.userId !== null) {
            MailHelper.readHTMLFile(employee_base_URL + "email-cancelAppointment_employee.html", function (err, data) {
                var template = handlebars.compile(data);
                var replacements = {
                    user_first_name: dataObj.employeeId.first_name
                };
                var htmlToSend = template(replacements);
                var mainOptions = {
                    from: 'orders@ryt.life',
                    to: `${dataObj.employeeId.emailId}`,
                    subject: 'Request for Rescheduling!',
                    html: htmlToSend,
                    text: 'Your Appointment has been cancelled!',
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })
            });
        }

    }
};

const appointmentCancelEmailDoctor = (dataObj, next) => {
    console.log('inside appointmentCancelEmailDoctor');
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.doctorId.name},<br/>
        // <br/>
        // We have notified your client to reschedule the appointment due to your unavailability for the current appointment.<br/>
        // <br/>
        // Once the client reschedules, we will share the updated appointment details with you.<br/>
        // <br/>
        // In case you have any query then reach out to us at <a href="partner@ryt.life">partner@ryt.life</a><br/>
        // <br/>
        // Cheers<br/>
        // Team RYTLife<br/>

        // </p><br/>`;

        // const mailData = {
        //     from: 'partner@ryt.life',
        //     to: `${dataObj.doctorId.emailId}`,
        //     subject: 'Request for Rescheduling!',
        //     html: content,
        //     text: 'Your Appointment has been cancelled!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);


        //         next(err, null);


        //     } else {
        //         console.dir("data");
        //         console.dir(data);

        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // }); 

        var bookslotTime = dataObj.bookedslots.date + ' ' + dataObj.bookedslots.slots[0].from;
        var msgData = {
            "flow_id": "6151a86a6c327323b84cad39",
            "sender": "RYTCON",
            "recipients": [{ "mobiles": 91 + `${dataObj.userId.mobileNo}`, "name": `${dataObj.doctorId.name}`, "date": `${bookslotTime}` }]
        }
        MailHelper.sendSMS(msgData, (err, data) => {
            if (err) {
                console.log("SMS err");
                console.log(data);
                next(err, null);
            } else {
                console.log("sms data");
                console.log(data);
                next(null, { success: true, data });
            }
        })

        MailHelper.readHTMLFile(base_URL + "email-doctorCancelAppointment.html", function (err, data) {
            var template = handlebars.compile(data);
            var replacements = {
                doctor_name: dataObj.doctorId.name
            };
            var htmlToSend = template(replacements);
            var mainOptions = {
                from: 'partner@ryt.life',
                to: `${dataObj.doctorId.emailId}`,
                subject: 'Request for Rescheduling!',
                html: htmlToSend,
                text: 'Your Appointment has been cancelled!',
            };
            MailHelper.htmlGrid(mainOptions, (err, data) => {
                if (err) {
                    console.dir("email-template err");
                    console.dir(data);
                    next(err, null);
                } else {

                    console.dir("data");
                    console.dir(data);

                    next(null, { success: true, data });
                    console.log(data);
                }
            })
        });

    }
};

const appointmentCancelEmailDoctor_employee = (dataObj, next) => {
    console.log('inside appointmentCancelEmailDoctor_employee');
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.doctorId.name},<br/>
        // <br/>
        // We have notified your client to reschedule the appointment due to your unavailability for the current appointment.<br/>
        // <br/>
        // Once the client reschedules, we will share the updated appointment details with you.<br/>
        // <br/>
        // In case you have any query then reach out to us at <a href="partner@ryt.life">partner@ryt.life</a><br/>
        // <br/>
        // Cheers<br/>
        // Team RYTLife<br/>

        // </p><br/>`;

        // const mailData = {
        //     from: 'partner@ryt.life',
        //     to: `${dataObj.doctorId.emailId}`,
        //     subject: 'Request for Rescheduling!',
        //     html: content,
        //     text: 'Your Appointment has been cancelled!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);


        //         next(err, null);


        //     } else {
        //         console.dir("data");
        //         console.dir(data);

        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // }); 

        var bookslotTime = dataObj.bookedslots.date + ' ' + dataObj.bookedslots.slots[0].from;
        var msgData = {
            "flow_id": "6151a86a6c327323b84cad39",
            "sender": "RYTCON",
            "recipients": [{ "mobiles": 91 + `${dataObj.employeeId.mobileNo}`, "name": `${dataObj.doctorId.name}`, "date": `${bookslotTime}` }]
        }
        MailHelper.sendSMS(msgData, (err, data) => {
            if (err) {
                console.log("SMS err");
                console.log(data);
                next(err, null);
            } else {
                console.log("sms data");
                console.log(data);
                next(null, { success: true, data });
            }
        })

        MailHelper.readHTMLFile(employee_base_URL + "email-doctorCancelAppointment_employee.html", function (err, data) {
            var template = handlebars.compile(data);
            var replacements = {
                doctor_name: dataObj.doctorId.name
            };
            var htmlToSend = template(replacements);
            var mainOptions = {
                from: 'partner@ryt.life',
                to: `${dataObj.doctorId.emailId}`,
                subject: 'Request for Rescheduling!',
                html: htmlToSend,
                text: 'Your Appointment has been cancelled!',
            };
            MailHelper.htmlGrid(mainOptions, (err, data) => {
                if (err) {
                    console.dir("email-template err");
                    console.dir(data);
                    next(err, null);
                } else {

                    console.dir("data");
                    console.dir(data);

                    next(null, { success: true, data });
                    console.log(data);
                }
            })
        });

    }
};

const EventRegistration = (dataObj, next) => {
    console.log("inside event registration mail");
    console.log(dataObj);
    if (dataObj) {
        // let content = `<p>
        // Dear Partners,<br/>
        // <br/>
        // Thank you for showing your interest in working with us as Partners and to bring your expertise closer to the people in need of mental well-being.<br/>
        // <br/>
        // We would like to invite you for a meet and greet session with the founders and the team RytLife. Kindly make note of the below:<br/>
        // <br/>
        // Date: 29 August 2021<br/>
        // Time: 5 pm<br/>
        // Meeting link: to be shared closer to the event
        // <br></br>
        // </br></br></p><p>
        // The tentative agenda of the session is as follows:
        // <br></br>
        // - Welcome and introduction (V Narasimha Reddy, Founder and CEO)     10 min<br></br>
        // - Concept and purpose (Aditi Govitrikar, Brand Ambassador and Product Advisor)       10 min<br></br>
        // - Product Demo (Product team)      20 min<br></br>
        // - QnA       20 min<br></br>
        // <br></br></br></p><p>
        // Kindly block your calendar so that you don't miss the opportunity to meet the team and know the product.</br>
        // </br>
        // </br>
        // </p><p>
        // Regards<br></br>
        // Team RytLife</br>
        // </p></br>`;
        // const mailData = {
        //     from: 'info@ryt.life',
        //     to: `${dataObj[0].userId.emailId}`,
        //     subject: 'Event Registration!',
        //     html: content,
        //     text: 'Your Event has been successfully registered!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);


        //         next(err, null);


        //     } else {
        //         console.dir("data");
        //         console.dir(data);

        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });


        if (dataObj[0].userId !== null) {
            MailHelper.readHTMLFile(base_URL + "eventRegistration.html", function (err, data) {
                var template = handlebars.compile(data);
                var replacements = {
                    doctor_name: dataObj.doctorId.name
                };
                var htmlToSend = template(replacements);
                var mainOptions = {
                    from: 'info@ryt.life',
                    to: `${dataObj[0].userId.emailId}`,
                    subject: 'Event Registration!',
                    html: htmlToSend,
                    text: 'Your Event has been successfully registered!',
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })
            });
        }
    }
}

const missedAppointmentEmail = (dataObj, next) => {
    console.log('inside sendEmaimissedAppointmentEmaillOtp');
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.userId.first_name},<br/>
        // <br/>
        // We noticed that you missed your session with ${dataObj.doctorId.name}.<br/>
        // <br/>
        // Do visit us at <a hef="consult.ryt.life">consult.ryt.life</a> to book a fresh appointment with specialist of your choice.<br/>
        // <br/>
        // You can reach us at <a href="info@ryt.life">info@ryt.life</a> for any assistance.<br/>
        // <br/>
        // Regards,<br/>
        // Team RytLife<br/>

        // </p><br/>`;
        // const mailData = {
        //     from: 'info@ryt.life',
        //     to: `${dataObj.userId.emailId}`,
        //     subject: 'Appointment missed!',
        //     html: content,
        //     text: 'Your Appointment has been missed!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);


        //         next(err, null);


        //     } else {
        //         console.dir("data");
        //         console.dir(data);

        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });

        if (dataObj.userId !== null) {
            MailHelper.readHTMLFile(base_URL + "email-missedAppointment.html", function (err, data) {
                var template = handlebars.compile(data);
                var replacements = {
                    user_first_name: dataObj.userId.first_name,
                    doctor_name: dataObj.doctorId.name
                };
                var htmlToSend = template(replacements);
                var mainOptions = {
                    from: 'info@ryt.life',
                    to: `${dataObj.userId.emailId}`,
                    subject: 'Appointment missed!',
                    html: htmlToSend,
                    text: 'Your Appointment has been missed!',
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })
            });
        }
    }
};

const employeemissedAppointmentEmail = (dataObj, next) => {
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.userId.first_name},<br/>
        // <br/>
        // We noticed that you missed your session with ${dataObj.doctorId.name}.<br/>
        // <br/>
        // Do visit us at <a hef="consult.ryt.life">consult.ryt.life</a> to book a fresh appointment with specialist of your choice.<br/>
        // <br/>
        // You can reach us at <a href="info@ryt.life">info@ryt.life</a> for any assistance.<br/>
        // <br/>
        // Regards,<br/>
        // Team RytLife<br/>

        // </p><br/>`;
        // const mailData = {
        //     from: 'info@ryt.life',
        //     to: `${dataObj.userId.emailId}`,
        //     subject: 'Appointment missed!',
        //     html: content,
        //     text: 'Your Appointment has been missed!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);


        //         next(err, null);


        //     } else {
        //         console.dir("data");
        //         console.dir(data);

        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });

        if (dataObj.userId !== null) {
            MailHelper.readHTMLFile(employee_base_URL + "email-missedAppointment_employee.html", function (err, data) {
                var template = handlebars.compile(data);
                var replacements = {
                    user_first_name: dataObj.employeeId.first_name,
                    doctor_name: dataObj.doctorId.name
                };
                var htmlToSend = template(replacements);
                var mainOptions = {
                    from: 'info@ryt.life',
                    to: `${dataObj.employeeId.emailId}`,
                    subject: 'Appointment missed!',
                    html: htmlToSend,
                    text: 'Your Appointment has been missed!',
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })
            });
        }
    }
};

const missedAppointmentEmailDoctor = (dataObj, next) => {
    console.log('inside sendEmaimissedAppointmentdoctor');
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.userId.first_name},<br/>
        // <br/>
        // Unfortunately ${dataObj.doctorId.name} missed your session due to some unavoidable circumstances. 
        // <br/>
        // You can reschedule the appointment after logging into <a href="consult.ryt.life">consult.ryt.life</a>
        // <br/>
        // You can reach us at <a href="info@ryt.life">info@ryt.life</a> for any assistance.
        // <br/>
        // Regards,<br/>
        // Team RytLife<br/>

        // </p><br/>`;
        // const mailData = {
        //     from: 'info@ryt.life',
        //     to: `${dataObj.userId.emailId}`,
        //     subject: 'Appointment missed!',
        //     html: content,
        //     text: 'Your Appointment has been missed!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);


        //         next(err, null);


        //     } else {
        //         console.dir("data");
        //         console.dir(data);

        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });


        if (dataObj.userId !== null) {
            MailHelper.readHTMLFile(base_URL + "email-missedAppointmentDoctor.html", function (err, data) {
                var template = handlebars.compile(data);
                var replacements = {
                    user_first_name: dataObj.userId.first_name,
                    doctor_name: dataObj.doctorId.name
                };
                var htmlToSend = template(replacements);
                var mainOptions = {
                    from: 'info@ryt.life',
                    to: `${dataObj.userId.emailId}`,
                    subject: 'Appointment missed!',
                    html: htmlToSend,
                    text: 'Your Appointment has been missed!',
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })
            });
        }
    }
};


const employeemissedAppointmentEmailDoctor = (dataObj, next) => {
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.userId.first_name},<br/>
        // <br/>
        // Unfortunately ${dataObj.doctorId.name} missed your session due to some unavoidable circumstances. 
        // <br/>
        // You can reschedule the appointment after logging into <a href="consult.ryt.life">consult.ryt.life</a>
        // <br/>
        // You can reach us at <a href="info@ryt.life">info@ryt.life</a> for any assistance.
        // <br/>
        // Regards,<br/>
        // Team RytLife<br/>

        // </p><br/>`;
        // const mailData = {
        //     from: 'info@ryt.life',
        //     to: `${dataObj.userId.emailId}`,
        //     subject: 'Appointment missed!',
        //     html: content,
        //     text: 'Your Appointment has been missed!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);


        //         next(err, null);


        //     } else {
        //         console.dir("data");
        //         console.dir(data);

        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });


        if (dataObj.userId !== null) {
            MailHelper.readHTMLFile(employee_base_URL + "email-missedAppointmentDoctor_employee.html", function (err, data) {
                var template = handlebars.compile(data);
                var replacements = {
                    user_first_name: dataObj.employeeId.first_name,
                    doctor_name: dataObj.doctorId.name
                };
                var htmlToSend = template(replacements);
                var mainOptions = {
                    from: 'info@ryt.life',
                    to: `${dataObj.employeeId.emailId}`,
                    subject: 'Appointment missed!',
                    html: htmlToSend,
                    text: 'Your Appointment has been missed!',
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })
            });
        }
    }
};

const feedbackEmail = (dataObj, next) => {
    console.log('inside feedbackEmail');
    console.log(dataObj);
    if (dataObj) {

        // let content =`<p>
        // Dear ${dataObj.userId.first_name},<br/>
        // <br/>
        // We hope you had a fruitful session with ${dataObj.doctorId.name}. Do visit our website for a follow up session.<br/>
        // <br/>
        // We are working round the clock to make it easier for you to connect with a professional of choice and would love to hear back from you on how can we make it better.<br/>
        // <br/>
        // You can reply to this email with your feedback.<br/>
        // <br/>
        // Cheers<br/>
        // Team RytLife<br/>

        // </p><br/>`;

        // const mailData = {
        //     from: 'info@ryt.life',
        //     to: `${dataObj.userId.emailId}`,
        //     subject: 'How did it go?',
        //     html: content,
        //     text: 'Feedback',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);


        //         next(err, null);


        //     } else {
        //         console.dir("data");
        //         console.dir(data);

        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });   



        if (dataObj.userId !== null) {
            MailHelper.readHTMLFile(base_URL + "feedbackMail.html", function (err, data) {
                var template = handlebars.compile(data);
                var replacements = {
                    first_name: dataObj.userId.first_name,
                    doctor_name: dataObj.doctorId.name
                };
                var htmlToSend = template(replacements);
                var mainOptions = {
                    from: 'info@ryt.life',
                    to: `${dataObj.userId.emailId}`,
                    subject: 'How did it go?',
                    html: htmlToSend,
                    text: 'Feedback',
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })
            });
        }


    }
};

//email
const sendForgotEmail = (dataObj, next) => {
    console.log('inside sendforgetEmail');
    console.log(dataObj);
    if (dataObj) {
        //// staging link
        //// const forgotemailLink = `https://rytlife-ebca0--staging-8ssp9kn2.web.app/resetPassword?email=${dataObj.emailId}`;
        // prod link
        const forgotemailLink = `https://consult.ryt.life/resetPassword?email=${dataObj.emailId}`;

        console.log(forgotemailLink);
        let content = `<p>Hello!</p><br/>`
        content = content + `<p>Welcome to RytLife Click here <a href= '` + `${forgotemailLink}` + `'>to change your password</a></p><br/>`;
        const mailData = {
            from: 'no-reply@ryt.life',
            to: `${dataObj.emailId}`,
            subject: 'Reset password',
            html: content,
            text: 'click the link to reset password',
        };
        MailHelper.sendgridMail(mailData, (err, data) => {
            if (err) {
                console.dir("err");
                console.dir(data);


                next(err, null);


            } else {
                console.dir("data");
                console.dir(data);

                next(null, { success: true, data });
                console.log(data);
            }
        });



        // MailHelper.readHTMLFile(base_URL+"forgotPasswordMail.html", function (err, data) {
        //     var template = handlebars.compile(data);
        //     var source = `https://rytlife-ebca0--staging-8ssp9kn2.web.app/resetPassword?email=${dataObj.emailId}`
        //     var replacements = {
        //         imageSource: source
        //     };
        //     var htmlToSend = template(replacements);
        //     var mainOptions = {
        //         from: 'no-reply@ryt.life',
        //         to: `${dataObj.emailId}`,
        //         subject: 'Reset password',
        //         html: htmlToSend,
        //         text: 'click the link to reset password',
        //     };
        //     MailHelper.htmlGrid(mainOptions, (err, data) => {
        //         if (err) {
        //             console.dir("email-template err");
        //             console.dir(data);
        //             next(err, null);
        //         } else {

        //             console.dir("data");
        //             console.dir(data);

        //              next(null, { success: true, data });
        //             console.log(data);
        //         }
        //     })
        // });


    }
};

const sendForgotEmailDoctor = (dataObj, next) => {
    console.log('inside sendForgotEmailDoctor');
    console.log(dataObj);
    if (dataObj) {
        // staging link
        const forgotemailLink = `https://ryt-life-partner--staging-3rpyvyue.web.app/resetPassword?email=${dataObj.emailId}`;
        // prod link
        // const forgotemailLink = `https://partner.ryt.life/resetPassword?email=${dataObj.emailId}`;

        console.log(forgotemailLink);
        let content = `<p>Hello!</p><br/>`
        content = content + `<p>Welcome to RytLife Click here <a href= '` + forgotemailLink + `'>to change your password</a></p><br/>`;
        const mailData = {
            from: 'no-reply@ryt.life',
            to: `${dataObj.emailId}`,
            subject: 'Reset password',
            html: content,
            text: 'click the link to reset password',
        };
        MailHelper.sendgridMail(mailData, (err, data) => {
            if (err) {
                console.dir("err");
                console.dir(data);


                next(err, null);


            } else {
                console.dir("data");
                console.dir(data);

                next(null, { success: true, data });
                console.log(data);
            }
        });



        // MailHelper.readHTMLFile(base_URL+"forgotEmailDoctor.html", function (err, data) {
        //     var template = handlebars.compile(data);
        //     var source = `https://ryt-life-partner--staging-3rpyvyue.web.app/resetPassword?email=${dataObj.emailId}`
        //     var replacements = {
        //         imageSource: source
        //     };
        //     var htmlToSend = template(replacements);
        //     var mainOptions = {
        //         from: 'no-reply@ryt.life',
        //         to: `${dataObj.emailId}`,
        //         subject: 'Reset password',
        //         html: htmlToSend,
        //         text: 'click the link to reset password',
        //     };
        //     MailHelper.htmlGrid(mainOptions, (err, data) => {
        //         if (err) {
        //             console.dir("email-template err");
        //             console.dir(data);
        //             next(err, null);
        //         } else {

        //             console.dir("data");
        //             console.dir(data);

        //              next(null, { success: true, data });
        //             console.log(data);
        //         }
        //     })
        // });

    }
};

const doctorPswResetEmail = (dataObj, next) => {
    console.log('inside resetConfirmationEmail');
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.name},<br/>
        // <br/>
        // You password has been reset. If you have not requested for the same then please write to us at <a href="info.ryt.life">info.ryt.life</a><br/>
        // <br/>
        // Cheers<br/>
        // Team RYTLife<br/>

        // </p><br/>`;
        // const mailData = {
        //     from: 'no-reply@ryt.life',
        //     to: `${dataObj.emailId}`,
        //     subject: 'Password reset confirmation',
        //     html: content,
        //     text: 'Your Password has been successfully reset!',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);


        //         next(err, null);


        //     } else {
        //         console.dir("data");
        //         console.dir(data);

        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // }); 

        MailHelper.readHTMLFile(base_URL + "doctorPasswordReset.html", function (err, data) {
            var template = handlebars.compile(data);
            var replacements = {
                name: dataObj.name
            };
            var htmlToSend = template(replacements);
            var mainOptions = {
                from: 'no-reply@ryt.life',
                to: `${dataObj.emailId}`,
                subject: 'Password reset confirmation',
                html: htmlToSend,
                text: 'Your Password has been successfully reset!',
            };
            MailHelper.htmlGrid(mainOptions, (err, data) => {
                if (err) {
                    console.dir("email-template err");
                    console.dir(data);
                    next(err, null);
                } else {

                    console.dir("data");
                    console.dir(data);

                    next(null, { success: true, data });
                    console.log(data);
                }
            })
        });

    }
};

const sendAdminForgotEmail = (dataObj, next) => {
    console.log('inside sendforgetEmail');
    console.log(dataObj);
    if (dataObj) {
        const forgotemailLink = `https://rytlife-admin--staging-6q0wmpb6.web.app/${dataObj.emailId}`;

        console.log(forgotemailLink);
        let content = `<p>Hello!</p><br/>`
        content = content + `<p>Welcome to RytLife Click here <a href= '` + forgotemailLink + `'>to change your password</a></p><br/>`;
        const mailData = {
            from: 'no-reply@ryt.life',
            to: `${dataObj.emailId}`,
            subject: 'Reset password',
            html: content,
            text: 'click the link to reset password',
        };
        MailHelper.sendgridMail(mailData, (err, data) => {
            if (err) {
                console.dir("err");
                console.dir(data);


                next(err, null);


            } else {
                console.dir("data");
                console.dir(data);

                next(null, { success: true, data });
                console.log(data);
            }
        });


        // MailHelper.readHTMLFile(base_URL+"forgotPasswordAdmin.html", function (err, data) {
        //     var template = handlebars.compile(data);
        //     var source = `https://rytlife-admin--staging-6q0wmpb6.web.app/${dataObj.emailId}`;
        //     var replacements = {
        //         imageSource: source
        //     };
        //     var htmlToSend = template(replacements);
        //     var mainOptions = {
        //         from: 'no-reply@ryt.life',
        //         to: `${dataObj.emailId}`,
        //         subject: 'Reset password',
        //         html: htmlToSend,
        //         text: 'click the link to reset password',
        //     };
        //     MailHelper.htmlGrid(mainOptions, (err, data) => {
        //         if (err) {
        //             console.dir("email-template err");
        //             console.dir(data);
        //             next(err, null);
        //         } else {

        //             console.dir("data");
        //             console.dir(data);

        //              next(null, { success: true, data });
        //             console.log(data);
        //         }
        //     })
        // });


    }
};

const userRemainderEmail = (dataObj, next) => {
    console.log('inside sendEmaimissedAppointmentEmaillOtp');
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.userId.first_name},<br/>
        // <br/>
        // Your session is going to shortly begin at  ${dataObj.bookedslots.slots[0].from}. The link to join the call gets activated 5 mins before the session begins.<br/>
        // <br/>
        // Cheers <br/>
        // Team RYTLife<br/>
        // </p><br/>`;
        // const mailData = {
        //     from: 'info@ryt.life',
        //     to: `${dataObj.userId.emailId}`,
        //     subject: 'Get ready for your session',
        //     html: content,
        //     text: 'Get ready for your session',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);


        //         next(err, null);


        //     } else {
        //         console.dir("data");
        //         console.dir(data);

        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });

        if (dataObj.userId !== null) {
            MailHelper.readHTMLFile(base_URL + "email-remainder.html", function (err, data) {
                var template = handlebars.compile(data);
                var replacements = {
                    user_first_name: dataObj.userId.first_name,
                    bookedslots_slots_from: dataObj.bookedslots.slots[0].from
                };
                var htmlToSend = template(replacements);
                var mainOptions = {
                    from: 'info@ryt.life',
                    to: `${dataObj.userId.emailId}`,
                    subject: 'Get ready for your session',
                    html: htmlToSend,
                    text: 'Get ready for your session',
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })
            });
        }
    }
};

const doctorRemainderEmail = (dataObj, next) => {
    console.log('inside sendEmaimissedAppointmentEmaillOtp');
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.doctorId.name},<br/>
        // <br/>
        // Your session is going to shortly begin at ${dataObj.bookedslots.slots[0].from}. The link to join the call gets activated 5 mins before the session begins.<br/>
        // <br/>
        // Cheers<br/>
        // Team RYTLife<br/>

        // </p><br/>`;
        // const mailData = {
        //     from: 'partner@ryt.life',
        //     to: `${dataObj.doctorId.emailId}`,
        //     subject: 'Appointment reminder',
        //     html: content,
        //     text: 'Appointment reminder',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);


        //         next(err, null);


        //     } else {
        //         console.dir("data");
        //         console.dir(data);

        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });
        var bookslotTime = dataObj.bookedslots.slots[0].from;
        var msgData = {
            "flow_id": "63c90f07543fcf16580ff463",
            "sender": "RYTCON",
            "recipients": [{ "mobiles": 91 + `${dataObj.doctorId.mobileNo}`, "name": `${dataObj.userId.first_name}`, "date": `${bookslotTime}` }]
        }
        
        MailHelper.sendSMS(msgData, (err, data) => {///////TODO:: send notification on mobile for doctore  -------->
            if (err) {
                console.log("SMS err");

                console.log(data);
                next(err, null);
            } else {
                console.log("sms data");
                console.log(data);

                next(null, { success: true, data });
            }
        })
        /////// TODO:: uncomment this changes and deploy to production 

        MailHelper.readHTMLFile(base_URL + "email-doctorRemainder.html", function (err, data) {
            var template = handlebars.compile(data);
            var replacements = {
                doctor_name: dataObj.doctorId.name,
                bookedslots_slots_from: dataObj.bookedslots.slots[0].from
            };
            var htmlToSend = template(replacements);
            var mainOptions = {
                from: 'partner@ryt.life',
                to: `${dataObj.doctorId.emailId}`,
                subject: 'Appointment reminder',
                html: htmlToSend,
                text: 'Appointment reminder',
            };
            MailHelper.htmlGrid(mainOptions, (err, data) => {
                if (err) {
                    console.dir("email-template err");
                    console.dir(data);
                    next(err, null);
                } else {

                    console.dir("data");
                    console.dir(data);

                    next(null, { success: true, data });
                    console.log(data);
                }
            })
        });
    }
};

const userRemainderEmail_employee = (dataObj, next) => {
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.userId.first_name},<br/>
        // <br/>
        // Your session is going to shortly begin at  ${dataObj.bookedslots.slots[0].from}. The link to join the call gets activated 5 mins before the session begins.<br/>
        // <br/>
        // Cheers <br/>
        // Team RYTLife<br/>
        // </p><br/>`;
        // const mailData = {
        //     from: 'info@ryt.life',
        //     to: `${dataObj.userId.emailId}`,
        //     subject: 'Get ready for your session',
        //     html: content,
        //     text: 'Get ready for your session',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);


        //         next(err, null);


        //     } else {
        //         console.dir("data");
        //         console.dir(data);

        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });

        if (dataObj.employeeId !== null) {
            MailHelper.readHTMLFile(employee_base_URL + "email-remainder_employee.html", function (err, data) {
                var template = handlebars.compile(data);
                var replacements = {
                    user_first_name: dataObj.employeeId.first_name,
                    bookedslots_slots_from: dataObj.bookedslots.slots[0].from
                };
                var htmlToSend = template(replacements);
                var mainOptions = {
                    from: 'info@ryt.life',
                    to: `${dataObj.employeeId.emailId}`,
                    subject: 'Get ready for your session',
                    html: htmlToSend,
                    text: 'Get ready for your session',
                };
                MailHelper.htmlGrid(mainOptions, (err, data) => {
                    if (err) {
                        console.dir("email-template err");
                        console.dir(data);
                        next(err, null);
                    } else {

                        console.dir("data");
                        console.dir(data);

                        next(null, { success: true, data });
                        console.log(data);
                    }
                })
            });
        }
    }
};

const doctorRemainderEmail_employee = (dataObj, next) => {
    console.log(dataObj);
    if (dataObj) {

        // let content = `<p>
        // Dear ${dataObj.doctorId.name},<br/>
        // <br/>
        // Your session is going to shortly begin at ${dataObj.bookedslots.slots[0].from}. The link to join the call gets activated 5 mins before the session begins.<br/>
        // <br/>
        // Cheers<br/>
        // Team RYTLife<br/>

        // </p><br/>`;
        // const mailData = {
        //     from: 'partner@ryt.life',
        //     to: `${dataObj.doctorId.emailId}`,
        //     subject: 'Appointment reminder',
        //     html: content,
        //     text: 'Appointment reminder',
        // };
        // MailHelper.sendgridMail(mailData, (err, data) => {
        //     if (err) {
        //         console.dir("err");
        //         console.dir(data);


        //         next(err, null);


        //     } else {
        //         console.dir("data");
        //         console.dir(data);

        //          next(null, { success: true, data });
        //         console.log(data);
        //     }
        // });

        MailHelper.readHTMLFile(employee_base_URL + "email-doctorRemainder_employee.html", function (err, data) {
            var template = handlebars.compile(data);
            var replacements = {
                doctor_name: dataObj.doctorId.name,
                bookedslots_slots_from: dataObj.bookedslots.slots[0].from
            };
            var htmlToSend = template(replacements);
            var mainOptions = {
                from: 'partner@ryt.life',
                to: `${dataObj.doctorId.emailId}`,
                subject: 'Appointment reminder',
                html: htmlToSend,
                text: 'Appointment reminder',
            };
            MailHelper.htmlGrid(mainOptions, (err, data) => {
                if (err) {
                    console.dir("email-template err");
                    console.dir(data);
                    next(err, null);
                } else {

                    console.dir("data");
                    console.dir(data);

                    next(null, { success: true, data });
                    console.log(data);
                }
            })
        });
    }
};



module.exports = {
    sendForgotEmail: sendForgotEmail,
    sendForgotEmailDoctor: sendForgotEmailDoctor,
    bookingSuccessEmail: bookingSuccessEmail,
    bookingUnsuccessEmail: bookingUnsuccessEmail,
    signupConfirmationEmail: signupConfirmationEmail,
    welcomeConfirmationEmail: welcomeConfirmationEmail,
    resetConfirmationEmail: resetConfirmationEmail,
    appointmentCancelEmail: appointmentCancelEmail,
    appointmentCancelEmailDoctor: appointmentCancelEmailDoctor,
    rescheduleAppointmentEmail: rescheduleAppointmentEmail,
    paymentSuccessEmail: paymentSuccessEmail,
    paymentUnsuccessEmail: paymentUnsuccessEmail,
    feedbackEmail: feedbackEmail,
    sendEmailOtp: sendEmailOtp,
    sendEmailOtpDoctor: sendEmailOtpDoctor,
    sendAdminForgotEmail: sendAdminForgotEmail,
    missedAppointmentEmail: missedAppointmentEmail,
    employeemissedAppointmentEmail: employeemissedAppointmentEmail,
    missedAppointmentEmailDoctor: missedAppointmentEmailDoctor,
    employeemissedAppointmentEmailDoctor: employeemissedAppointmentEmailDoctor,
    doctorsignupConfirmationEmail: doctorsignupConfirmationEmail,
    doctorwelcomeConfirmationEmail: doctorwelcomeConfirmationEmail,
    doctorPswResetEmail: doctorPswResetEmail,
    userRemainderEmail: userRemainderEmail,
    doctorRemainderEmail: doctorRemainderEmail,
    userRemainderEmail_employee: userRemainderEmail_employee,
    doctorRemainderEmail_employee: doctorRemainderEmail_employee,
    EventRegistration: EventRegistration,
    employeebookingConfirmationEmail: employeebookingConfirmationEmail,
    doctorbookingConfirmationEmail: doctorbookingConfirmationEmail,
    employeebookingUnsuccessEmail: employeebookingUnsuccessEmail,
    employeerescheduleAppointmentEmail: employeerescheduleAppointmentEmail,
    appointmentCancelEmail_employee: appointmentCancelEmail_employee,
    appointmentCancelEmailDoctor_employee: appointmentCancelEmailDoctor_employee
}
