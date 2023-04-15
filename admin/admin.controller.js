const adminModel = require('./admin.model')

const appointmentController = require('../appointment/appointment.controller')

const appointmentModel = require("../appointment/appointment.model")

const bookedslotsModel = require("../projects/model_helpers/bookslots_model.helper");

const validators = require("../../helpers/validators");

const EmailTemplate = require("../projects/model_helpers/email_template");

const bcrypt = require('bcryptjs');

function addNewAdmin(data, callback) {

    validators.hashPassword(data.password, (err, hash) => {
        if (err) {
            callback(err, null);
        } 
        else if (hash) {
            data.password = hash;
            adminModel.addNewAdmin(data, callback)
        } 
        else {
            callback(null, null);
        }
    });
}

function adminLogin(authString, callback) {
    console.log('inside userlogin');
    console.log(authString);
    validators.decodeAuthString(authString, (email_phone, password) => {
        console.log("decodeAuth");
        console.log('email', email_phone);
        console.log('password', password);
        if (email_phone && password) {
            adminModel.login(email_phone, (err, res) => {
                console.log("Admin MODEL");
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
                                callback(null, { token: token, role: res.role });
                            });
                        } else {
                            callback(null, null);
                        }
                    });
                }
                else if (res === "Invalid email") {
                    console.log("inside invalid email");
                    callback({ name: res }, null)
                }
                else {
                    console.log("inside else-----", res);
                    callback({ name: 'wrong mode of login' }, null);
                    // callback(null, null);
                }
            });
        } else {
            callback(null, null);
        }
    });
}

const findUserEmailPhone = (body, callback) => {
    console.log("inside findUserEmailPhone");
    console.log('body', body);
    adminModel.findUserEmailPhone(body, callback);
}

function forgotpsw(emailId, callback) {
    console.log("inside forgot pass controller");
    console.log(emailId);
    EmailTemplate.sendAdminForgotEmail({ emailId }, (err, res) => {
        if (err) {
            callback(err, null);
        } else if (res) {
            callback(null, res);
        } else {
            callback(null, null);
        }
    });
}

const resetpsw = (query, data, callback) => {
    validators.hashPassword(data, function (err, hash) {
        if (err) {
            console.log(`Error while hashing password:`, err);
        } else if (hash) {
            console.log('Successfully hashed password');
            data = hash;
            adminModel.findUserAndUpdate({ emailId: query }, { password: data }, callback);
        } else {
            console.log(`Could Not hash password:`);
            callback(null, null);
        }
    });
}

function getAllDoctors(callback) {

    adminModel.getAllDoctors(callback)
}

function downloadAllDoctors(callback) {
    adminModel.downloadAllDoctors(callback)
}

function getDoctorsById(query, callback) {
    adminModel.getDoctorsById(query, callback)
}

function updateDoctorsProfile(query, dataToBeUpdated, callback) {
    adminModel.updateDoctorsProfile(query, dataToBeUpdated, callback)
}

function getDoctorsAppointment(query, callback) {
    adminModel.getDoctorsAppointment(query, callback)
}

function getDoctorsAppointment_employee(query, callback) {
    adminModel.getDoctorsAppointment_employee(query, callback)
}

function getAllUsers(callback) {

    adminModel.getAllUsers(callback)
}

function getUsersById(query, callback) {
    adminModel.getUsersById(query, callback)
}

function getEmployeeById(query, callback) {
    console.log("inside", query);
    adminModel.getEmployeeById(query, callback)
}

function updateUsersProfile(query, dataToBeUpdated, callback) {
    adminModel.updateUsersProfile(query, dataToBeUpdated, callback)
}

function getUsersAppointmet(query, callback) {
    adminModel.getUsersAppointmet(query, callback)
}

function getAllBooking(data, callback) {
    // console.log(callback);
    adminModel.getAllBooking(data, callback)
}

function getAllEmployeeBooking(data, callback) {
    adminModel.getAllEmployeeBooking(data, callback)
}

function getBookingById(query, callback) {
    adminModel.getBookingById(query, callback)
}

function getEmployeeBookingById(query, callback) {
    adminModel.getEmployeeBookingById(query, callback)
}


function blockUser(data, callback) {
    adminModel.blockUser(data, (err, docs) => {
        if (err) {
            callback(err, null)
        }
        if (docs) {
            adminModel.getAllUsers(callback)
        }
        else {
            callback(null, null)
        }
    })
}

function unblockuser(data, callback) {
    adminModel.unblockuser(data, (err, docs) => {
        if (err) {
            callback(err, null)
        }
        if (docs) {
            adminModel.getAllUsers(callback)
        }
        else {
            callback(null, null)
        }
    })
}

function blockDoctor(data, callback) {
    adminModel.blockDoctor(data, (err, docs) => {
        if (err) {
            callback(err, null)
        }
        if (docs) {
            adminModel.getAllDoctors(callback)
        }
        else {
            callback(null, null)
        }
    })
}

function unblockDoctor(data, callback) {
    adminModel.unblockDoctor(data, (err, docs) => {
        if (err) {
            callback(err, null)
        }
        if (docs) {
            adminModel.getAllDoctors(callback)
        }
        else {
            callback(null, null)
        }
    })
}

function editDoctor(data, callback) {
    adminModel.editDoctor(data, (err, docs) => {
        if (err) {
            callback(err, null)
        }
        console.log(docs)
        if (docs) {
            adminModel.getAllDoctors(callback)
        }
        else {
            callback(null, null)
        }
    })
}

function editUser(data, callback) {
    adminModel.editUser(data, (err, docs) => {
        if (err) {
            callback(err, null)
        }
        console.log(docs)
        if (docs) {
            adminModel.getAllUsers(callback)
        }
        else {
            callback(null, null)
        }
    })
}
function getAllAppointment(callback) {
    adminModel.getAllAppointment(callback)
}

function getCompanyAppointments(data, callback) {
    console.log("data", data);
    adminModel.getCompanyAppointments(data, callback)
}

// const getCompanyAppointments = (query, callback) => {
//     let data = {};
//     bookedslotsModel.getBookedSlotsForDoctor_employee(data, callback)
// }

function getAllPayment(callback) {
    adminModel.getAllPayment(callback)
}

function cancelappointment(body, callback) {
    appointmentModel.cancelappointment(body, (err, doc) => {
        if (err) {
            callback(err, null)
        }
        console.log(doc)
        if (doc) {
            doc.forEach((e) => {
                if ((e.bookedslots.date == body.availableSlots[0].date) && (e.bookedslots.day.toLowerCase() == body.availableSlots[0].day.toLowerCase())) {
                    e.bookedslots.slots.forEach((element, index) => {
                        console.log(element.from + "" + body.availableSlots[0].slots[0].from)
                        if (element.from == body.availableSlots[0].slots[0].from) {
                            element.cancel_appointment = true
                            console.log("guguuggiu" + JSON.stringify(e.bookedslots))
                            appointmentModel.cancelappointmentsave(body, e.bookedslots, (err, result) => {
                                if (err) {
                                    callback(null, null)
                                }
                                console.log(result + "" + JSON.stringify(result))
                                if (result) {
                                    appointmentController.getTimeSlots({ doctorId: body.doctorId }, (err, docs) => {
                                        if (err) {
                                            callback(err, null)
                                        }
                                        console.log(JSON.stringify(docs))
                                        if (docs) {
                                            let timeSlot = docs.availableSlots
                                            appointmentController.calendar({ doctorId: body.doctorId }, (err, document) => {
                                                if (err) {
                                                    resp.errorResponse(res, err, 501, 'Error While fetching data');
                                                }
                                                if (document) {
                                                    console.log(document)
                                                    appointmentController.calendarCore(document, timeSlot, (err, result) => {
                                                        if (err) {
                                                            resp.errorResponse(res, err, 501, 'Error While fetching data');
                                                        }
                                                        if (result) {
                                                            //console.log("resut"+JSON.stringify)
                                                            appointmentController.getdeleteslot({ doctorId: body.doctorId }, { "availableSlots": result }, (err, results) => {
                                                                if (err) {
                                                                    callback(err, null)
                                                                }
                                                                if (results) {
                                                                    callback(null, results)
                                                                }
                                                            })
                                                        }
                                                        else {
                                                            resp.noRecordsFound(res, 'Unable to fetch timeslots List');
                                                        }
                                                    })
                                                } else {
                                                    resp.successGetResponse(res, null, 'timeslots List');
                                                }

                                            })
                                        } else {
                                            callback(null, null)
                                        }

                                    })
                                }
                            });
                        }
                    })
                }
            })
        } else {
            callback(null, null)
        }
    })

}

function addDoctorId(data, callback) {
    adminModel.addDoctorId(data, callback)
    }

function generateCoupon(data, callback) {
    adminModel.generateCoupon(data, callback)
}

function getAllCoupon(data, callback) {
    adminModel.getAllCoupon(data, callback)
}

function updateCoupon(query, data, callback) {
    adminModel.updateCoupon(query, data, callback)
}


function deleteCoupon(query, callback) {
    adminModel.deleteCoupon(query, callback)
}

function getIncomingAccounts(callback) {
    adminModel.getIncomingAccounts(callback)
}

function getOutingAccounts(callback) {
    adminModel.getOutingAccounts(callback)
}

function getAllDoctorCalender(callback) {
    adminModel.getAllDoctorCalender(callback)
}

function getAllCorporateCalender(callback) {
    adminModel.getAllCorporateCalender(callback)
}

function changeBookingStatus(query, data, callback) {
    adminModel.changeBookingStatus(query, data, callback)
}

function changeEmployeeBookingStatus(query, data, callback) {
    adminModel.changeEmployeeBookingStatus(query, data, callback)
}

function updateAllAppointments(query, callback) {
    adminModel.updateAllAppointments(query, callback)
}

function updateAllAppointmentsById(query, callback) {
    adminModel.updateAllAppointmentsById(query, callback)
}

module.exports = {
    addNewAdmin,
    adminLogin,
    findUserEmailPhone,
    forgotpsw,
    resetpsw,
    getAllDoctors,
    downloadAllDoctors,
    getAllUsers,
    blockUser,
    unblockuser,
    blockDoctor,
    unblockDoctor,
    editDoctor,
    editUser,
    getAllAppointment,
    getAllPayment,
    cancelappointment,
    getDoctorsById,
    updateDoctorsProfile,
    getUsersById,
    updateUsersProfile,
    getUsersAppointmet,
    getDoctorsAppointment,
    getDoctorsAppointment_employee,
    getAllBooking,
    getBookingById,
    generateCoupon,
    getAllCoupon,
    updateCoupon,
    deleteCoupon,
    getIncomingAccounts,
    getAllDoctorCalender,
    changeBookingStatus,
    updateAllAppointments,
    updateAllAppointmentsById,
    getOutingAccounts,
    getAllCorporateCalender,
    getAllEmployeeBooking,
    getEmployeeBookingById,
    changeEmployeeBookingStatus,
    getEmployeeById,
    getCompanyAppointments,
    addDoctorId
}