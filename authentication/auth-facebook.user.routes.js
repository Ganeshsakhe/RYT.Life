const express = require('express');
const router = express.Router();
const AuthCtrl = require('./authentication.controller');
const Users = require('../user/user.model');
const resp = require('../../helpers/responseHelpers');
module.exports = router;
router.post('/signup', function (req, res) {
    console.log("inside facebook signup")
    if (req.user) {
        console.log("req.user", req.user)
        if (req.query.role || req.user) {
            console.log("inside if req.query.role || req.user")
            if (req.user.length > 0) {
                console.log("inside if")
                resp.alreadyRegistered(res, 'User Already registered using Facebook, please login with Facebook');
            } else if (req.user.fid) {
                console.log("inside else if")
               Users.findUserAndUpdate({ fid: req.user.fid }, req.query, (err, doc) => {
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
    console.log("inside login")
    if (req.user) {
        console.log("req.user", req.user)
        AuthCtrl.socialLogin(req.user[0], function (err, docs) {
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