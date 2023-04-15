const express = require('express');
const router = express.Router();
const appointmentController = require("../appointment/appointment.controller");
const employeeCtrl = require('../company_employee/employee.controller');
const adminController = require('../admin/admin.controller');
const companyCtrl = require('../company/company.controller');
const resp = require("../../helpers/responseHelpers");
const { Route53Resolver } = require('aws-sdk');
const timeSlots = require('../projects/models/timeslots.model')
const bookSlots = require('../projects/models/bookslots.model')
const users = require('../projects/models/users.model')
const EmailTemplate = require("../projects/model_helpers/email_template");
const Razorpay = require('razorpay');
const moment = require('moment');
var request = require('request');
module.exports = router;


router.get('/getTimeSlots', (req, res) => {
    console.log("slots", req.query);
    if (req.query) {
        appointmentController.getTimeSlotsAvailabilty(req.query, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While fetching timeslots');
            } else if (docs) {
                // console.log("docs timeslots", docs)
                resp.successGetResponse(res, docs, 'timeslots List');

            } else {
                resp.noRecordsFound(res, 'No slots found');
            }
        })

    }
})


router.post('/createBooking', (req, res) => {
    console.log("inside bookappointments", req.body);
    if (req.body) {
        //reciept ID
        var receiptId = Math.floor(1000 + Math.random() * 9000);
        receiptId = 'order_rcptid_' + receiptId;
        console.log(receiptId);
        var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_SECRET_KEY })

        var options = {
            amount: (req.body.payment.fee) * 100,  // amount in the smallest currency unit
            currency: req.body.payment.currency,
            receipt: receiptId
        };

        // appointmentController.bookTimeSlots(req.body, (err, docs) => {
        //     if (err) {
        //         console.log(err)
        //         resp.errorResponse(res, err, 501, 'Error While booking appointment');
        //     } else if (docs) {
        //         // if (req.body.payment.fee == 0) {
        //         //     docs['payout_status'] = 'paid';
        //         // }
        //         console.log('----------------------------------------------------------------------------------------------------------');
        //         console.log(res);
        //         console.log('----------------------------------------------------------------------------------------------------------');
        //         if(res.body){

        //             console.log(res.body.payment);
        //             console.log(res.body.bookedslots);
        //         }
        //         console.log('----------------------------------------------------------------------------------------------------------');
        //         console.log('----------------------------------------------------------------------------------------------------------');
        //         resp.successGetResponse(res, docs, 'appointment created successfully');
        //     } else {
        //         resp.noRecordsFound(res, 'Unable to book appointment');
        //     }
        // })


        instance.orders.create(options, function (err, order) {
            if (err) {
                console.log("err", err)
                resp.errorResponse(res, err, 501, 'Error While creating orderId');
            } else if (order) {
                console.log("order", order);
                // convert date-time string to timestamp
                let date = req.body.bookedslots.date;
                let time = req.body.bookedslots.slots[0].from;
                console.log("date", date)
                console.log("time", time)
                let dateMomentObject = moment(date + ' ' + time, "DD/MM/YYYY hh:mm:A");
                console.log("dateMomentObject", dateMomentObject.toDate());
                let formated_date = moment(dateMomentObject.toDate()).format('DD/MM/YYYY hh:mm:A');
                console.log("formated_date", formated_date);
                req.body["order"] = order;
                req.body["bookedSlotsTime"] = dateMomentObject.toDate();
                req.body["previous_bookedSlotsTime"] = dateMomentObject.toDate();
                req.body["rescheduled"] = false;
                appointmentController.bookTimeSlots(req.body, (err, docs) => {
                    if (err) {
                        console.log(err)
                        resp.errorResponse(res, err, 501, 'Error While booking appointment');
                    } else if (docs) {
                        resp.successGetResponse(res, docs, 'appointment created successfully');
                    } else {
                        resp.noRecordsFound(res, 'Unable to book appointment');
                    }
                })
            } else {
                console.log("else")
                resp.noRecordsFound(res, 'Unable to create orderId');
            }

        });
    }
})

router.put('/rescheduleEmployeeBooking', (req, res) => {
    const query = {};
    query['_id'] = req.query.bookingId;

    let date = req.body.updatedData.bookedslots.date;
    let time = req.body.updatedData.bookedslots.slots[0].from;
    let dateMomentObject = moment(date + ' ' + time, "DD/MM/YYYY hh:mm:A");
    let formated_date = moment(dateMomentObject.toDate()).format('DD/MM/YYYY hh:mm:A')
    req.body.updatedData["bookedSlotsTime"] = dateMomentObject.toDate();
    req.body.updatedData['status'] = "appointment confirmed";

    if (req.body && req.query) {
        employeeCtrl.getBookedSlotsById(query, (err, docs) => {
            if (err) {
                console.log("err1", err);
                resp.errorResponse(res, err, 501, 'Error While fetching BookingSlots');
            } else if (docs.length > 0) {

                //updating reschedule_count
                for (item of docs) {
                    if (item.rescheduled_count === null) {
                        var rescheduleCount = 1;
                    } else {
                        var rescheduleCount = item.rescheduled_count + 1;
                    }
                }
                req.body.updatedData['rescheduled_count'] = rescheduleCount;
                if (rescheduleCount < 2 || rescheduleCount === null) {
                    req.body.updatedData['rescheduled'] = false;
                } else {
                    req.body.updatedData['rescheduled'] = true;
                }

                //update Doctor profile if both doctors are not same
                let corperate_appointments;
                if (JSON.stringify(docs[0].doctorId["_id"]) !== JSON.stringify(req.body.updatedData["doctorId"])) {
                    corperate_appointments = docs[0].doctorId["corperate_appointments"] - 1;
                    query["_id"] = docs[0].doctorId["_id"];
                    let dataToBeUpdated = {
                        "corperate_appointments": corperate_appointments
                    }
                    adminController.updateDoctorsProfile(query, dataToBeUpdated, (err, docs1) => {
                        if (err) {
                            console.log("err2");
                            resp.errorResponse(res, err, 501, 'Error While updating doctor');
                        }
                        if (docs1) {
                            console.log("err3");
                            query["_id"] = req.body.updatedData["doctorId"];
                            adminController.getDoctorsById(query, (err, docs2) => {
                                if (err) {
                                    console.log("err5");
                                    resp.errorResponse(res, err, 501, 'Error While getting doctor');
                                }
                                if (docs2) {
                                    console.log("err6");
                                    var appointmentCount = 1;
                                    if (docs2[0].corperate_appointments) {
                                        appointmentCount = docs2[0].corperate_appointments + 1;
                                    }
                                    const dataToBeUpdated = {
                                        "corperate_appointments": appointmentCount
                                    };
                                    console.log(query);
                                    console.log(dataToBeUpdated);
                                    adminController.updateDoctorsProfile(query, dataToBeUpdated, (err, docs3) => {
                                        if (err) {
                                            console.log("err7");
                                            resp.errorResponse(res, err, 501, 'Error While updating doctor');
                                        }
                                        if (docs3) {
                                            console.log("err8");
                                        }
                                        else {
                                            console.log("err9");
                                            resp.noRecordsFound(res, 'Unable to update doctors');
                                        }
                                    })

                                } else {
                                    console.log("err10");
                                    resp.noRecordsFound(res, 'Unable to get doctors');
                                }
                            })
                        }
                        else {
                            console.log("err4");
                            resp.noRecordsFound(res, 'Unable to update doctors');
                        }
                    })
                }

                //updating doctor profile of new doctor
                query["_id"] = req.query.bookingId;
                dataToBeUpdated = req.body.updatedData;

                //updating Booking
                employeeCtrl.updateBooking(query, dataToBeUpdated, (err, docs5) => {
                    if (err) {
                        console.log("err11");
                        console.log(err)
                        resp.errorResponse(res, err, 501, 'Error While booking timeslots2');
                    } else if (docs5) {
                        console.log("err12");
                        console.log("rescheduleed docs//////////", docs5);
                        // success email reschedule doctor


                        var email_data = {
                            "order_id": docs5._id,
                            "employee_email_id": docs5.employeeId.emailId,
                            "user_first_name": docs5.employeeId.first_name,
                            "bookedslots_date": docs5.bookedslots.date,
                            "bookedslots_from": docs5.bookedslots.slots[0].from + " to " + docs5.bookedslots.slots[0].to,
                            "doctor_name": docs5.doctorId.name,
                            "doctor_email_id": docs5.doctorId.emailId,
                        };
                        console.log("email_data", email_data);
                        EmailTemplate.employeerescheduleAppointmentEmail(email_data, (err, res) => {
                            if (err) {
                                // callback(err, null);
                                console.log("error");
                            } else if (res) {
                                // callback(null, res);
                                console.log("succcess", res);
                            } else {
                                // callback(null, null);
                                console.log("missed");
                            }
                        });
                        resp.successGetResponse(res, docs5.bookedslots, 'rescheduled appointment successfully');
                    } else {
                        console.log("err13");
                        resp.noRecordsFound(res, 'Unable to update slots');
                    }
                })
            }

            else {
                console.log("err14");
                resp.noRecordsFound(res, 'Unable to get Slots');
            }
        })
    }
})

router.post('/createEmployeeAppointment', (req, res) => {
    console.log("inside bookappointments", req.body);
    if (req.body) {
        // convert date-time string to timestamp
        let employeeId = req.body.employeeId;
        let date = req.body.bookedslots.date;
        let time = req.body.bookedslots.slots[0].from;
        console.log("date", date)
        console.log("time", time)
        let dateMomentObject = moment(date + ' ' + time, "DD/MM/YYYY hh:mm:A");
        var options_d = dateMomentObject.toDate();
        options_d = moment(options_d).format('YYYY-MM-DD HH:mm:ss') + ".000Z";
        options_d = options_d.replace(' ', 'T');

        console.log("dateMomentObject", dateMomentObject.toDate());
        let formated_date = moment(dateMomentObject.toDate()).format('DD/MM/YYYY hh:mm:A');
        console.log("formated_date", formated_date);
        req.body["bookedSlotsTime"] = dateMomentObject.toDate();
        req.body["previous_bookedSlotsTime"] = dateMomentObject.toDate();
        req.body["rescheduled"] = false;


        let options = {
            "doctorId": req.body.doctorId,
            "bookedSlotsTime": options_d
        }
        console.log("options", options);
        employeeCtrl.getRemainingSlots_employee(options, (err, slots_docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While booking appointment');
            } else if (slots_docs) {
                slots_docs = [];
                resp.successGetResponse(res, slots_docs, 'already booked');
            } else {
                employeeCtrl.bookTimeSlots(req.body, (err, docs) => {
                    if (err) {
                        console.log(err)
                        resp.errorResponse(res, err, 501, 'Error While booking appointment');
                    } else if (docs) {
                        let query = {
                            '_id': req.body['doctorId']
                        };
                        adminController.getDoctorsById(query, (err, docs1) => {
                            if (err) {
                                resp.errorResponse(res, err, 501, 'Error While getting doctor');
                            }
                            if (docs1) {
                                console.log("]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]", docs);
                                var appointmentCount = 1;
                                if (docs1[0].corperate_appointments) {
                                    appointmentCount = docs1[0].corperate_appointments + 1;
                                }
                                const dataToBeUpdated = {
                                    "corperate_appointments": appointmentCount
                                };
                                adminController.updateDoctorsProfile(query, dataToBeUpdated, (err, docs2) => {
                                    if (err) {
                                        resp.errorResponse(res, err, 501, 'Error While updating doctor');
                                    }
                                    if (docs2) {
                                        employeeCtrl.UpdateVideoUrl(docs, (err, docs3) => {
                                            if (err) {
                                                resp.errorResponse(res, err, 501, 'Error While Creating Appointment');
                                            } else if (docs3) {
                                                let query = {};
                                                query["_id"] = employeeId;
                                                employeeCtrl.getEmployeeById(query, (err, employeeDetails) => {
                                                    if (err) {
                                                        resp.errorResponse(res, err, 501, 'Error While fetching employee');
                                                    } else if (employeeDetails) {
                                                        console.log("ddddkjkjddddddddddddddddddddddddddd", employeeDetails);
                                                        let query = {
                                                            "id": employeeDetails[0].companyId["_id"]
                                                        };
                                                        let updatedQuery = {};
                                                        if (employeeDetails[0].companyId["remaining_sessions"] > 0) {
                                                            updatedQuery["remaining_sessions"] = employeeDetails[0].companyId["remaining_sessions"] - 1
                                                        } else {
                                                            updatedQuery["blocked"] = true
                                                        }
                                                        companyCtrl.updateCompany(query, updatedQuery, (err, companyDetails) => {
                                                            if (err) {
                                                                resp.errorResponse(res, err, 501, 'Error While updating company');
                                                            } else if (companyDetails) {
                                                                console.log("EMPLOYEEE DETAILS//////", companyDetails);
                                                                var email_data = {
                                                                    "emailId": docs3.employeeId.emailId,
                                                                    "user_first_name": docs3.employeeId.first_name,
                                                                    "order_id": docs3._id,
                                                                    "bookedslots_date": docs3.bookedslots.date,
                                                                    "bookedslots_slots_from": docs3.bookedslots.slots[0].from + " to " + docs3.bookedslots.slots[0].to,
                                                                    "doctor_name": docs3.doctorId.name
                                                                };
                                                                var doctor_email_data = {
                                                                    "emailId": docs3.doctorId.emailId,
                                                                    "user_first_name": docs3.employeeId.first_name,
                                                                    "order_id": docs3._id,
                                                                    "bookedslots_date": docs3.bookedslots.date,
                                                                    "bookedslots_slots_from": docs3.bookedslots.slots[0].from + " to " + docs3.bookedslots.slots[0].to,
                                                                    "doctor_name": docs3.doctorId.name
                                                                };
                                                                EmailTemplate.employeebookingConfirmationEmail(email_data, (err, res) => {
                                                                    if (err) {
                                                                        // callback(err, null);
                                                                        console.log("error");
                                                                    } else if (res) {
                                                                        // callback(null, res);
                                                                        console.log("succcess", res);
                                                                    } else {
                                                                        // callback(null, null);
                                                                        console.log("missed");
                                                                    }
                                                                });
                                                                EmailTemplate.doctorbookingConfirmationEmail(doctor_email_data, (err, res) => {
                                                                    if (err) {
                                                                        // callback(err, null);
                                                                        console.log("error");
                                                                    } else if (res) {
                                                                        // callback(null, res);
                                                                        console.log("succcess", res);
                                                                    } else {
                                                                        // callback(null, null);
                                                                        console.log("missed");
                                                                    }
                                                                });
                                                                console.log(",,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,", docs3);
                                                                resp.successGetResponse(res, docs3, 'appointment created successfully');
                                                            } else {
                                                                resp.noRecordsFound(res, 'No Company Found');
                                                            }
                                                        })
                                                    } else {
                                                        resp.noRecordsFound(res, 'No Employee Found');
                                                    }
                                                })
                                            } else {
                                                // fetching employee details if unable to book appointment send email for unsuccessfull booking
                                                let query = {};
                                                query["_id"] = employeeId;
                                                employeeCtrl.getEmployeeById(query, (err, employeeDetails_failure) => {
                                                    if (err) {
                                                        resp.errorResponse(res, err, 501, 'Error While fetching employee');
                                                    } else if (employeeDetails_failure) {
                                                        var email_data = {
                                                            "emailId": employeeDetails_failure[0].emailId,
                                                            "user_first_name": employeeDetails_failure[0].first_name,
                                                        };
                                                        console.log("email_data", email_data);
                                                        EmailTemplate.employeebookingUnsuccessEmail(email_data, (err, res) => {
                                                            if (err) {
                                                                // callback(err, null);
                                                                console.log("error");
                                                            } else if (res) {
                                                                // callback(null, res);
                                                                console.log("succcess", res);
                                                            } else {
                                                                // callback(null, null);
                                                                console.log("missed");
                                                            }
                                                        });
                                                        resp.noRecordsFound(res, 'Unable to book appointment');
                                                    }
                                                })
                                            }
                                        })
                                    }
                                    else {
                                        resp.noRecordsFound(res, 'Unable to update doctors');
                                    }
                                })
                            }
                            else {
                                resp.noRecordsFound(res, 'Unable to get doctors');
                            }
                        })

                    } else {
                        // booking unsuccessfull
                        // fetching employee details if unable to book appointment send email for unsuccessfull booking
                        let query = {};
                        query["_id"] = employeeId;
                        employeeCtrl.getEmployeeById(query, (err, employeeDetails_failure) => {
                            if (err) {
                                resp.errorResponse(res, err, 501, 'Error While fetching employee');
                            } else if (employeeDetails_failure) {
                                var email_data = {
                                    "emailId": employeeDetails_failure[0].emailId,
                                    "user_first_name": employeeDetails_failure[0].first_name,
                                };
                                console.log("email_data", email_data);
                                EmailTemplate.employeebookingUnsuccessEmail(email_data, (err, res) => {
                                    if (err) {
                                        // callback(err, null);
                                        console.log("error");
                                    } else if (res) {
                                        // callback(null, res);
                                        console.log("succcess", res);
                                    } else {
                                        // callback(null, null);
                                        console.log("missed");
                                    }
                                });
                                resp.noRecordsFound(res, 'Unable to book appointment');
                            }
                        })
                    }
                })

            }
        })
    }
})

router.put('/updateBooking', (req, res) => {
    console.log("inside updateBooking query", req.query);
    console.log("inside updateBooking body", req.body);
    const query = {};
    query['_id'] = req.query.bookingId;
    const dataToBeUpdated = req.body.updatedData
    if (req.body && req.query) {
        appointmentController.updateBooking(query, dataToBeUpdated, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While booking timeslots');
            } else if (docs) {
                console.log("docs", docs)
                result = {
                    "booking_id": docs._id,
                    "booking_status": docs.booking_status
                }
                if (docs.booking_status === "paid") {
                    resp.successGetResponse(res, result, 'booking success');
                } else {
                    resp.unsuccessGetResponse(res, result, 'booking failed');
                }

            } else {
                resp.noRecordsFound(res, 'Unable to book doctors timeslots');
            }
        })
    }
})

router.put('/confirmBooking', (req, res) => {
    console.log("inside confirmBooking query", req.query);
    console.log("inside confirmBooking body", req.body);
    const query = {};
    query['_id'] = req.query.bookingId;
    const dataToBeUpdated = req.body.updatedData
    if (req.body && req.query) {
        appointmentController.updateBooking(query, dataToBeUpdated, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While booking timeslots');
            } else if (docs) {
                console.log("docs", docs)
                resp.successGetResponse(res, docs, 'booking confirmed');
            } else {
                resp.noRecordsFound(res, 'Unable to book doctors timeslots');
            }
        })
    }
})

router.put('/rescheduleBooking', (req, res) => {
    console.log("inside rescheduleBooking query", req.query);
    console.log("inside rescheduleBooking body", req.body);
    const query = {};
    query['_id'] = req.query.bookingId;

    let date = req.body.updatedData.bookedslots.date;
    let time = req.body.updatedData.bookedslots.slots[0].from;
    console.log("date", date)
    console.log("time", time)
    let dateMomentObject = moment(date + ' ' + time, "DD/MM/YYYY hh:mm:A");
    console.log("dateMomentObject", dateMomentObject.toDate())
    let formated_date = moment(dateMomentObject.toDate()).format('DD/MM/YYYY hh:mm:A')
    console.log("formated_date", formated_date)
    req.body.updatedData["bookedSlotsTime"] = dateMomentObject.toDate();
    req.body.updatedData['status'] = "appointment confirmed";

    if (req.body && req.query) {
        appointmentController.getBookedSlotsById(query, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While fetching BookingSlots');
            } else if (docs.length > 0) {
                console.log("docs timeslots", docs)
                for (item of docs) {
                    console.log("#######################################################", item.rescheduled_count);
                    console.log("*********************************************************************", item);
                    if (item.rescheduled_count === null) {
                        var rescheduleCount = 1;
                    } else {
                        var rescheduleCount = item.rescheduled_count + 1;
                    }
                }
                req.body.updatedData['rescheduled_count'] = rescheduleCount;
                console.log("/////////////////////reschedule Count/////////////", rescheduleCount);
                if (rescheduleCount < 2 || rescheduleCount === null) {
                    req.body.updatedData['rescheduled'] = false;
                } else {
                    req.body.updatedData['rescheduled'] = true;
                }
                const dataToBeUpdated = req.body.updatedData
                console.log("dataToBeUpdated", dataToBeUpdated)

                appointmentController.updateBooking(query, dataToBeUpdated, (err, docs) => {
                    if (err) {
                        console.log(err)
                        resp.errorResponse(res, err, 501, 'Error While booking timeslots2');
                    } else if (docs) {
                        console.log("docs", docs)
                        appointmentController.appointmentRescheduleEmail(docs, function (err, docs) {
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

                        resp.successGetResponse(res, docs.bookedslots, 'rescheduled appointment successfully');
                    } else {
                        resp.noRecordsFound(res, 'Unable to book doctors timeslots');
                    }
                })

            } else {
                resp.noRecordsFound(res, 'No slots found');
            }
        })


    }
})

router.put('/addFeedback', (req, res) => {
    console.log("inside updateFeedback query", req.query);
    console.log("inside updateFeedback body", req.body);
    const query = {};
    query['_id'] = req.query.bookingId;
    const dataToBeUpdated = req.body.updatedData
    if (req.body && req.query) {
        appointmentController.updateBooking(query, dataToBeUpdated, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While added feedback');
            } else if (docs) {
                console.log("docs", docs)
                appointmentController.feedbackEmail(docs, function (err, docs) {
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
                result = {
                    "feedback": docs.feedback,
                    "anonymous": docs.anonymous,
                    "rating": docs.rating,
                    "comments": docs.comments,
                    "status": docs.status
                }
                resp.successGetResponse(res, result, 'feedback added successfully');
            } else {
                resp.noRecordsFound(res, 'Unable to add feedback');
            }
        })
    }
})


router.put('/addEmployeeFeedback', (req, res) => {
    console.log("inside updateFeedback query", req.query);
    console.log("inside updateFeedback body", req.body);
    const query = {};
    query['_id'] = req.query.bookingId;
    const dataToBeUpdated = req.body.updatedData
    if (req.body && req.query) {
        appointmentController.updateEmployeeBooking(query, dataToBeUpdated, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While added feedback');
            } else if (docs) {
                console.log("docs", docs)
                // appointmentController.feedbackEmail(docs, function (err, docs) {
                //     if (err) {
                //         console.log("sendgrid err", err);
                //resp.errorResponse(res,err,501,"Internal Server Error, Please Try Again Later");
                // } else if (docs) {
                //     console.log("sendgrid docs", docs);
                //resp.successPostResponse(res,null,`Password Reset Link Has Been Sent To Your Email Id ${req.body.emailId}`);
                // } else {
                //     console.log("sendgrid else");
                //resp.noRecordsFound(res, "Invalid Email Id");
                // }
                // });
                result = {
                    "feedback": docs.feedback,
                    "anonymous": docs.anonymous,
                    "rating": docs.rating,
                    "comments": docs.comments,
                    "status": docs.status
                }
                resp.successGetResponse(res, result, 'feedback added successfully');
            } else {
                resp.noRecordsFound(res, 'Unable to add feedback');
            }
        })
    }
})

router.put('/doctorFeedback', (req, res) => {
    console.log("inside updateFeedback query", req.query);
    console.log("inside updateFeedback body", req.body);
    if (req.body && req.query) {
        let bookingId = req.query.bookingId;
        appointmentController.getBookedSlotsById(bookingId, (err, response) => {
            if (err) {
                console.log("err", err);
                resp.errorResponse(res, err, 501, 'Error While getting bookedslots');
            } else if (response) {
                // if it was user
                // console.log("res", response);
                // let video_call_id = req.query['bookingId'];
                console.log("req.query.bookingId", req.query.bookingId);
                console.log("req.body.updatedData", req.body.updatedData);
                if (req.body) {
                    const query = {};
                    query['_id'] = req.query.bookingId;
                    // const dataToBeUpdated = req.body;
                    const requestBody = req.body.updatedData;
                    const dataToBeUpdated = {
                        "doctor_notes": requestBody.doctor_notes,
                        "doctor_rating": requestBody.doctor_rating,
                        "doctor_comments": requestBody.doctor_comments,
                        "status": requestBody.status,
                        "doctor_logout_time": requestBody.doctor_logout_time,
                        "doctor_login_time": requestBody.doctor_login_time
                    };
                    // console.log("dataToBeUpdated",dataToBeUpdated);
                    appointmentController.updateBooking(query, dataToBeUpdated, (err, docs) => {
                        if (err) {
                            console.log(err)
                            resp.errorResponse(res, err, 501, 'Error While added feedback');
                        } else if (docs) {
                            // console.log("docs :::::>>>", docs)
                            result = {
                                "doctor_notes": docs.doctor_notes,
                                "doctor_rating": docs.doctor_rating,
                                "doctor_comments": docs.doctor_comments,
                                "doctor_logout_time": docs.doctor_logout_time,
                                "doctor_login_time": docs.doctor_login_time,
                                "status": docs.status
                            }
                            resp.successGetResponse(res, result, 'feedback added successfully');
                        } else {
                            resp.noRecordsFound(res, 'Unable to add feedback');
                        }
                    })
                } else {
                    resp.noRecordsFound(res, 'Unable to get any response from superpro');
                }
                // if (video_call_id!=null) {
                //     //call superpro api
                //     request({
                //         method: "POST",
                //         url: "https://roomsvc-dot-sprpro-282209.el.r.appspot.com/videocallend",
                //         body: {
                //             "videoCallId": video_call_id,
                //         },
                //         json: true,
                //         headers: {
                //             "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cnVldGVjaGxhYnMiLCJidXNpbmVzc0lkIjoiZmZRd0RFbjdNRHpjek9kRzFHZEUiLCJtb2RlIjoicHJvZCIsImFjY2Vzc0xldmVsIjoiMCIsInZpZFN1YkRvbWFpbiI6Imh0dHBzOi8vbWVldC5yeXQubGlmZSIsImFkbWluIjp0cnVlLCJpYXQiOjE2MjAyMDg2MDF9.aVh3VZVmEXItHR89amz5HFZmQyMzRNcsrQCNeER3DL5nX2qR4KBlkU5FQPZfJ5Q2d7Qyn3Slzkgpx1ho5f9oUhQDa3AemAhKZbmKIGCy3FfTKlA32VwN34iGk-B4CWK6ZXJ0sg0NgXVgRtKq2iF6N5rtZVzzs93D344Pj2AuiRY",
                //             "Accept": "application/json"
                //         }

                //     }, (error, response, body) => {
                //         console.log("superpro error", error);
                //         console.log('superpro body:', body);
                //         if (error) {
                //             resp.unsuccessGetResponse(res, error, 'unable to end superpro videocall');
                //         } else if (body) {
                //             const query = {};
                //             query['_id'] = req.query.bookingId;
                //             const dataToBeUpdated = req.body.updatedData
                //             appointmentController.updateBooking(query, dataToBeUpdated, (err, docs) => {
                //                 if (err) {
                //                     console.log(err)
                //                     resp.errorResponse(res, err, 501, 'Error While added feedback');
                //                 } else if (docs) {
                //                     console.log("docs", docs)
                //                     result = {
                //                         "doctor_notes": docs.doctor_notes,
                //                         "doctor_rating": docs.doctor_rating,
                //                         "doctor_comments": docs.doctor_comments,
                //                         "status": docs.status
                //                     }
                //                     resp.successGetResponse(res, result, 'feedback added successfully');
                //                 } else {
                //                     resp.noRecordsFound(res, 'Unable to add feedback');
                //                 }
                //             })
                //         } else {
                //             resp.noRecordsFound(res, 'Unable to get any response from superpro');
                //         }
                //     })
                // } else {
                //     console.log("else");
                //     resp.noRecordsFound(res, 'Unable to get videocall id');
                // }
            } else {
                // if it was employeee
                appointmentController.getEmployeeBookedSlotsById(bookingId, (err, response) => {
                    if (err) {
                        console.log("err", err);
                        resp.errorResponse(res, err, 501, 'Error While getting bookedslots');
                    } else if (response) {
                        // console.log("res", response);
                        // let video_call_id = response[0].;
                        // console.log("video_call_id", video_call_id)
                        console.log("req.query.bookingId", req.query.bookingId);
                        console.log("req.body.updatedData", req.body.updatedData);
                        if (body) {
                            const query = {};
                            // query['_id'] = req.query.bookingId;
                            // const dataToBeUpdated = req.body.updatedData
                            query['_id'] = req.query.bookingId;
                            const dataToBeUpdated = req.body;
                            appointmentController.updateEmployeeBooking(query, dataToBeUpdated, (err, docs) => {
                                if (err) {
                                    console.log(err)
                                    resp.errorResponse(res, err, 501, 'Error While added feedback');
                                } else if (docs) {
                                    console.log("docs", docs)
                                    result = {
                                        "doctor_notes": docs.doctor_notes,
                                        "doctor_rating": docs.doctor_rating,
                                        "doctor_comments": docs.doctor_comments,
                                        "status": docs.status
                                    }
                                    resp.successGetResponse(res, result, 'feedback added successfully');
                                } else {
                                    resp.noRecordsFound(res, 'Unable to add feedback');
                                }
                            })
                        } else {
                            resp.noRecordsFound(res, 'Unable to get any response from superpro');
                        }
                    }
                
                        // if (video_call_id) {
                        //     //call superpro api
                        //     request({
                        //         method: "POST",
                        //         url: "https://roomsvc-dot-sprpro-282209.el.r.appspot.com/videocallend",
                        //         body: {
                        //             "videoCallId": video_call_id,
                        //         },
                        //         json: true,
                        //         headers: {
                        //             "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cnVldGVjaGxhYnMiLCJidXNpbmVzc0lkIjoiZmZRd0RFbjdNRHpjek9kRzFHZEUiLCJtb2RlIjoicHJvZCIsImFjY2Vzc0xldmVsIjoiMCIsInZpZFN1YkRvbWFpbiI6Imh0dHBzOi8vbWVldC5yeXQubGlmZSIsImFkbWluIjp0cnVlLCJpYXQiOjE2MjAyMDg2MDF9.aVh3VZVmEXItHR89amz5HFZmQyMzRNcsrQCNeER3DL5nX2qR4KBlkU5FQPZfJ5Q2d7Qyn3Slzkgpx1ho5f9oUhQDa3AemAhKZbmKIGCy3FfTKlA32VwN34iGk-B4CWK6ZXJ0sg0NgXVgRtKq2iF6N5rtZVzzs93D344Pj2AuiRY",
                        //             "Accept": "application/json"
                        //         }

                        //     }, (error, response, body) => {
                        //         console.log("superpro error", error);
                        //         console.log('superpro body:', body);
                        //         if (error) {
                        //             resp.unsuccessGetResponse(res, error, 'unable to end superpro videocall');
                        //         } else if (body) {
                        //             const query = {};
                        //             query['_id'] = req.query.bookingId;
                        //             const dataToBeUpdated = req.body.updatedData
                        //             appointmentController.updateEmployeeBooking(query, dataToBeUpdated, (err, docs) => {
                        //                 if (err) {
                        //                     console.log(err)
                        //                     resp.errorResponse(res, err, 501, 'Error While added feedback');
                        //                 } else if (docs) {
                        //                     console.log("docs", docs)
                        //                     result = {
                        //                         "doctor_notes": docs.doctor_notes,
                        //                         "doctor_rating": docs.doctor_rating,
                        //                         "doctor_comments": docs.doctor_comments,
                        //                         "status": docs.status
                        //                     }
                        //                     resp.successGetResponse(res, result, 'feedback added successfully');
                        //                 } else {
                        //                     resp.noRecordsFound(res, 'Unable to add feedback');
                        //                 }
                        //             })
                        //         } else {
                        //             resp.noRecordsFound(res, 'Unable to get any response from superpro');
                        //         }
                        //     })
                        // } else {
                        //     console.log("else");
                        //     resp.noRecordsFound(res, 'Unable to get videocall id');
                        // }
                    // } else {
                    //     console.log("else");
                    //     resp.noRecordsFound(res, 'Unable to find booking');
                    // }
                })
            }
        })
    }
})