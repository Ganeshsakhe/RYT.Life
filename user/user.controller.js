const bcrypt = require('bcryptjs');
const resp = require('../../helpers/responseHelpers');
const UserModel = require('./user.model.js');
const validators = require('../../helpers/validators');
//const EmailTemplate = require("../projects/model_helpers/email_template");
const bookedslotsModel = require("../projects/model_helpers/bookslots_model.helper");
const BookingModel = require('../projects/models/bookslots.model').bookingSlotsModel;

const createProfile = (userDetails, profileDetails) => {
    return new Promise((resolve, reject) => {
        UserModel.createProfile(userDetails, profileDetails).then(
            (data) => resolve(data),
            (err) => reject(err)
        )
    })
};

const updateUser = (query, userDetails, callback) => {
    console.log("userDetails");
    console.dir(userDetails);
    UserModel.findUserAndUpdate(query, userDetails, callback);
}
const updateUserData = (query, data, callback) => {
    // console.log("==========2=======");
    // console.log(query);
    // console.log(data);
    UserModel.findUserAndUpdate(query, { profileDetails: data }, callback)
    // console.log("=======callback=====");
    // console.log(callback);
}

const findUser = (query, callback) => {
    UserModel.findUser(query, callback);
}

const findUserEmailPhone = (body, callback) => {
    console.log("inside findUserEmailPhone");
    console.log('body', body);
    UserModel.findUserEmailPhone(body, callback);
}

const getProfile = (user) => {
    return new Promise((resolve, reject) => {
        UserModel.getProfileDetailsById({ _id: user._id }).then(
            (data) => resolve(data),
            (err) => reject(err)
        )
    })
};

const updateProfile = (query, profileDetails) => {
    return new Promise((resolve, reject) => {
        UserModel.updateProfileDetails(query, profileDetails).then(
            (data) => resolve(data),
            (err) => reject(err)
        )
    })
};

// const getBookedSlots = (query, callback) => {
//     bookedslotsModel.getBookedSlots(query, callback);
// }

const getBookedSlots = (query, callback) => {
    bookedslotsModel.getBookedSlots(query, callback)
}


const resetpsw = (query, data, callback) => {
    validators.hashPassword(data, function (err, hash) {
        if (err) {
            console.log(`Error while hashing password:`, err);
        } else if (hash) {
            console.log('Successfully hashed password');
            data = hash;
            UserModel.findUserAndUpdate({ emailId: query }, { password: data }, callback);
        } else {
            console.log(`Could Not hash password:`);
            callback(null, null);
        }
    });
}

function verifyEmail(emailId, emailIdVerified, callback) {
    EmailTemplate.sendVerificationEmailTemplate({ emailId }, (err, res) => {
        if (err) {
            callback(err, null);
        } else if (res) {
            callback(null, res);
        } else {
            callback(null, null);
        }
    })
    // UserModel.findUserAndUpdate({ emailId }, { emailIdVerified }, function (err, res) {
}

function logout(token,callback)
{
    UserModel.logout(token,callback)
}



module.exports = {
    resetpsw,
    createProfile,
    getProfile,
    updateProfile,
    verifyEmail,
    updateUser,
    updateUserData,
    findUser,
    findUserEmailPhone,
    getBookedSlots,
    logout 
}