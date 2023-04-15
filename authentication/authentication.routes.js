const express = require("express");
const router = express.Router();
const AuthCtrl = require("./authentication.controller");
const doctorModel = require("../projects/models/doctors.model");
const axios = require("axios");
const doctorController = require("../doctor/doctor.controller");
const appointmentController = require("../appointment/appointment.controller");
const adminController = require('../admin/admin.controller');
const Model = require("../projects/models/doctors.model").doctorModel;
const EmailTemplate = require('../projects/model_helpers/email_template');
const employeeCtrl = require('../company_employee/employee.controller');
const companyCtrl = require("../company/company.controller");

const resp = require("../../helpers/responseHelpers");
module.exports = router;
const UserCtrl = require("../user/user.controller");
const DoctorCtrl = require("../doctor/doctor.controller");
const jwt = require("jsonwebtoken");
const SECRET = process.env.SECRET;
//const AWS = require("../../helpers/aws-S3");
//const aws = require("aws-sdk");
const moment = require("moment");
const client = require("twilio")(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);
const crypto = require("crypto");

// User

router.post("/userSignup", (req, res) => {
  console.log("inside user signup");
  console.log(req.body);
  if (req.body && req.body.newUser) {
    console.log("inside if");
    req.body.newUser["role"] = "User";
    req.body.newUser["iniReg"] = "Native";
    const email = req.body.newUser.emailId;
    req.body.newUser["user_name"] =
      email.substring(0, email.indexOf("@")) +
      "_" +
      email.substring(email.indexOf("@") + 1, email.indexOf(".")) +
      "_" +
      email.substring(email.indexOf(".") + 1, email.length);
    // delete req.body.newUser["confirmPassword"];
    console.log("reqbody", req.body.newUser);
    let user_data = AuthCtrl.capitaliseFirstLetter(req.body.newUser);
    console.log("user_data", user_data);
    // user_data.origin = req.headers.origin;
    // user_data.projectemployersetup = { setupcompleted: false };
    AuthCtrl.signUpUser(user_data, (err, docs) => {
      if (err) {
        if (err.name && err.name === "ValidationError") {
          resp.errorResponse(res, "Required Fields Are Missing");
        } else if (err.code && err.code === 11000) {
          resp.alreadyRegistered(res, "Email or Phone Already Registered");
        } else {
          resp.errorResponse(res, "Internal Server Error");
        }
      } else if (docs) {
        console.log("inside signup docs", docs);
        console.log("============signupemail===========");
        AuthCtrl.signupConfirmationEmail(docs, function (err, data) {
          if (err) {
            console.log("sendgrid err", err);
          } else if (data) {
            console.log("sendgrid data 56", data);
          } else {
            console.log("sendgrid else");
          }
        });
        console.log("============loginemail===========");
        AuthCtrl.loginConfirmationEmail(docs, function (err, data) {
          if (err) {
            console.log("sendgrid err", err);
          } else if (data) {
            console.log("sendgrid data 61", data);
          } else {
            console.log("sendgrid else");
          }
        });
        resp.successPostResponse(res, docs, "Successfully Signed Up New User");
      } else {
        resp.noRecordsFound(res, "Can't Add New User");
      }
    });
  } else {
    resp.missingBody(res, "Missing Body");
  }
});

router.post("/login", (req, res) => {
  console.log("inside login11");
  console.log(req.headers);
  console.log(req.headers.authorization);
  if (req.headers && req.headers.authorization) {
    headers = req.get("authorization");
    headers = headers.split(" ");
    const mode_of_reg = "Native";
    AuthCtrl.userLogin(headers[1], mode_of_reg, (err, docs) => {
      if (err) {
        console.log("inside if route");
        console.log(err);
        if (err.name && err.name === "wrong mode of login") {
          resp.alreadyRegisteredWithGoogle(
            res,
            "Email logged in through google please login through Google!"
          );
        } else if (err.name === "Invalid email") {
          resp.alreadyRegisteredWithGoogle(res, "Email/Phone not registered");
        } else {
          resp.errorResponse(res);
        }
      } else if (docs) {
        console.log("Authenticated docs", docs);
        let authUser = {
          token: docs.token,
          role: docs.role,
        };
        resp.successPostResponse(res, authUser, "Authenticated");
      } else {
        resp.noRecordsFound(res, "Invalid Email-ID/Password");
      }
    });
  } else {
    resp.missingBody(res, "Missing Email-ID/Password");
  }
});

router.post("/otplogin", (req, res) => {
  console.log("inside otp login", req.body);
  if (req.body) {
    const mode_of_reg = "Native";
    AuthCtrl.userOtpLogin(req.body, mode_of_reg, (err, docs) => {
      if (err) {
        console.log("inside if route");
        console.log(err);
        if (err.name && err.name === "wrong mode of login") {
          resp.alreadyRegisteredWithGoogle(
            res,
            "Email logged in through google please login through Google!"
          );
        } else if (err.name === "Invalid email") {
          resp.alreadyRegisteredWithGoogle(res, "Email/Phone not registered");
        } else {
          resp.errorResponse(res);
        }
      } else if (docs) {
        resp.successPostResponse(res, docs, "Authenticated");
      } else {
        resp.noRecordsFound(res, "Invalid Email-ID/Password");
      }
    });
  } else {
    resp.missingBody(res, "Missing Email-ID/Password");
  }
});

router.post("/emailverification", function (req, res) {
  if (req.user) {
    AuthCtrl.verifyEmail(
      req.query.emailId,
      req.body.emailIdVerified,
      function (err, docs) {
        if (err) {
          resp.errorResponse(res);
        } else if (docs) {
          resp.successPostResponse(res, "Email Id successfully verified");
        } else {
          resp.noRecordsFound(res, "No Email Id  Found");
        }
      }
    );
  } else {
    resp.missingBody(res, "Missing Body");
  }
});

router.get("/verify/:token", function (req, res, next) {
  try {
    let user = jwt.verify(req.params.token, SECRET);
    AuthCtrl.verifyEmail(user._id, true, function (err, docs) {
      if (err) {
        resp.errorResponse(res);
      } else if (docs) {
        resp.successPostResponse(res, docs);
      } else {
        resp.noRecordsFound(res, "Invalid Token");
      }
    });
  } catch (err) {
    res.json(err.name);
  }
});

router.put("/forgotpsw", function (req, res) {
  console.log("inside forgot pass");
  console.log(req.body.emailId);
  if (req.body.emailId) {
    UserCtrl.findUserEmailPhone(req.body, (err, user) => {
      console.log("inside user", req.body.emailId);
      if (err) {
        resp.errorResponse(res, err, 501, "Error While Fetching User");
      } else if (user) {
        AuthCtrl.forgotpsw(req.body.emailId, function (err, docs) {
          console.log("after inside user", req.body.emailId)
          if (err) {
            resp.errorResponse(
              res,
              err,
              501,
              "Internal Server Error, Please Try Again Later"
            );
          } else if (docs) {
            console.log("success");
            resp.successPostResponse(
              res,
              null,
              `Password Reset Link Has Been Sent To Your Email Id ${req.body.emailId}`
            );
          } else {
            resp.noRecordsFound(res, "Invalid Email Id");
          }
        });
      } else {
        if (req.body.mobileNo) {
          resp.noRecordsFound(res, "Mobile No. not registered");
        } else if (req.body.emailId) {
          resp.noRecordsFound(res, "Email id not registered");
        }
      }
    });
  } else {
    resp.missingBody(res, "Missing Body");
  }
});

router.put("/updatePassword", (req, res) => {
  console.log("inside update password");
  console.log("email", req.body.emailId);
  console.log("password", req.body.newPassword);
  if (req.body.emailId && req.body.newPassword) {
    UserCtrl.resetpsw(
      req.body.emailId,
      req.body.newPassword,
      function (err, docs) {
        if (err) {
          resp.errorResponse(
            res,
            err,
            501,
            "Internal Server Error, Please Try Again Later"
          );
        } else if (docs) {
          console.log("updated pass docs", docs);
          AuthCtrl.passwordResetConfirmationEmail(docs, function (err, docs) {
            if (err) {
              console.log("sendgrid err", err);
              //resp.errorResponse(res,err,501,"Internal Server Error, Please Try Again Later");
            } else if (docs) {
              console.log("sendgrid docs", docs);
              //resp.successPostResponse(res,null,`Password Reset Link Has Been Sent To Your Email Id ${req.body.emailId}`);
            } else {
              console.log("sendgrid else");
              //resp.noRecordsFound(res, "Invalid Email Id");
            }
          });
          resp.successPostResponse(
            res,
            null,
            `Password Has Been Updated Successfully`
          );
        } else {
          resp.noRecordsFound(res, "Invalid Email Id");
        }
      }
    );
  } else {
    resp.missingBody(res, "Missing Body");
  }
});

router.put("/forgotpassword", function (req, res) {
  if (req.body.emailId && req.body.newPassword) {
    UserCtrl.resetpsw(
      req.body.emailId,
      req.body.newPassword,
      function (err, docs) {
        if (err) {
          resp.errorResponse(
            res,
            err,
            501,
            "Internal Server Error, Please Try Again Later"
          );
        } else if (docs) {
          resp.successPostResponse(
            res,
            null,
            `Password Has Been Updated Successfully`
          );
        } else {
          resp.noRecordsFound(res, "Invalid Email Id");
        }
      }
    );
  } else {
    resp.missingBody(res, "Missing Body");
  }
});

router.post("/verifyEmailPhone", (req, res) => {
  console.log("inside verifyEmailPhone");
  console.log("reqbody", req.body);
  if (req.body) {
    UserCtrl.findUserEmailPhone(req.body, (err, user) => {
      if (err) {
        resp.errorResponse(res, err, 501, "Error While Fetching User");
      } else if (user) {
        let data = [];
        user.forEach((e) => {
          if (req.body.mobileNo) {
            data.push({ mobileNo: e["mobileNo"] });
          } else if (req.body.emailId) {
            data.push({ emailId: e["emailId"] });
          }
        });
        resp.successPostResponse(res, data, null);
      } else {
        if (req.body.mobileNo) {
          resp.noRecordsFound(res, "Mobile No. not registered");
        } else if (req.body.emailId) {
          resp.noRecordsFound(res, "Email id not registered");
        }
      }
    });
  } else {
    resp.missingBody(res, "Missing/Invalid Body Parameters");
  }
});

router.get("/get-user-details", (req, res) => {
  if (req.query) {
    UserCtrl.findUser(req.query, (err, user) => {
      if (err) {
        resp.errorResponse(res, err, 501, "Error While Fetching User");
      } else if (user) {
        resp.successGetResponse(res, user, "User details");
      } else {
        resp.noRecordsFound(res, "Unable to Fetch user");
      }
    });
  } else {
    resp.missingBody(res, "Missing/Invalid Body Parameters");
  }
});


router.post("/emailOtp", (req, res) => {
  console.log("inside emailOtp 386");
  if (req.body.emailId) {
    if (req.body["login_type"] === 'employee') {
      console.log('im here ==>2');
      employeeCtrl.findEmployeeDomain(req.body, (err, user) => {
        if (err) {
          resp.errorResponse(res, err, 501, "Error While Fetching User");
        } else if (user) {
          console.log("inside emailOtp 395", user);
          console.log(req.body.emailId);
          const emailId = req.body.emailId;
          const otp = Math.floor(100000 + Math.random() * 900000);
          const ttl = 5 * 60 * 1000;
          const expires = Date.now() + ttl;
          console.log("expires", expires);
          const data = `${emailId}.${otp}.${expires}`;
          const smsKey = "13893kjefbekbkb";
          const hash = crypto
            .createHmac("sha256", smsKey)
            .update(data)
            .digest("hex");
          const fullhash = `${hash}.${expires}`;

          console.log("OTP//////////////////////////////////\n", otp);

          AuthCtrl.sendEmailOtp(
            { emailId, otp },
            function (err, docs) {
              if (err) {
                resp.errorResponse(
                  res,
                  err,
                  501,
                  "Internal Server Error, Please Try Again Later"
                );
              } else if (docs) {
                resp.successPostResponse(
                  res,
                  { emailId, hash: fullhash, companyId: user[0]._id },
                  `Otp Has Been Sent To Your Email Id ${req.body.emailId}`
                );
              } else {
                resp.noRecordsFound(res, "Invalid Email Id");
              }
            }
          );
        } else {
          // check for user emails
          console.log("check for user emails");
          companyCtrl.getAllCompanies((err, docs) => {
            if (err) {
              resp.errorResponse(res, err, 501, 'Error While getting doctor');
            } else if (docs) {
              var personal_email_arr = [];
              var personal_email_flag = true;
              var company_id = '';
              docs.profile.forEach((element, index) => {
                if (personal_email_flag == true) {
                  element.personalEmails.forEach((personalemailelement, index1) => {
                    if (personalemailelement.email === req.body.emailId) {
                      console.log("/////////////////id", element.id);
                      company_id = element.id;
                      console.log("\\\\\\\\\\\\\\\\email", personalemailelement.email);
                      personal_email_arr.push(personalemailelement.email);
                      personal_email_flag = false;
                    }
                    // person_email_json = {
                    //   "emailId":personalemailelement.email,
                    //   "_id" : element.id
                    // }
                    // personal_email_arr.push(person_email_json);
                  })
                }
              })

              if (personal_email_arr.includes(req.body.emailId) == false) {
                console.log("not there");
                resp.noRecordsFound(res, "Email id not registered");
              } else {
                console.log("there", company_id);
                const emailId = req.body.emailId;
                const otp = Math.floor(100000 + Math.random() * 900000);
                const ttl = 5 * 60 * 1000;
                const expires = Date.now() + ttl;
                console.log("expires", expires);
                const data = `${emailId}.${otp}.${expires}`;
                const smsKey = "13893kjefbekbkb";
                const hash = crypto
                  .createHmac("sha256", smsKey)
                  .update(data)
                  .digest("hex");
                const fullhash = `${hash}.${expires}`;

                console.log("OTP//////////////////////////////////\n", otp);

                AuthCtrl.sendEmailOtp(
                  { emailId, otp },
                  function (err, otp_docs) {
                    if (err) {
                      resp.errorResponse(
                        res,
                        err,
                        501,
                        "Internal Server Error, Please Try Again Later"
                      );
                    } else if (otp_docs) {
                      resp.successPostResponse(
                        res,
                        { emailId, hash: fullhash, companyId: company_id },
                        `Otp Has Been Sent To Your Email Id ${req.body.emailId}`
                      );
                    } else {
                      resp.noRecordsFound(res, "Invalid Email Id");
                    }
                  }
                );
              }
              // const found = personal_email_arr.some(item => item.emailId === req.body.emailId);
              // if (personal_email_arr.includes(req.body.emailId)) {

              // } else {
              //   resp.noRecordsFound(res, "Email id not registered");
              // }
            } else {
              resp.noRecordsFound(res, "Email id not registered");
            }
          })
        }
      })
    } else if (req.body['login_type'] === 'user') {
      console.log('im here ==>112');
      var _body = {"emailId": req.body["emailId"] };
      console.log(_body);
      UserCtrl.findUserEmailPhone(_body, (err, user) => {
        console.log('user::', user);
        if (err) {
          resp.errorResponse(res, err, 501, "Error While Fetching User");
        } else if (user) {
          console.log("inside emailOtp 395", user);
          const firstName = user[0].first_name;
          // if(user[0].mobileNo){
          const mobileNo = user[0].mobileNo;
          // }
          console.log(req.body.emailId);
          const emailId = req.body.emailId;
          const otp = Math.floor(100000 + Math.random() * 900000);
          const ttl = 5 * 60 * 1000;
          const expires = Date.now() + ttl;
          console.log("expires", expires);
          const data = `${emailId}.${otp}.${expires}`;
          const smsKey = "13893kjefbekbkb";
          const hash = crypto
            .createHmac("sha256", smsKey)
            .update(data)
            .digest("hex");
          const fullhash = `${hash}.${expires}`;
          console.log(otp);

          AuthCtrl.sendEmailOtp(
            { firstName, emailId, mobileNo, otp },
            function (err, docs) {
              if (err) {
                resp.errorResponse(
                  res,
                  err,
                  501,
                  "Internal Server Error, Please Try Again Later"
                );
              } else if (docs) {
                resp.successPostResponse(
                  res,
                  { emailId, hash: fullhash },
                  `Otp Has Been Sent To Your Email Id ${req.body.emailId}`
                );
              } else {
                resp.noRecordsFound(res, "Invalid Email Id");
              }
            }
          );
        } else {
          resp.noRecordsFound(res, "Email id not registered");
        }
      });
    } else {
      resp.missingBody(res, "Missing Body");
    }
  }
});

router.post("/verifyOtp", (req, res) => {
  console.log("inside verify");
  const emailId = req.body.emailId;
  const hash = req.body.hash;
  const otp = req.body.otp;
  let [hashValue, expires] = hash.split(".");

  let now = Date.now();

  console.log("now", now);
  console.log("expires", parseInt(expires));

  if (now > parseInt(expires)) {
    return res.status(504).send({ msg: `Timeout please try again` });
  }
  const data = `${emailId}.${otp}.${expires}`;
  const smsKey = "13893kjefbekbkb";
  const newCalculatedHash = crypto
    .createHmac("sha256", smsKey)
    .update(data)
    .digest("hex");
  console.log("newCalculatedHash", newCalculatedHash);
  console.log("hashValue", hashValue);



  if (newCalculatedHash === hashValue) {
    console.log("inside if verify otp");

    //company Employee
    if (req.body["companyId"]) {
      let obj = {
        emailId: req.body["emailId"],
        companyId: req.body["companyId"]
      }
      employeeCtrl.employeeEmailOtpLogin(obj, (err, docs) => {
        if (err) {
          console.log("inside if route");
          console.log(err);
          if (err.name === "Invalid email") {
            resp.alreadyRegisteredWithGoogle(res, "Email not registered");
          } else {
            resp.errorResponse(res);
          }
        } else if (docs) {
          resp.successPostResponse(res, docs, "Authenticated");
        } else {
          resp.noRecordsFound(res, "Invalid EmailId");
        }
      });
    } else {

      //Noraml User
      let emailId = req.body["emailId"];
      AuthCtrl.userEmailOtpLogin(emailId, (err, docs) => {
        if (err) {
          console.log("inside if route");
          console.log(err);
          if (err.name && err.name === "wrong mode of login") {
            resp.alreadyRegisteredWithGoogle(
              res,
              "Email logged in through google please login through Google!"
            );
          } else if (err.name === "Invalid email") {
            resp.alreadyRegisteredWithGoogle(res, "Email not registered");
          } else {
            resp.errorResponse(res);
          }
        } else if (docs) {
          resp.successPostResponse(res, docs, "Authenticated");
        } else {
          resp.noRecordsFound(res, "Invalid EmailId");
        }
      });
    }
    //return res.status(202).send({msg: `user authenticated`})
  } else {
    return res.status(400).send({ verification: false, msg: `Incorrect OTP` });
  }
});



router.get('/getAllCoupon', (req, res) => {
  console.log('inside getAllActiveCoupon coupon')
  let current_date = new Date();
  console.log("current_date", current_date)
  let new_date = current_date.setMinutes(current_date.getMinutes() + 330);
  let compare_date = new Date(new_date)
  console.log("compare_date", compare_date)
  let query = {
    'eligibility': 'ALL',
    'start_date': { '$lte': compare_date },
    'end_date': { '$gte': compare_date },
    'active': true
  }
  adminController.getAllCoupon(query, (err, docs) => {
    if (err) {
      console.log(err)
      resp.errorResponse(res, err, 501, 'Error While getting coupon');
    } else if (docs) {
      console.log("docs", docs)
      resp.successGetResponse(res, docs, 'coupons list');
    } else {
      resp.noRecordsFound(res, 'Unable to get coupon');
    }
  })

})

//doctor

router.post("/doctorlogin", (req, res) => {
  console.log("inside login11");
  console.log(req.headers);
  console.log(req.headers.authorization);
  if (req.headers && req.headers.authorization) {
    headers = req.get("authorization");
    headers = headers.split(" ");
    // const mode_of_reg = "Native";
    AuthCtrl.doctorLogin(headers[1], (err, docs) => {
      if (err) {
        resp.errorResponse(res);
      } else if (docs) {
        resp.successPostResponse(res, docs, "Authenticated");
      } else {
        resp.noRecordsFound(res, "Invalid Email-ID/Password");
      }
    });
  } else {
    resp.missingBody(res, "Missing Email-ID/Password");
  }
});

router.post("/otpDoctorlogin", (req, res) => {
  console.log("inside doctor otp login", req.body);
  if (req.body) {
    AuthCtrl.doctorOtpLogin(req.body, (err, docs) => {
      if (err) {
        console.log("inside if route");
        console.log(err);
        if (err.name && err.name === "wrong mode of login") {
          resp.alreadyRegisteredWithGoogle(
            res,
            "Email logged in through google please login through Google!"
          );
        } else if (err.name === "Invalid email") {
          resp.alreadyRegisteredWithGoogle(res, "Email/Phone not registered");
        } else {
          resp.errorResponse(res);
        }
      } else if (docs) {
        resp.successPostResponse(res, docs, "Authenticated");
      } else {
        resp.noRecordsFound(res, "Invalid Email-ID/Password");
      }
    });
  } else {
    resp.missingBody(res, "Missing Email-ID/Password");
  }
});


router.put("/doctorforgotpassword", function (req, res) {
  console.log("inside doctor forgot pass");
  console.log(req.body.emailId);
  if (req.body.emailId) {
    DoctorCtrl.findUserEmailPhone(req.body, (err, user) => {
      console.log("inside", req.body);
      if (err) {
        resp.errorResponse(res, err, 501, "Error While Fetching User");
      } else if (user) {
        console.log("After inside", req.body.emaiId);
        AuthCtrl.doctorforgotpsw(req.body.emailId, function (err, docs) {
          if (err) {
            resp.errorResponse(
              res,
              err,
              501,
              "Internal Server Error, Please Try Again Later"
            );
          } else if (docs) {
            resp.successPostResponse(
              res,
              null,
              `Password Reset Link Has Been Sent To Your Email Id ${req.body.emailId}`
            );
          } else {
            resp.noRecordsFound(res, "Invalid Email Id");
          }
        });
      } else {
        if (req.body.mobileNo) {
          resp.noRecordsFound(res, "Mobile No. not registered");
        } else if (req.body.emailId) {
          resp.noRecordsFound(res, "Email id not registered");
        }
      }
    });
  } else {
    resp.missingBody(res, "Missing Body");
  }
});

router.put("/doctorupdatePassword", (req, res) => {
  console.log("inside update password");
  console.log("email", req.body.emailId);
  console.log("password", req.body.newPassword);
  if (req.body.emailId && req.body.newPassword) {
    DoctorCtrl.resetpsw(
      req.body.emailId,
      req.body.newPassword,
      function (err, docs) {
        if (err) {
          resp.errorResponse(
            res,
            err,
            501,
            "Internal Server Error, Please Try Again Later"
          );
        } else if (docs) {
          EmailTemplate.doctorPswResetEmail(docs, (err, emailres) => {
            if (err) {
              console.log("err", err)
            } else if (emailres) {
              console.log("email sent")
            } else {
              console.log("null")
            }
          })
          resp.successPostResponse(
            res,
            null,
            `Password Has Been Updated Successfully`
          );
        } else {
          resp.noRecordsFound(res, "Invalid Email Id");
        }
      }
    );
  } else {
    resp.missingBody(res, "Missing Body");
  }
});



router.post("/verifyDoctorEmailPhone", (req, res) => {
  console.log("inside verifyEmailPhone");
  console.log("reqbody", req.body);
  if (req.body) {
    AuthCtrl.findUserEmailPhone(req.body, (err, user) => {
      if (err) {
        resp.errorResponse(res, err, 501, "Error While Fetching User");
      } else if (user) {
        console.log("success");
        // let data=[];
        // user.forEach((e)=>{
        //   data.push({"mobileNo":e['mobileNo']})
        // })
        resp.successPostResponse(res, user, null);
      } else {
        console.log("unable to fetch");
        resp.noRecordsFound(res, "Unable to Fetch user");
      }
    });
  } else {
    console.log("Missing");
    resp.missingBody(res, "Missing/Invalid Body Parameters");
  }
});

router.post("/doctorEmailOtp", (req, res) => {
  console.log("inside emailOtp 386");
  if (req.body.emailId) {
    DoctorCtrl.findUserEmailPhone(req.body, (err, user) => {
      if (err) {
        resp.errorResponse(res, err, 501, "Error While Fetching User");
      } else if (user) {
        console.log("inside emailOtp 395", user);
        const firstName = user[0].name;
        console.log(req.body.emailId);
        const emailId = req.body.emailId;
        const otp = Math.floor(100000 + Math.random() * 900000);
        const ttl = 5 * 60 * 1000;
        const expires = Date.now() + ttl;
        console.log("expires", expires);
        const data = `${emailId}.${otp}.${expires}`;
        const smsKey = "13893kjefbekbkb";
        const hash = crypto
          .createHmac("sha256", smsKey)
          .update(data)
          .digest("hex");
        const fullhash = `${hash}.${expires}`;
        console.log(otp);
        DoctorCtrl.findUserEmailPhone(req.body, (err, user) => {
          if (err) {
            console.log('abhishek1:  '+req.body);
            console.log('abhishek2:  '+err);
            resp.errorResponse(res, err, 501, "Error While Fetching User");
          } else if (user) {
            const docs =  JSON.parse(JSON.stringify(user))[0];

            console.log('abhishek3', docs,typeof(docs) ,docs["emailId"],docs["mobileNo"],docs.hasOwnProperty('emailId'));
            // console.log('abhishek4:  '+user.emailId);
            // let data = [];
            // user.forEach((e) => {
              if (req.body.emailId === docs["emailId"]) {
                // data.push({ emailId: e["emailId"] });
                console.log('-----------------testing 12345--------------------');
                console.log(docs["blocked"] === false);
                console.log('-----------------testing 12345--------------------');

                if (docs["blocked"] === false) {
                  AuthCtrl.sendEmailOtpDoctor(
                    { firstName, emailId, otp },
                    function (err, docs) {
                      if (err) {
                        resp.errorResponse(
                          res,
                          err,
                          501,
                          "Internal Server Error, Please Try Again Later"
                        );
                      } else if (docs) {
                        resp.successPostResponse(
                          res,
                          { emailId, hash: fullhash },
                          `Otp Has Been Sent To Your Email Id ${req.body.emailId}`
                        );
                      } else {
                        resp.noRecordsFound(res, "Invalid Email Id");
                      }
                    }
                  );
                }else{
                  resp.noRecordsFound(res, "Invalid Email Id");
                }
              }
        
          }
        });

      } else {
        resp.noRecordsFound(res, "Email id not registered");
      }
    });
  } else {
    resp.missingBody(res, "Missing Body");
  }
});

router.post("/doctorVerifyOtp", (req, res) => {
  console.log("inside verify");
  const emailId = req.body.emailId;
  const hash = req.body.hash;
  const otp = req.body.otp;
  let [hashValue, expires] = hash.split(".");

  let now = Date.now();

  console.log("now", now);
  console.log("expires", parseInt(expires));

  if (now > parseInt(expires)) {
    return res.status(504).send({ msg: `Timeout please try again` });
  }
  const data = `${emailId}.${otp}.${expires}`;
  const smsKey = "13893kjefbekbkb";
  const newCalculatedHash = crypto
    .createHmac("sha256", smsKey)
    .update(data)
    .digest("hex");
  console.log("newCalculatedHash", newCalculatedHash);
  console.log("hashValue", hashValue);
  if (newCalculatedHash === hashValue) {
    console.log("inside if verify otp");

    AuthCtrl.doctorEmailOtpLogin(emailId, (err, docs) => {
      if (err) {
        console.log("inside if route");
        console.log(err);
        if (err.name && err.name === "wrong mode of login") {
          resp.alreadyRegisteredWithGoogle(
            res,
            "Email logged in through google please login through Google!"
          );
        } else if (err.name === "Invalid email") {
          resp.alreadyRegisteredWithGoogle(res, "Email not registered");
        } else {
          resp.errorResponse(res);
        }
      } else if (docs) {
        resp.successPostResponse(res, docs, "Authenticated");
      } else {
        resp.noRecordsFound(res, "Invalid EmailId");
      }
    });

    //return res.status(202).send({msg: `user authenticated`})
  } else {
    return res.status(400).send({ verification: false, msg: `Incorrect OTP` });
  }
});

router.post("/doctordata", (req, res) => {
  console.log("ggg");
  let header = {
    "Client-Service": "Rytlife",
    "Auth-Key": "WsC5ckrkXr",
  };

  axios
    .get("https://ryt.life/partnerdata/form_api.php", { headers: header })
    .then((response) => {
      let received = response.data.data;
      console.log("received", received);
      let data = [];
      var pattern = /".*?"/g;
      var current = [];
      var language = [];
      received.forEach((e) => {
        //console.log("e=====", e)
        let value;
        while ((value = pattern.exec(e["Psychologist Specialisation"])))
          current.push(JSON.parse(value));

        console.log("language", e["Preferred languages for counselling"]);
        let languageStr = e["Preferred languages for counselling"];
        console.log("languageStr", languageStr);
        let languageArr = languageStr.split(/(?:,| |&)+/);
        console.log("languageArr", languageArr);
        for (let i = 0; i < languageArr.length; i++) {
          console.log(languageArr[i].trim());
          language.push(languageArr[i].trim().toLowerCase());
        }
        console.log("language", language);
        data.push({
          name: e["Full Name"],
          emailId: e["Email address"],
          mobileNo: e["Mobile No"],
          qualification: [
            {
              Educational_Qualification: e["Educational Qualification"],
              University_Institution: e["University/Institution"],
              Completion_Year: e["Completion Year"],
            },
          ],
          consultation_fee:
            e[
            "Appointment Fee for a session (in Rupees/ Hour). Kindly note that Rytlife will be charging a platform fee of 10% or 50/- (whichever is higher) for every session conducted."
            ],
          specialization: current,
          council: [
            {
              MCI_council:
                e["Select the MCI registration council (if applicable)"],
              MCI_Number: e["MCI Number"],
              MCI_Registration: e["MCI Year of Registration"],
            },
          ],
          languages: language,
          description: e["Professional Summary"],
          profession: e["You are registering as a"],
          city: e["City"],
          availability: "2050-05-09T10:00:00.000Z",
        });
        current = [];
        language = [];
      });
      let iterate = 0;
      let addedProfile = [];
      for (let i = 0; i < data.length; i++) {
        iterate++;
        console.log(`doctor data ${iterate}`, data[i]);
        doctorController.addProfile(data[i], (err, profile) => {
          if (err) {
            console.log(`Error while adding profile`, err);
            //resp.errorResponse(res, err);
          } else if (profile) {
            console.log("Profile added Successful", profile);
            addedProfile.push(profile);
            EmailTemplate.doctorsignupConfirmationEmail(profile, (err, emailres) => {
              if (err) {
                console.log("err", err)
              } else if (emailres) {
                console.log("email sent")
              } else {
                console.log("null")
              }
            })

            EmailTemplate.doctorwelcomeConfirmationEmail(profile, (err, emailres) => {
              if (err) {
                console.log("err", err)
              } else if (emailres) {
                console.log("email sent")
              } else {
                console.log("null")
              }
            })

            //resp.successPostResponse(res, profile, 'Profile added successful');
          } else {
            console.log("Could Not Add Profile");
            //resp.missingBody(res, 'Unable to add profile');
          }
        });
      }
      console.log("added profile", addedProfile);
      if (iterate == data.length) {
        resp.successPostResponse(res, "Profile added successful");
      }
      // else if(iterate == data.length && addedProfile.length == 0){
      //   resp.missingBody(res, 'Unable to add profile');
      // }
      // doctorModel.doctorModel.insertMany(data).then(function(data){
      //   resp.successPostResponse(
      //     res,
      //     'Added Sucessfully'
      //   );
      // }).catch(function(error){
      //  resp.noRecordsFound(res,error);
      // // Failure
      // });
    })
    .catch((error) => {
      resp.noRecordsFound(res, error);
    });
});

router.put("/createpassword", (req, res) => {
  if (req.body) {
    console.log(req.body);
    AuthCtrl.createPassword(req.body.password, req.body, (err, result) => {
      if (err) {
        resp.errorResponse(err);
      }
      console.log(result);
      if (result) {
        resp.successGetResponse(res, null, "Added sucessfully");
      } else {
        resp.noRecordsFound(res, "unable to fetch");
      }
    });
  } else {
    resp.missingBody(res, "Missing body");
  }
});

router.post("/add", (req, res) => {
  console.log("inside add" + req.body.newProfile);
  if (req.body.newProfile || req.query) {
    let doctorProfile = doctorController.capitaliseFirstLetter(
      req.body.newProfile
    );
    console.log(doctorProfile);
    doctorController.addProfile(req.body.newProfile, (err, profile) => {
      if (err) {
        console.log(`Error while adding profile`, err);
        resp.errorResponse(res, err);
      } else if (profile) {
        console.log("Profile added Successful");
        resp.successPostResponse(res, profile, "Profile added successful");
      } else {
        console.log("Could Not Add Project");
        resp.missingBody(res, "Unable to add profile");
      }
    });
  } else {
    resp.missingBody(res, "Unauthorised");
  }
});

router.get("/getAll", (req, res, next) => {
  console.log("======== getAll ======");
  doctorController.getAllPostedProfile({ blocked: false, hidden: false }, (err, docs) => {
    console.log("got response===========");
    if (err) {
      console.log(err);
      resp.errorResponse(res, err, 501, "Error While Fetching Profile List");
    } else if (docs) {
      console.log("inside else if", docs.profile.length);
      //resp.successGetResponse(res, docs, 'doctor profile List');
      //get available doctor
      let iterate = 0;
      for (let i = 0; i < docs.profile.length; i++) {
        console.log("inside for loop", i);
        let query = {};
        query["doctorId"] = docs.profile[i]._id;
        appointmentController.getTimeSlotsAvailabilty(
          query,
          (err, timeslots) => {
            if (err) {
              console.log(err);
              //resp.errorResponse(res, err, 501, 'Error While fetching timeslots');
            }
            iterate++;
            if (timeslots) {
              console.log("if timeslots", timeslots.availableSlots.length);
              console.log("timeslots", timeslots.availableSlots);
              let availableTime = [];
              for (let i = 0; i < timeslots.availableSlots.length; i++) {
                console.log("slots", timeslots.availableSlots[i].date);
                if (timeslots.availableSlots[i].booked !== true) {
                  availableTime.push(timeslots.availableSlots[i].date);
                }
              }
              //availableTime.sort();
              console.log("availableTime", availableTime);
              if (availableTime.length > 0) {
                docs.profile[i].availability = availableTime[0];
                Model.findByIdAndUpdate(
                  docs.profile[i]._id,
                  { availability: availableTime[0] },
                  { new: true, select: "-password" }
                )
                  .then(function (data) {
                    console.log("successfully added", data);
                  })
                  .catch(function (error) {
                    console.log("error", error);
                  });
              } else {
                console.log("inside else 891");
                docs.profile[i].availability = "2050-05-09T10:00:00.000Z";
                Model.findByIdAndUpdate(
                  docs.profile[i]._id,
                  { availability: "2050-05-09T10:00:00.000Z" },
                  { new: true, select: "-password" }
                )
                  .then(function (data) {
                    console.log("successfully added", data);
                  })
                  .catch(function (error) {
                    console.log("error", error);
                  });
              }
            } else {
              console.log("inside else 957")
              docs.profile[i].availability = "2050-05-09T10:00:00.000Z";
              Model.findByIdAndUpdate(
                docs.profile[i]._id,
                { availability: "2050-05-09T10:00:00.000Z" },
                { new: true, select: "-password" }
              )
                .then(function (data) {
                  console.log("successfully added", data);
                })
                .catch(function (error) {
                  console.log("error", error);
                });
            }
            if (iterate == docs.profile.length) {
              console.log("inside", docs.profile);
              resp.successGetResponse(res, docs, "doctor profile List");
            }
            // if((availableDoctor.length == 0) && (iterate == docs.profile.length )){

            //     resp.noRecordsFound(res, 'doctor not available');

            // }
          }
        );
      }
    } else {
      resp.noRecordsFound(res, "Unable to Fetch doctor profile List");
    }
  });
});

router.get("/filter", (req, res) => {
  console.log("inside filter");
  console.log("query", req.query);
  if (req.query) {
    doctorController.getPostedProfileByOptions(req.query, (err, docs) => {
      console.log("got response===========");
      if (err) {
        console.log(err);
        resp.errorResponse(res, err, 501, "Error While Fetching Profile List");
      } else if (docs) {
        console.log("inside else if", docs.profile.length);
        //resp.successGetResponse(res, docs, 'doctor profile List');
        //get available doctor
        let iterate = 0;
        for (let i = 0; i < docs.profile.length; i++) {
          console.log("inside for loop", i);
          let query = {};
          query["doctorId"] = docs.profile[i]._id;
          appointmentController.getTimeSlotsAvailabilty(
            query,
            (err, timeslots) => {
              if (err) {
                console.log(err);
                //resp.errorResponse(res, err, 501, 'Error While fetching timeslots');
              }
              iterate++;
              if (timeslots) {
                console.log("if timeslots", timeslots.availableSlots.length);
                console.log("timeslots", timeslots.availableSlots);
                let availableTime = [];
                for (let i = 0; i < timeslots.availableSlots.length; i++) {
                  console.log("slots", timeslots.availableSlots[i].date);
                  if (timeslots.availableSlots[i].booked !== true) {
                    availableTime.push(timeslots.availableSlots[i].date);
                  }
                }
                //availableTime.sort();
                console.log("availableTime", availableTime);
                if (availableTime.length > 0) {
                  docs.profile[i].availability = availableTime[0];
                  Model.findByIdAndUpdate(
                    docs.profile[i]._id,
                    { availability: availableTime[0] },
                    { new: true, select: "-password" }
                  )
                    .then(function (data) {
                      console.log("successfully added", data);
                    })
                    .catch(function (error) {
                      console.log("error", error);
                    });
                } else {
                  console.log("inside else 891");
                  docs.profile[i].availability = "2050-05-09T10:00:00.000Z";
                  Model.findByIdAndUpdate(
                    docs.profile[i]._id,
                    { availability: "2050-05-09T10:00:00.000Z" },
                    { new: true, select: "-password" }
                  )
                    .then(function (data) {
                      console.log("successfully added", data);
                    })
                    .catch(function (error) {
                      console.log("error", error);
                    });
                }
              } else {
                console.log("inside else 957")
                docs.profile[i].availability = "2050-05-09T10:00:00.000Z";
                Model.findByIdAndUpdate(
                  docs.profile[i]._id,
                  { availability: "2050-05-09T10:00:00.000Z" },
                  { new: true, select: "-password" }
                )
                  .then(function (data) {
                    console.log("successfully added", data);
                  })
                  .catch(function (error) {
                    console.log("error", error);
                  });
              }
              if (iterate == docs.profile.length) {
                console.log("inside", docs.profile);
                resp.successGetResponse(res, docs, "doctor profile List");
              }
              // if((availableDoctor.length == 0) && (iterate == docs.profile.length )){

              //     resp.noRecordsFound(res, 'doctor not available');

              // }
            }
          );
        }
      } else {
        resp.noRecordsFound(res, "Unable to Fetch profile List");
      }
    });
  }
});

//Admin login

router.post("/addAdmin", (req, res) => {
  if (req.body.newAdmin) {
    adminController.addNewAdmin(req.body.newAdmin, (err, profile) => {
      if (err) {
        console.log(`Error while adding Admin`, err);
        resp.errorResponse(res, err);
      } else if (profile) {
        console.log("Admin added Successful");
        resp.successPostResponse(res, profile, "Admin added successful");
      } else {
        resp.missingBody(res, "Unable to add Admin");
      }
    });
  }
})

router.post("/adminlogin", (req, res) => {
  console.log(req.headers);
  console.log(req.headers.authorization);
  if (req.headers && req.headers.authorization) {
    headers = req.get("authorization");
    headers = headers.split(" ");
    // const mode_of_reg = "Native";
    adminController.adminLogin(headers[1], (err, docs) => {
      if (err) {
        resp.errorResponse(res);
      } else if (docs) {
        resp.successPostResponse(res, docs, "Authenticated");
      } else {
        resp.noRecordsFound(res, "Invalid Email-ID/Password");
      }
    });
  } else {
    resp.missingBody(res, "Missing Email-ID/Password");
  }
});

router.put("/adminForgotPass", function (req, res) {
  console.log("inside forgot pass");
  console.log(req.body.emailId);
  if (req.body.emailId) {
    adminController.findUserEmailPhone(req.body, (err, user) => {
      if (err) {
        resp.errorResponse(res, err, 501, "Error While Fetching User");
      } else if (user) {
        adminController.forgotpsw(req.body.emailId, function (err, docs) {
          if (err) {
            resp.errorResponse(
              res,
              err,
              501,
              "Internal Server Error, Please Try Again Later"
            );
          } else if (docs) {
            resp.successPostResponse(
              res,
              null,
              `Password Reset Link Has Been Sent To Your Email Id ${req.body.emailId}`
            );
          } else {
            resp.noRecordsFound(res, "Invalid Email Id");
          }
        });
      } else {
        if (req.body.mobileNo) {
          resp.noRecordsFound(res, "Mobile No. not registered");
        } else if (req.body.emailId) {
          resp.noRecordsFound(res, "Email id not registered");
        }
      }
    });
  } else {
    resp.missingBody(res, "Missing Body");
  }
});

router.put("/adminUpdatePassword", (req, res) => {
  console.log("inside update password");
  console.log("email", req.body.emailId);
  console.log("password", req.body.newPassword);
  if (req.body.emailId && req.body.newPassword) {
    adminController.resetpsw(
      req.body.emailId,
      req.body.newPassword,
      function (err, docs) {
        if (err) {
          resp.errorResponse(
            res,
            err,
            501,
            "Internal Server Error, Please Try Again Later"
          );
        } else if (docs) {
          console.log("updated pass docs", docs);
          // AuthCtrl.passwordResetConfirmationEmail(docs, function (err, docs) {
          //   if (err) {
          //     console.log("sendgrid err", err);

          //   } else if (docs) {
          //     console.log("sendgrid docs", docs);

          //   } else {
          //     console.log("sendgrid else");

          //   }
          // });
          resp.successPostResponse(
            res,
            null,
            `Password Has Been Updated Successfully`
          );
        } else {
          resp.noRecordsFound(res, "Invalid Email Id");
        }
      }
    );
  } else {
    resp.missingBody(res, "Missing Body");
  }
});
