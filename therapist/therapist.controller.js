const EmailTemplate = require("../projects/model_helpers/email_template");
const therapistModel = require('./therapist.model.js');
var moment = require('moment');
const validators = require("../../helpers/validators");
const bookedslotsModel = require("../projects/model_helpers/bookslots_model.helper");
const UserModel = require('../user/user.model')
const BookingModel = require('../projects/models/bookslots.model').bookingSlotsModel;

const getProfile = (user) => {
    return new Promise((resolve, reject) => {
        therapistModel.getProfileDetailsById({ _id: user._id }).then(
            (data) => resolve(data),
            (err) => reject(err)
        )
    })
};

const findUserEmailPhone = (body, callback) => {
    console.log("inside findUserEmailPhone");
    console.log('body', body);
    therapistModel.findUserEmailPhone(body, callback);
}

const resetpsw = (query, data, callback) => {
    validators.hashPassword(data, function (err, hash) {
        if (err) {
            console.log(`Error while hashing password:`, err);
        } else if (hash) {
            console.log('Successfully hashed password');
            data = hash;
            therapistModel.findUserAndUpdate({ emailId: query }, { password: data }, callback);
        } else {
            console.log(`Could Not hash password:`);
            callback(null, null);
        }
    });
}

function addProfile(newProfile, callback) {
    therapistModel.addProfile(newProfile, (err, res) => {
        if (err) {
            callback(err, null);
        } else if (res) {
            callback(null, res);
        } else {
            callback(null, null);
        }
    });
}

const updateUser = (query, userDetails, callback) => {
    console.log("userDetails");
    console.dir(userDetails);
    therapistModel.findUserAndUpdate(query, userDetails, callback);
}

function getAllPostedProfile(data, callback) {
    console.log("========2=========");
    therapistModel.getAllPostedProfile(data, (err, res) => {
        if (err) {
            callback(err, null);
        }
        else if (res) {
            callback(null, res);
        } else {
            callback(null, null)
        }
    });
}

function getPostedProfileByOptions(data, callback) {
    console.log("inside getPostedProfileByOptins")

    therapistModel.getPostedProfileByOptions(data, (err, res) => {
        if (err) {
            callback(err, null);
        }
        else if (res) {
            callback(null, res);
        } else {
            callback(null, null)
        }
    })
}

function capitaliseFirstLetter(data) {
    let name = data.name.split(" ");
    if (name[1] != null) {
        let first_name = name[0].charAt(0).toUpperCase() + name[0].slice(1);
        let last_name = name[1].charAt(0).toUpperCase() + name[1].slice(1);
        name = first_name + ' ' + last_name;
        data.name = name;
    }
    return data;
}

const getBookedSlots = (query, callback) => {
    bookedslotsModel.getBookedSlotsForTherapist(query, callback)
}

const getBookedSlots_employee = (query, callback) => {
    bookedslotsModel.getBookedSlotsForTherapist_employee(query, callback)
}

const getAllclient = (query, callback) => {
    console.log("-----------------------------------------------------------------", query);
    bookedslotsModel.getBookedSlotsForTherapist(query, async (err, res) => {
        if (err) {
            callback(err, null);
        } else if (res.length > 0) {
            console.log("res length", res.length)

            console.log("****************************************************");
            console.log(res);
            let appointment = res.filter((v, i, a) => a.findIndex(t => ((v.userId !== null) && (t.userId !== null) && (t.userId._id === v.userId._id))) === i)
            console.log(appointment.length)
            if (appointment.length > 0) {
                let session_details = [];
                for (const item of appointment) {
                    const docs = await bookedslotsModel.getSession({
                        "therapistId": item.therapistId,
                        "userId": item.userId._id,
                        "$or": [{ "status": "appointment confirmed" }, { "status": "appointment closed" }]
                    })
                    console.log({
                        "therapistId": item.therapistId,
                        "userId": item.userId._id
                    })

                    session_details.push({
                        "therapistId": item.therapistId,
                        "userId": item.userId,
                        "session": docs
                    })
                }
                callback(null, session_details)
            }
        } else {
            callback(null, null)
        }


        // process.on('uncaughtException', (error)  => {

        //     console.log('Oh my god, something terrible happened: ',  error);

        //     process.exit(1); 

        // })

        // process.on('unhandledRejection', (error, promise) => {
        //     console.log(' Oh Lord! We forgot to handle a promise rejection here: ', promise);
        //     console.log(' The error was: ', error );
        // });
    });


}


const getAllEmployeeclient = (query, callback) => {
    bookedslotsModel.getBookedSlotsForTherapist_employee(query, async (err, res) => {
        if (err) {
            callback(err, null);
        } else if (res.length > 0) {
            console.log("res length", res.length)
            console.log("****************************************************");
            console.log(res);
            let appointment = res.filter((v, i, a) => a.findIndex(t => ((v.employeeId !== null) && (t.employeeId !== null) && (t.employeeId._id === v.employeeId._id))) === i)
            console.log("appointment length", appointment)
            if (appointment.length > 0) {
                let session_details = [];
                for (const item of appointment) {
                    const docs = await bookedslotsModel.getEmployeeSession({
                        "therapistId": item.therapistId,
                        "employeeId": item.employeeId._id,
                        "$or": [{ "status": "appointment confirmed" }, { "status": "appointment closed" }]
                    })
                    // console.log({
                    //     "therapistId": item.therapistId,
                    //     "userId": item.employeeId._id
                    // })

                    session_details.push({
                        "therapistId": item.therapistId,
                        "employeeId": item.employeeId,
                        "session": docs
                    })
                }
                callback(null, session_details)
            }
        } else {
            callback(null, null)
        }


        // process.on('uncaughtException', (error)  => {

        //     console.log('Oh my god, something terrible happened: ',  error);

        //     process.exit(1); 

        // })

        // process.on('unhandledRejection', (error, promise) => {
        //     console.log(' Oh Lord! We forgot to handle a promise rejection here: ', promise);
        //     console.log(' The error was: ', error );
        // });
    });


}

const getAllfinance = (query, callback) => {
    bookedslotsModel.getAllfinance(query, callback);
}

function logout(token, callback) {
    UserModel.logout(token, callback)
}

function appointmentCancelEmail(data, callback) {
    EmailTemplate.appointmentCancelEmail(data, callback)
}

function appointmentCancelEmail_employee(data, callback) {
    EmailTemplate.appointmentCancelEmail_employee(data, callback)
}

function appointmentCancelEmailTherapist(data, callback) {
    EmailTemplate.appointmentCancelEmailTherapist(data, callback)
}

function appointmentCancelEmailTherapist_employee(data, callback) {
    EmailTemplate.appointmentCancelEmailTherapist_employee(data, callback)
}

function updateNots(query, data, callback) {
    console.log("inside updateNots controller");
    therapistModel.updateTherapistNots(query, data, (err, res) => {
        if (err) {
            callback(err, null);
        } else if (res) {
            callback(null, res);
        } else {
            callback(null, null);
        }
    });
}


module.exports = {
    addProfile,
    findUserEmailPhone,
    getAllPostedProfile,
    getPostedProfileByOptions,
    capitaliseFirstLetter,
    getProfile,
    updateUser,
    getBookedSlots,
    logout,
    resetpsw,
    getAllfinance,
    appointmentCancelEmail,
    appointmentCancelEmailTherapist,
    updateNots,
    getAllclient,
    getBookedSlots_employee,
    getAllEmployeeclient,
    appointmentCancelEmail_employee,
    appointmentCancelEmailTherapist_employee
}
