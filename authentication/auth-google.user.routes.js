const express = require('express');
const router = express.Router();
const AuthCtrl = require('./authentication.controller');
const Users = require('../user/user.model');
const resp = require('../../helpers/responseHelpers');
module.exports = router;
router.post('/signup', function (req, res) {
    console.log('=========inside google signup=============');
    if (req.user) {
        console.log('req.user', req.user);
        if (req.query.role || req.user) {
            console.log('inside if req.query.role');
            if (req.user.exist === "user already registerd") {
                console.log('inside if req.user.length')
                resp.alreadyRegistered(res, 'User Already registered using Google, please login with Google');
            } else if (req.user.emailId) {
                console.log("else if req.user.emailId");
                Users.findUserAndUpdate({ emailId: req.user.emailId }, req.query, (err, doc) => {
                    if (err) {
                        resp.errorResponse(res, 'Internal Server Error');
                    } else if (doc) {
                        AuthCtrl.signupConfirmationEmail(doc, function (err, data) {
                            if (err) {
                              console.log("sendgrid err", err);
                            } else if (data) {
                              console.log("sendgrid data 56", data);
                            } else {
                              console.log("sendgrid else");
                            }
                          });
                          console.log("============loginemail===========");
                          AuthCtrl.loginConfirmationEmail(doc, function (err, data) {
                            if (err) {
                              console.log("sendgrid err", err);
                            } else if (data) {
                              console.log("sendgrid data 61", data);
                            } else {
                              console.log("sendgrid else");
                            }
                          });
                        resp.successPostResponse(res, doc, 'Successfully Signed Up New User');
                    } else {
                        resp.noRecordsFound(res, 'No Email ID Found');
                    }
                });
            }
        } else {
            resp.missingBody(res, 'Missing Body');
        }
    } else {
        resp.errorResponse(res, 'Internal Server Error/ User Not registered');
    }
});

router.post('/login', function (req, res) {
    console.log('inside google login');
    if (req.user) {
        AuthCtrl.socialLogin(req.user, function (err, docs) {
            if (err) {
                resp.errorResponse(res);
            } else if (docs) {
                resp.successPostResponse(res, docs, 'Authenticated');
            } else {
                resp.noRecordsFound(res, 'Invalid Email Id/Password');
            }
        });
    } else {
        resp.missingBody(res, 'Missing Email Id/Password');
    }
});