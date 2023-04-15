const bcrypt = require('bcryptjs');
const UserModel = require("../user/user.model");
const validators = require("../../helpers/validators");
const EmailTemplate = require("../projects/model_helpers/email_template");
//const EmailTemplates = require('../mails/mailhelper/email-store/email-templates');
const { validateEmail } = require('../../helpers/validators');
const doctorModel =require('../doctor/doctor.model')
const adminModel = require('../admin/admin.model')

function signUpUser(data, callback) {
  console.log("inside signup user");
  console.log(data);
  console.log(callback);
  validators.hashPassword(data.password, (err, hash) => {
    if (err) {
      callback(err, null);
    } else if (hash) {
      data.password = hash;
      UserModel.addUser(data, (err, res) => {
        console.log("USER model");
        console.log(res);
        if (err) {
          callback(err, null);
        } else if (res) {
          validators.generateJWTToken(res._id, (err, token) => {
            if (err) {
              callback(err, null);
            } else if (res) {
              console.log("else if");
              console.log(res);
              callback(null, res);
              
              // ********** Post sign up activation **************
              const activationMailObj = {user: {first_name:data.first_name, last_name: data.last_name}, host: data.origin, userToken: token, to: [{'email': data.emailId, 'name': data.first_name + ' ' + data.last_name, 'type': 'to'}], heading: 'Welcome !'};
              // Function Name: mailObj

              // ********** super admin email notify on new registration from same company **************
              const mailObj = {newUser: {first_name:data.first_name, last_name: data.last_name, email: data.emailId}, host: data.origin, to: [{'email': 'admin@wrked.com', 'name': 'wrked', 'type': 'to'}, {'email': 'eswervarma@uipep.com', 'name': 'wrked', 'type': 'cc'}], heading: 'New User Registration'};
              // Function Name: toAdminNewUser
              console.log(JSON.stringify(activationMailObj))
              // callback(null, token);
              // Function
              // EmailTemplates.activationMail(activationMailObj, (err, response) => {
              //   console.log(err);
              //   console.log(response);
              //   console.log("something happend");
              //   //console.log(err, response, " Something happened")
              //   if (err) {
              //     callback(err, null);
              //   } else {
              //     console.log(JSON.stringify(mailObj))
              //     EmailTemplates.toWrkedAdminNewUser(mailObj, (err, response) => {
              //       console.log(err, response, " Something happened 2")
              //       if (err) {
              //         callback(err, null);
              //       } else {
              //         callback(null, token);
              //       }
              //     });
              //   }
              // });

            } else {
              callback(null, null);
            }
          });
        } else {
          callback(null, null)
        }
      });
    }
     else {
      callback(null, null);
    }
  });
}

function capitaliseFirstLetter(data){
  data['first_name'] = data.first_name.charAt(0).toUpperCase() + data.first_name.slice(1)
  data['last_name'] = data.last_name.charAt(0).toUpperCase() + data.last_name.slice(1)
  console.log(data);
  return data;
}

function socialLogin(user, callback) {
  console.log("inside controller", user)
  console.log("inside controller userid", user._id)
  validators.generateJWTToken(user._id, callback);
}

function userUpdate(user, data, callback) {
  UserModel.findUserAndUpdate(user.emailId, data, (err, res) => {
    if (err) {
      callback(err, null);
    } else if (res) {
      validators.generateJWTToken(user._id, callback);
    } else {
      callback(null, null);
    }
  })
}

function userLogin(authString, mode_user_reg, callback) {
  console.log('inside userlogin');
  console.log("authstring", authString);
  validators.decodeAuthString(authString, (email_phone, password) => {
    console.log("decodeAuth");
    console.log('email', email_phone);
    console.log('password', password);
    if (email_phone && password) {
      UserModel.login(email_phone, (err, res) => {
        console.log("USER MODEL");
        console.log('res', res);
        if (err) {
          callback(err, null);
        }
        else if(res[0].blocked == true){
          callback(err,null)
        } 
        else if (res[0].password) {
          if(mode_user_reg === 'Google' || mode_user_reg === 'Facebook'){
            return callback({error:'wrong mode of login'},null);
          } else {
            bcrypt.compare(password, res[0].password, (err, same) => {
              console.log('-----------------------------------');
              console.log(password, res[0].password, same);
              console.log('-----------------------------------');  
              if (err) {
                callback(err, null);
              } else if (same) {
                validators.generateJWTToken(res[0]._id, (err, token) => {
                  callback(null, {token: token, role: res[0].role, user: res[0]});
                });
              } else {
                callback(null, null);
              }
            });
          }
        } else if (res === "Invalid email/mobileNo") {
          console.log("inside invalid email");
          callback({name: res}, null)
        }
         else {
          console.log("inside else-----", res);
          callback({name:'wrong mode of login'},null);
          // callback(null, null);
        }
      });
    } else {
      callback(null, null);
    }
  });
}

function userOtpLogin(authString, mode_user_reg, callback) {
  console.log('inside user otp login', authString);
  if (authString.mobileNo && authString.response == "success") {
    console.log("inside if", authString.mobileNo)
    let query = {
      "mobileNo": authString.mobileNo
    }
    UserModel.login(query, (err, res) => {
      console.log("USER MODEL");
      console.log('res', res);
      if (err) {
        callback(err, null);
      } else if (res[0].mobileNo) {
        if(mode_user_reg === 'Google' || mode_user_reg === 'Facebook'){
          return callback({error:'wrong mode of login'},null);
        } else {
          validators.generateJWTToken(res[0]._id, (err, token) => {
            callback(null, {token: token, role: res[0].role});
          });
        }
      } else if (res === "Invalid email/mobileNo") {
        console.log("inside invalid email");
        callback({name: res}, null)
      }
       else {
        console.log("inside else-----", res);
        callback({name:'wrong mode of login'},null);
        // callback(null, null);
      }
    });
  } else {
    callback(null, null);
  }
}

function userEmailOtpLogin(emailId, callback) {
  console.log('inside user otp login', emailId);
  if (emailId) {
    let query = {
      "emailId": emailId
    }
    UserModel.login(query, (err, res) => {
      console.log("USER MODEL");
      console.log('res', res);
      if (err) {
        callback(err, null);
      } else if (res[0].emailId) {
          validators.generateJWTToken(res[0]._id, (err, token) => {
            callback(null, {token: token, role: res[0].role});
          });
      } else if (res === "Invalid email/mobileNo") {
        console.log("inside invalid email");
        callback({name: res}, null)
      }
       else {
        console.log("inside else-----", res);
        callback({name:'wrong mode of login'},null);
        // callback(null, null);
      }
    });
  } else {
    callback(null, null);
  }
}

function verifyEmail(emailId, emailIdVerified, callback) {
  UserModel.findUserAndUpdate({ emailId }, { emailIdVerified }, function (err, res) {
    if (err) {
      callback(err, null);
    } else if (res) {
      callback(null, res);
    } else {
      callback(null, null);
    }
  });
}

function forgotpsw(emailId, callback) {
  console.log("inside forgot pass controller");
  console.log(emailId);
  EmailTemplate.sendForgotEmail({ emailId }, (err, res) => {
    if (err) {
      callback(err, null);
    } else if (res) {
      callback(null, res);
    } else {
      callback(null, null);
    }
  });
}

function sendEmailOtp(data, callback) {
  console.log("inside forgot pass sendEmailOtp");
  EmailTemplate.sendEmailOtp(data, (err, res) => {
    if (err) {
      callback(err, null);
    } else if (res) {
      callback(null, res);
    } else {
      callback(null, null);
    }
  });
}

function sendEmailOtpDoctor(data, callback) {
  console.log("inside forgot pass sendEmailOtp");
  EmailTemplate.sendEmailOtpDoctor(data, (err, res) => {
    if (err) {
      callback(err, null);
    } else if (res) {
      callback(null, res);
    } else {
      callback(null, null);
    }
  });
}

function signupConfirmationEmail(data, callback) {
  console.log("inside signupConfirmationEmail controller");
  EmailTemplate.signupConfirmationEmail(data, (err, res) => {
    if (err) {
      callback(err, null);
    } else if (res) {
      callback(null, res);
    } else {
      callback(null, null);
    }
  });
}

function loginConfirmationEmail(data, callback) {
  console.log("inside loginConfirmationEmail controller");
  EmailTemplate.welcomeConfirmationEmail(data, (err, res) => {
    if (err) {
      callback(err, null);
    } else if (res) {
      callback(null, res);
    } else {
      callback(null, null);
    }
  });
}

function passwordResetConfirmationEmail(data, callback) {
  console.log("inside passwordResetConfirmationEmail controller");
  EmailTemplate.resetConfirmationEmail(data, (err, res) => {
    if (err) {
      callback(err, null);
    } else if (res) {
      callback(null, res);
    } else {
      callback(null, null);
    }
  });
}

function doctorforgotpsw(emailId, callback) {
  console.log("inside doctorforgotpsw controller");
  console.log(emailId);
  EmailTemplate.sendForgotEmailDoctor({ emailId }, (err, res) => {
    if (err) {
      callback(err, null);
    } else if (res) {
      callback(null, res);
    } else {
      callback(null, null);
    }
  });
}


//doctor 


function doctorLogin(authString,callback) {
  console.log('inside userlogin');
  console.log(authString);
  validators.decodeAuthString(authString, (email_phone, password) => {
    console.log("decodeAuth");
    console.log('email', email_phone);
    console.log('password', password);
    if (email_phone && password) {
      doctorModel.login(email_phone, (err, res) => {
        console.log("USER MODEL");
        console.log('res', res);
        if (err) {
          callback(err, null);
        } 
        else if(res[0].blocked == true){
          callback(err,null)
        }
        else if (res[0].password) {
            bcrypt.compare(password, res[0].password, (err, same) => {
              console.log('-----------------------------------');
              console.log(password, res[0].password, same);
              console.log('-----------------------------------');  
              if (err) {
                callback(err, null);
              } else if (same) {
                validators.generateJWTToken(res[0]._id, (err, token) => {
                  callback(null, {token: token, role: res[0].role});
                });
              } else {
                callback(null, null);
              }
            });
          }
        else if (res === "Invalid email") {
          console.log("inside invalid email");
          callback({name: res}, null)
        }
         else {
          console.log("inside else-----", res);
          callback({name:'wrong mode of login'},null);
          // callback(null, null);
        }
      });
    } else {
      callback(null, null);
    }
  });
}

function doctorOtpLogin(authString,callback) {
  console.log('inside doctor Otp login');
  console.log(authString);
  if (authString.mobileNo && authString.response == "success") {
    console.log("inside if", authString.mobileNo)
    let query = {
      "mobileNo": authString.mobileNo
    }
    doctorModel.login(query, (err, res) => {
      console.log("USER MODEL");
      console.log('res', res);
      if (err) {
        callback(err, null);
      }else if(res[0].blocked == true){
        callback(err,null)
      }
      else if (res[0].mobileNo) {
        validators.generateJWTToken(res[0]._id, (err, token) => {
          callback(null, {token: token, role: res[0].role});
        });
      }
      else if (res === "Invalid email/mobileNo") {
        console.log("inside invalid email");
        callback({name: res}, null)
      }
       else {
        console.log("inside else-----", res);
        callback({name:'wrong mode of login'},null);
        // callback(null, null);
      }
    });
  } else {
    callback(null, null);
  }
}

function doctorEmailOtpLogin(emailId,callback) {
  console.log('inside doctor Otp login');
  console.log(emailId);
  if (emailId) {
    console.log("inside if", emailId)
    let query = {
      "emailId": emailId
    }
    doctorModel.login(query, (err, res) => {
      console.log("doctor model");
      console.log('res', res);
      if (err) {
        callback(err, null);
      } 
      else if (res[0].mobileNo) {
        validators.generateJWTToken(res[0]._id, (err, token) => {
          callback(null, {token: token, role: res[0].role});
        });
      }
      else if (res === "Invalid email/mobileNo") {
        console.log("inside invalid email");
        callback({name: res}, null)
      }
       else {
        console.log("inside else-----", res);
        callback({name:'wrong mode of login'},null);
        // callback(null, null);
      }
    });
  } else {
    callback(null, null);
  }
}

function forgotpassword(emailId, callback) {
  console.log("inside forgot pass controller");
  console.log(emailId);
  EmailTemplate.sendForgotEmail({ emailId }, (err, res) => {
    if (err) {
      callback(err, null);
    } else if (res) {
      callback(null, res);
    } else {
      callback(null, null);
    }
  });
}

const findUserEmailPhone = (body, callback) => {
  console.log("inside findUserEmailPhone");
  console.log('body', body);
  doctorModel.findUserEmailPhone(body, callback);
}

function createPassword(password,body,callback){
  validators.hashPassword(password,(err,hash) => {
    if (err) {
      callback(err,null)
    }
    console.log(hash)
    if(hash){
    doctorModel.createPassword(body,hash,callback)
    }
    else{
      callback(null,null)
    }
  });
  
}

// Admin login

function adminLogin(authString,callback) {
  console.log('inside userlogin');
  console.log(authString);
  validators.decodeAuthString(authString, (email_phone, password) => {
    console.log("decodeAuth");
    console.log('email', email_phone);
    console.log('password', password);
    if (email_phone && password) {
      adminModel.login(email_phone, (err, res) => {
        console.log("USER MODEL");
        console.log('res', res);
        if (err) {
          callback(err, null);
        } 
        else if (res.password) {
            bcrypt.compare(password, res.password, (err, same) => {
              console.log('-----------------------------------');
              console.log(password, res.password, same);
              console.log('-----------------------------------');  
              if (err) {
                callback(err, null);
              } else if (same) {
                validators.generateJWTToken(res._id, (err, token) => {
                  callback(null, {token: token, role: res.role});
                });
              } else {
                callback(null, null);
              }
            });
          }
        else if (res === "Invalid email") {
          console.log("inside invalid email");
          callback({name: res}, null)
        }
         else {
          console.log("inside else-----", res);
          callback({name:'wrong mode of login'},null);
          // callback(null, null);
        }
      });
    } else {
      callback(null, null);
    }
  });
}

module.exports = {
  signUpUser: signUpUser,
  userLogin: userLogin,
  userOtpLogin: userOtpLogin,
  verifyEmail: verifyEmail,
  forgotpsw: forgotpsw,
  doctorforgotpsw: doctorforgotpsw,
  // updatePassword: updatePassword,
  socialLogin: socialLogin,
  userUpdate: userUpdate,
  capitaliseFirstLetter:capitaliseFirstLetter,
  doctorLogin: doctorLogin,
  forgotpassword:forgotpassword,
  findUserEmailPhone:findUserEmailPhone,
  createPassword:createPassword,
  doctorOtpLogin:doctorOtpLogin,
  adminLogin:adminLogin,
  signupConfirmationEmail: signupConfirmationEmail,
  loginConfirmationEmail: loginConfirmationEmail,
  passwordResetConfirmationEmail: passwordResetConfirmationEmail,
  sendEmailOtp: sendEmailOtp,
  sendEmailOtpDoctor: sendEmailOtpDoctor,
  userEmailOtpLogin: userEmailOtpLogin,
  doctorEmailOtpLogin: doctorEmailOtpLogin
}
