const express = require('express');
const router = express.Router();
const therapistController = require("../therapist/therapist.controller");
const resp = require("../../helpers/responseHelpers");
const misc = require('../../helpers/misc');
const appointmentController = require("../appointment/appointment.controller");
var moment = require('moment');

router.get('/profile', (req, res) => {
    misc.checkUser(req, res).then(
        (user) => {
            therapistController.getProfile(user).then(
                (data) => {
                    console.log(data)
                    let user = data
                    delete user['password']
                    console.log("dd")
                    resp.successGetResponse(res, user)
                },
                (err) => resp.errorResponse(res, err)
            )
        }
    )
});
router.put('/updateTherapist', (req, res) => {
    console.log("inside update therapist")
    if (req.user && req.body.updatedData) {
        console.log("inside update route", req.user)
        console.log("inside update body", req.body.updatedData)
        const query = {};
        query['emailId'] = req.user[0].emailId;
        const dataToBeUpdated = req.body.updatedData
        delete dataToBeUpdated._id
        therapistController.updateUser(query, dataToBeUpdated, function (err, docs) {
            if (err) {
                resp.errorResponse(res);
            } else if (docs) {
                resp.successPostResponse(res, docs, 'User Data updated successfully');
            } else {
                resp.noRecordsFound(res, 'Invalid Email Id');
            }
        });
    } else {
        resp.missingBody(res, 'Missing parameters');
    }
})

router.post('/createTimeSlots', (req, res) => {
    console.log("create timeslots", req.body);
    if (req.user && req.body) 
    {
        let query = 
        {
            "therapistId": req.user[0]._id
        }
        appointmentController.getTherapistTimeSlots(query, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While fetching timeslots');
            } else if (docs) {
                console.log("inside update")
                //update timeslots
                appointmentController.updateTherapistTimeslots(query, req.body, function (err, docs) {
                    if (err) 
                    {
                        resp.errorResponse(res);
                    } else if (docs)
                    {
                        resp.successPostResponse(res, docs, 'User Data updated successfully');
                    } else 
                    {
                        resp.noRecordsFound(res, 'Invalid Id');
                    }
                });
                //resp.successGetResponse(res, docs, 'timeslots List');
            } else 
            {
                //create timeslots
                console.log("inside create")
                appointmentController.createSlots(query, req.body, (err, docs) => {
                    console.log("got response")
                    if (err) {
                        console.log(err)
                        resp.errorResponse(res, err, 501, 'Error While creating timeslots');
                    } else if (docs) {
                        resp.successGetResponse(res, docs, 'timeslots List created successfully');
                    } else {
                        resp.noRecordsFound(res, 'Unable to create therapists timeslots');
                    }
                });


                //resp.noRecordsFound(res, 'Unable to fetch therapists timeslots');
            }
        })
    }
})

router.get('/getTherapistTimeslots', (req, res) => {
    console.log("inside getTherapistTimeslots");
    if (req.user) {
        console.log("therapist", req.user)
        console.log("therapistid", req.user[0]._id)
        const query = {};
        query['therapistId'] = req.user[0]._id;
        appointmentController.getTherapistTimeSlots(query, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While fetching timeslots');
            } else if (docs) {
                resp.successGetResponse(res, docs, 'timeslots List');
            } else {
                resp.noRecordsFound(res, 'Unable to fetch therapists timeslots');
            }
        })
    }
})

router.put('/updateTherapistTimeslots', (req, res) => {
    console.log("inside update therapist")
    if (req.user && req.body.updatedData) {
        console.log("inside update route", req.user)
        console.log("inside update body", req.body.updatedData)
        console.log("therapistid", req.user[0]._id)
        const query = {};
        query['therapistId'] = req.user[0]._id;
        const dataToBeUpdated = req.body.updatedData
        appointmentController.updateTherapistTimeslots(query, dataToBeUpdated, function (err, docs) {
            if (err) {
                resp.errorResponse(res);
            } else if (docs) {
                resp.successPostResponse(res, docs, 'User Data updated successfully');
            } else {
                resp.noRecordsFound(res, 'Invalid Id');
            }
        });
    } else {
        resp.missingBody(res, 'Missing parameters');
    }
})

router.put('/cancelTimeslots', (req, res) => {
    console.log("inside cancelTimeslots therapist")
    if (req.user && req.body.updatedData) {
        console.log("inside update route", req.user)
        console.log("inside update body", req.body.updatedData)
        console.log("therapistid", req.user[0]._id)
        const query = {};
        query['therapistId'] = req.user[0]._id;
        const dataToBeUpdated = req.body.updatedData
        appointmentController.cancelTimeslots(query, dataToBeUpdated, function (err, docs) {
            if (err) {
                resp.errorResponse(res);
            } else if (docs) {
                resp.successPostResponse(res, docs, 'slot cancelled successfully');
            } else {
                resp.noRecordsFound(res, 'unable to cancel slot');
            }
        });
    } else {
        resp.missingBody(res, 'Missing parameters');
    }
})

router.put('/createSingleSlots', (req, res) => {
    console.log("inside cancelTimeslots therapist")
    if (req.user && req.body.updatedData) {
        console.log("inside update route", req.user)
        console.log("inside update body", req.body.updatedData)
        console.log("therapistid", req.user[0]._id)
        const query = {};
        query['therapistId'] = req.user[0]._id;
        const dataToBeUpdated = req.body.updatedData
        appointmentController.createSingleSlots(query, dataToBeUpdated, function (err, docs) {
            if (err) {
                resp.errorResponse(res);
            } else if (docs) {
                resp.successPostResponse(res, docs, 'slot created successfully');
            } else {
                resp.noRecordsFound(res, 'unable to create slot');
            }
        });
    } else {
        resp.missingBody(res, 'Missing parameters');
    }
})

router.get('/upcomingAppointment', (req, res) => {
    console.log("inside upcomingAppointment", req.user)
    if (req.user) {
        const query = {};
        query['therapistId'] = req.user[0]._id;
        query["status"] = "appointment confirmed";
        var c;
        therapistController.getBookedSlots(query, function (err, docs) {
            if (err) {
                resp.errorResponse(res);
            } else if (docs.length > 0) {
                console.log("docs", docs)
                // if there is userlist
                var user_result = docs.map(function (el) {
                    var o = Object.assign({}, el);
                    o._doc.role = 'user';
                    return o._doc;
                })

                console.log(user_result);
                therapistController.getBookedSlots_employee(query, function (err, employee_docs) {
                    if (err) {
                        resp.errorResponse(res);
                    } else if (employee_docs.length > 0) {
                        // if there is both userlist and employee list
                        var employee_result = employee_docs.map(function (el) {
                            var o = Object.assign({}, el);
                            o._doc.role = 'employee';
                            return o._doc;
                        })

                        c = user_result.concat(employee_result);
                        console.log("BEFORE SORT", c);
                        c.sort((a, b) => new Date(a.bookedSlotsTime) < new Date(b.bookedSlotsTime) ? -1 : 1);
                        console.log("AFTER SORT", c);
                        resp.successPostResponse(res, c, 'upcoming appointment');
                    } else {
                        // if there is userlist and no employee list
                        user_result.sort((a, b) => new Date(a.bookedSlotsTime) < new Date(b.bookedSlotsTime) ? -1 : 1);
                        resp.successPostResponse(res, user_result, 'upcoming appointment');
                    }
                });
            } else {
                // if there is no userlist and employee list
                therapistController.getBookedSlots_employee(query, function (err, employee_docs) {
                    if (err) {
                        resp.errorResponse(res);
                    } else if (employee_docs.length > 0) {
                        employee_docs.sort((a, b) => new Date(a.bookedSlotsTime) < new Date(b.bookedSlotsTime) ? -1 : 1);
                        var employee_result = employee_docs.map(function (el) {
                            var o = Object.assign({}, el);
                            o._doc.role = 'employee';
                            return o._doc;
                        })
                        
                        resp.successPostResponse(res, employee_result, 'upcoming appointment');
                    } else {
                        // if there is no userlist and no employee list
                        resp.noRecordsFound(res, 'no appointment found');
                    }
                });
            }
        });
    } else {
        resp.missingBody(res, 'Missing parameters');
    }
})

router.get('/appointmentFlag', (req, res) => {
    console.log("inside appointmentStatusFlag", req.user)
    if (req.user) {
        const query = {};
        query["$or"] = [{ status: "appointment confirmed" }];
        query['therapistId'] = req.user[0]._id;
        //query["status"] = "appointment confirmed";

        therapistController.getBookedSlots(query, function (err, docs) {
            if (err) {
                resp.errorResponse(res);
            } else if (docs.length > 0) {
                console.log("docs", docs)
                // if there is userlist
                var user_result = docs.map(function (el) {
                    var o = Object.assign({}, el);
                    o._doc.role = 'user';
                    return o._doc;
                })

                console.log(user_result);
                therapistController.getBookedSlots_employee(query, function (err, employee_docs) {
                    if (err) {
                        resp.errorResponse(res);
                    } else if (employee_docs.length > 0) {
                        // if there is both userlist and employee list
                        var employee_result = employee_docs.map(function (el) {
                            var o = Object.assign({}, el);
                            o._doc.role = 'employee';
                            return o._doc;
                        })

                        c = user_result.concat(employee_result);
                        console.log("BEFORE SORT", c);
                        c.sort((a, b) => new Date(a.bookedSlotsTime) < new Date(b.bookedSlotsTime) ? -1 : 1);
                        console.log("AFTER SORT", c);
                        // for (var i = 0; i < c.length; i++) {

                        var present_time1 = new Date();
                        present_time1 = present_time1.setMinutes(present_time1.getMinutes() + 330);
                        var present_time = new Date(present_time1);
                        console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&", present_time);

                        let slot_date = c[0].bookedSlotsTime;
                        let slot_start_time = slot_date.setMinutes(slot_date.getMinutes() - 10);
                        slot_start_time = new Date(slot_start_time);
                        console.log(slot_start_time);
                        let slot_reschedule_end_time = slot_date.setMinutes(slot_date.getMinutes() - 110);
                        slot_reschedule_end_time = new Date(slot_reschedule_end_time);
                        console.log(slot_reschedule_end_time);
                        let join_call_flag = new Boolean();
                        let reschedule_flag = new Boolean();

                        if (c[0].status === 'appointment confirmed') {
                            if (slot_start_time <= present_time) {
                                join_call_flag = true;
                            } else {
                                join_call_flag = false;
                            }

                            if (slot_reschedule_end_time > present_time) {
                                reschedule_flag = true;
                            } else {
                                reschedule_flag = false;
                            }
                        } else if (c[0].status === 'appointment TBD') {
                            join_call_flag = false;
                            reschedule_flag = true;
                        }



                        var time_obj = {
                            "join_call_flag": join_call_flag,
                            "reschedule_flag": reschedule_flag
                        };
                        // }
                        resp.successPostResponse(res, time_obj, 'Status Flags');
                    } else {
                        // if there is userlist and no employee list
                        user_result.sort((a, b) => new Date(a.bookedSlotsTime) < new Date(b.bookedSlotsTime) ? -1 : 1);

                        var present_time1 = new Date();
                        present_time1 = present_time1.setMinutes(present_time1.getMinutes() + 330);
                        var present_time = new Date(present_time1);
                        console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&", present_time);

                        let slot_date = user_result[0].bookedSlotsTime;
                        let slot_start_time = slot_date.setMinutes(slot_date.getMinutes() - 10);
                        slot_start_time = new Date(slot_start_time);
                        console.log(slot_start_time);
                        let slot_reschedule_end_time = slot_date.setMinutes(slot_date.getMinutes() - 110);
                        slot_reschedule_end_time = new Date(slot_reschedule_end_time);
                        console.log(slot_reschedule_end_time);
                        let join_call_flag = new Boolean();
                        let reschedule_flag = new Boolean();

                        if (user_result[0].status === 'appointment confirmed') {
                            if (slot_start_time <= present_time) {
                                join_call_flag = true;
                            } else {
                                join_call_flag = false;
                            }

                            if (slot_reschedule_end_time > present_time) {
                                reschedule_flag = true;
                               
                            } else {
                                reschedule_flag = false;
                            }
                        } else if (user_result[0].status === 'appointment TBD') {
                            join_call_flag = false;
                            reschedule_flag = true;
                        }



                        var time_obj = {
                            "join_call_flag": join_call_flag,
                            "reschedule_flag": reschedule_flag
                        };
                        // }
                        resp.successPostResponse(res, time_obj, 'Status Flags');
                    }
                });
            } else {
                // if there is no userlist and employee list
                therapistController.getBookedSlots_employee(query, function (err, employee_docs) {
                    if (err) {
                        resp.errorResponse(res);
                    } else if (employee_docs.length > 0) {
                        employee_docs.sort((a, b) => new Date(a.bookedSlotsTime) < new Date(b.bookedSlotsTime) ? -1 : 1);
                        var employee_result = employee_docs.map(function (el) {
                            var o = Object.assign({}, el);
                            o._doc.role = 'employee';
                            return o._doc;
                        })

                        var present_time1 = new Date();
                        present_time1 = present_time1.setMinutes(present_time1.getMinutes() + 330);
                        var present_time = new Date(present_time1);
                        console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&", present_time);

                        let slot_date = employee_result[0].bookedSlotsTime;
                        let slot_start_time = slot_date.setMinutes(slot_date.getMinutes() - 10);
                        slot_start_time = new Date(slot_start_time);
                        console.log(slot_start_time);
                        let slot_reschedule_end_time = slot_date.setMinutes(slot_date.getMinutes() - 110);
                        slot_reschedule_end_time = new Date(slot_reschedule_end_time);
                        console.log(slot_reschedule_end_time);
                        let join_call_flag = new Boolean();
                        let reschedule_flag = new Boolean();

                        if (employee_result[0].status === 'appointment confirmed') {
                            if (slot_start_time <= present_time) {
                                join_call_flag = true;
                            } else {
                                join_call_flag = false;
                            }

                            if (slot_reschedule_end_time > present_time) {
                                reschedule_flag = true;
                              
                            } else {
                                reschedule_flag = false;
                            }
                        } else if (employee_result[0].status === 'appointment TBD') {
                            join_call_flag = false;
                            reschedule_flag = true;
                        }

                        var time_obj = {
                            "join_call_flag": join_call_flag,
                            "reschedule_flag": reschedule_flag
                        };
                        
                        resp.successPostResponse(res, time_obj, 'Status Flags');
                    } else {
                        // if there is no userlist and no employee list
                        resp.noRecordsFound(res, 'no status flags found');
                    }
                });
            }
        });
    } else {
        resp.missingBody(res, 'Missing parameters');
    }
})

router.get('/EmployeeappointmentFlag', (req, res) => {
    console.log("inside appointmentStatusFlag", req.user)
    if (req.user) {
        const query = {};
        query["$or"] = [{ status: "appointment confirmed" }];
        query['therapistId'] = req.user[0]._id;
        //query["status"] = "appointment confirmed";
        therapistController.getBookedSlots_employee(query, function (err, docs) {
            if (err) {
                resp.errorResponse(res);
            } else if (docs.length > 0) {
                console.log("docs", docs);
                for (var i = 0; i < docs.length; i++) {

                    var present_time1 = new Date();
                    present_time1 = present_time1.setMinutes(present_time1.getMinutes() + 330);
                    var present_time = new Date(present_time1);
                    console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&", present_time);

                    let slot_date = docs[0].bookedSlotsTime;
                    let slot_start_time = slot_date.setMinutes(slot_date.getMinutes() - 10);
                    slot_start_time = new Date(slot_start_time);
                    console.log(slot_start_time);
                    let slot_reschedule_end_time = slot_date.setMinutes(slot_date.getMinutes() - 110);
                    slot_reschedule_end_time = new Date(slot_reschedule_end_time);
                    console.log(slot_reschedule_end_time);
                    let join_call_flag = new Boolean();
                    let reschedule_flag = new Boolean();

                    if (docs[0].status === 'appointment confirmed') {
                        if (slot_start_time <= present_time) {
                            join_call_flag = true;
                        } else {
                            join_call_flag = false;
                        }

                        if (slot_reschedule_end_time > present_time) {
                            if (docs[0].rescheduled === false) {
                                reschedule_flag = true;
                            } else {
                                reschedule_flag = false;
                            }
                        } else {
                            reschedule_flag = false;
                        }
                    } else if (docs[0].status === 'appointment TBD') {
                        join_call_flag = false;
                        reschedule_flag = true;
                    }

                    var time_obj = {
                        "join_call_flag": join_call_flag,
                        "reschedule_flag": reschedule_flag
                    };
                }
                resp.successPostResponse(res, time_obj, 'Status Flags');
            } else {
                resp.noRecordsFound(res, 'no status flags found');
            }
        });
    } else {
        resp.missingBody(res, 'Missing parameters');
    }
})

router.get('/pastAppointment', (req, res) => {
    console.log("inside Past upcomingAppointment", req.user)
    if (req.user) {
        const query = {};
        query['therapistId'] = req.user[0]._id;
        // query["status"] = "appointment closed";
        query["booking_status"] = "paid";
        // query["payout_status"] = "paid";


        therapistController.getBookedSlots(query, function (err, docs) {
            if (err) {
                resp.errorResponse(res);
            } else if (docs.length > 0) {
                console.log("docs", docs)

                // if there is userlist
                var user_result = docs.map(function (el) {
                    var o = Object.assign({}, el);
                    o._doc.role = 'user';
                    return o._doc;
                })


                console.log(user_result);
                therapistController.getBookedSlots_employee(query, function (err, employee_docs) {
                    if (err) {
                        resp.errorResponse(res);
                    } else if (employee_docs.length > 0) {

                        // if there is both userlist and employee list
                        var employee_result = employee_docs.map(function (el) {
                            var o = Object.assign({}, el);
                            o._doc.role = 'employee';
                            return o._doc;
                        })

                        c = user_result.concat(employee_result);
                        c.sort((a, b) => new Date(a.bookedSlotsTime) > new Date(b.bookedSlotsTime) ? -1 : 1);
                        console.log(c);
                        resp.successPostResponse(res, c, 'Past appointment');
                    } else {
                        // if there is userlist and no employee list
                        user_result.sort((a, b) => new Date(a.bookedSlotsTime) > new Date(b.bookedSlotsTime) ? -1 : 1);

                        resp.successPostResponse(res, user_result, 'Past appointment');
                    }
                });
            } else {
                // if there is no userlist and employee list
                therapistController.getBookedSlots_employee(query, function (err, employee_docs) {
                    if (err) {
                        resp.errorResponse(res);
                    } else if (employee_docs.length > 0) {
                        employee_docs.sort((a, b) => new Date(a.bookedSlotsTime) > new Date(b.bookedSlotsTime) ? -1 : 1);
                        var employee_result = employee_docs.map(function (el) {
                            var o = Object.assign({}, el);
                            o._doc.role = 'employee';
                            return o._doc;
                        })
                        resp.successPostResponse(res, employee_result, 'Past appointment');
                    } else {
                        // if there is no userlist and no employee list
                        resp.noRecordsFound(res, 'no appointment found');
                    }
                });
            }
        });
    } else {
        resp.missingBody(res, 'Missing parameters');
    }
})

router.get('/getCalender', (req, res) => {
    console.log("inside get calender");
    if (req.user) {
        const query = {};
        query['therapistId'] = req.user[0]._id;
        console.log("query", query);
        appointmentController.getCalender(query, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While fetching timeslots');
            } else if (docs) {
                //console.log("inside get calender docs", docs.availableSlots);
                resp.successGetResponse(res, docs, 'timeslots List');
            } else {
                resp.noRecordsFound(res, 'Unable to fetch therapists timeslots');
            }
        })
    }
})

router.put('/cancelAppointment', (req, res) => {
    if (req.user && req.query) {
        const query = {};
        console.log('query::', req.query );
        query['_id'] = req.query.bookingId;
        const dataToBeUpdated = { status: "appointment cancelled" }
        if (req.query.role == 'user') {
                console.log('abhishek ------------------------------------>');
           try { appointmentController.updateBooking(query, dataToBeUpdated, (err, docs) => {
                console.log("---------------------");
                console.log(docs);
                console.log("---------------------");
                if (err) {
                    console.log(err)
                    resp.errorResponse(res, err, 501, 'Error While cancelling the appointment');
                } else if (docs) {
                    console.log("therapist docs", docs)
                    const query1 = {};
                    query1['therapistId'] = docs.therapistId._id;
                    const dataToBeUpdated = { cancel_slot: docs.bookedSlotsTime }
                    appointmentController.cancelTimeslots(query1, dataToBeUpdated, function (err, docs1) {
                        console.log('testing==>:: ', docs1);

                        if (err) {
                            resp.errorResponse(res);
                        } else if (docs1) {
                            therapistController.appointmentCancelEmail(docs, function (err, docs2) {
                                if (err) {
                                    console.log("sendgrid err", err);
                                    //resp.errorResponse(res,err,501,"Internal Server Error, Please Try Again Later");
                                } else if (docs2) {
                                    console.log("sendgrid docs", docs2);
                                    //resp.successPostResponse(res,null,`Password Reset Link Has Been Sent To Your Email Id ${req.body.emailId}`);
                                } else {
                                    console.log("sendgrid else");
                                    //resp.noRecordsFound(res, "Invalid Email Id");
                                }
                            });
                            therapistController.appointmentCancelEmailTherapist(docs, function (err, docs3) {
                                if (err) {
                                    console.log("sendgrid err", err);
                                    //resp.errorResponse(res,err,501,"Internal Server Error, Please Try Again Later");
                                } else if (docs3) {
                                    console.log("sendgrid docs", docs3);
                                    //resp.successPostResponse(res,null,`Password Reset Link Has Been Sent To Your Email Id ${req.body.emailId}`);
                                } else {
                                    console.log("sendgrid else");
                                    //resp.noRecordsFound(res, "Invalid Email Id");
                                }
                            });
                            resp.successPostResponse(res, docs, 'appointment cancelled');
                        } else {
                            resp.noRecordsFound(res, 'unable to cancel slot');
                        }
                    });
                    // resp.successGetResponse(res, docs, 'appointment cancelled');
                } else {
                    console.log('testing==>:: ', docs);
                    resp.noRecordsFound(res, 'Unable to cancel appointment');
                }
            });}catch (e){
console.error(e);
            }
        } else if (req.query.role === 'employee') {
            appointmentController.updateEmployeeBooking(query, dataToBeUpdated, (err, docs) => {
                if (err) {
                    console.log(err)
                    resp.errorResponse(res, err, 501, 'Error While cancelling the appointment');
                } else if (docs) {
                    console.log("therapist docs", docs)
                    const query1 = {};
                    query1['therapistId'] = docs.therapistId._id;
                    const dataToBeUpdated = { cancel_slot: docs.bookedSlotsTime }
                    appointmentController.cancelTimeslots(query1, dataToBeUpdated, function (err, docs1) {
                        if (err) {
                            resp.errorResponse(res);
                        } else if (docs1) {
                            therapistController.appointmentCancelEmail_employee(docs, function (err, docs2) {
                                if (err) {
                                    console.log("sendgrid err", err);
                                    //resp.errorResponse(res,err,501,"Internal Server Error, Please Try Again Later");
                                } else if (docs2) {
                                    console.log("sendgrid docs", docs2);
                                    //resp.successPostResponse(res,null,`Password Reset Link Has Been Sent To Your Email Id ${req.body.emailId}`);
                                } else {
                                    console.log("sendgrid else");
                                    //resp.noRecordsFound(res, "Invalid Email Id");
                                }
                            });
                            therapistController.appointmentCancelEmailTherapist_employee(docs, function (err, docs3) {
                                if (err) {
                                    console.log("sendgrid err", err);
                                    //resp.errorResponse(res,err,501,"Internal Server Error, Please Try Again Later");
                                } else if (docs3) {
                                    console.log("sendgrid docs", docs3);
                                    //resp.successPostResponse(res,null,`Password Reset Link Has Been Sent To Your Email Id ${req.body.emailId}`);
                                } else {
                                    console.log("sendgrid else");
                                    //resp.noRecordsFound(res, "Invalid Email Id");
                                }
                            });
                            resp.successPostResponse(res, docs, 'appointment cancelled');
                        } else {
                            resp.noRecordsFound(res, 'unable to cancel slot');
                        }
                    });
                    // resp.successGetResponse(res, docs, 'appointment cancelled');
                } else {
                    console.log('testing==>::  employee', docs);
                    resp.noRecordsFound(res, 'Unable to cancel appointment');
                }
            });
        } else {
            resp.noRecordsFound(res, 'Something went wrong');
        }
    }
})

router.get('/logout', function (req, res) {
    if (req.headers && req.headers.authorization) {
        let headers = req.get("authorization");
        headers = headers.split(" ");
        therapistController.logout(headers[1], (err, docs) => {
            if (err) {
                resp.errorResponse(res);
            }
            resp.successPostResponse(res, docs, 'logout');

        })
    }
});

router.get('/getAllclient', (req, res) => {
    console.log("inside getAllclient", req.user)
    if (req.user) {
        const query = {};
        query['therapistId'] = req.user[0]._id;
        // query['$or'] = [{ "status": "appointment confirmed" },{ "status": "appointment cancelled" }, { "status": "appointment closed" }];
        query["booking_status"] = "paid";
        var c;
        //query["status"] = "appointment confirmed";

        therapistController.getAllclient(query, function (err, docs) {
            if (err) {
                resp.errorResponse(res);
            } else if (docs) {
                console.log("docs", docs)

                // if there is userlist
                var user_result = docs.map(function (el) {
                    var o = Object.assign({}, el);
                    o.role = 'user';
                    return o;
                })


                console.log(user_result);
                therapistController.getAllEmployeeclient(query, function (err, employee_docs) {
                    if (err) {
                        resp.errorResponse(res);
                    } else if (employee_docs) {

                        // if there is both userlist and employee list
                        var employee_result = employee_docs.map(function (el) {
                            var o = Object.assign({}, el);
                            o.role = 'employee';
                            return o;
                        })

                        c = user_result.concat(employee_result);
                        // c.sort((a, b) => new Date(a.bookedSlotsTime) > new Date(b.bookedSlotsTime) ? -1 : 1);
                        console.log(c);
                        resp.successPostResponse(res, c, 'client list');
                    } else {
                        // if there is userlist and no employee list
                        // user_result.sort((a, b) => new Date(a.bookedSlotsTime) > new Date(b.bookedSlotsTime) ? -1 : 1);

                        resp.successPostResponse(res, user_result, 'client list');
                    }
                });
            } else {
                // if there is no userlist and employee list
                therapistController.getAllEmployeeclient(query, function (err, employee_docs) {
                    if (err) {
                        resp.errorResponse(res);
                    } else if (employee_docs) {
                        // employee_docs.sort((a, b) => new Date(a.bookedSlotsTime) > new Date(b.bookedSlotsTime) ? -1 : 1);
                        var employee_result = employee_docs.map(function (el) {
                            var o = Object.assign({}, el);
                            o.role = 'employee';
                            return o;
                        })
                        resp.successPostResponse(res, employee_result, 'client list');
                    } else {
                        // if there is no userlist and no employee list
                        resp.noRecordsFound(res, 'no client found');
                    }
                });
            }
        });
    } else {
        resp.missingBody(res, 'Missing parameters');
    }
})

router.get('/getclientbyId', (req, res) => {
    console.log("inside client by ID", req.user);
    if (req.user) {
        const query = {};
        query['therapistId'] = req.user[0]._id;
        // query['$or'] = [{ "status": "appointment confirmed" }, { "status": "appointment cancelled" }, { "status": "appointment closed" }];
        query["booking_status"] = "paid";

        console.log('testing123',query);
        console.log('testing124',req.user);
        console.log('testing ====>>>',req.query.role == 'user');
        if (req.query.role == 'user') {
            console.log('testing ====>>>');
            query['userId'] = req.query.userId;
            // if role was user then fetch user data
            therapistController.getAllclient(query, function (err, docs) {
                console.log('testing ====>>>',docs);
                if (err) {
                    resp.errorResponse(res);
                } else if (docs.length > 0) {
                    // console.log("docs", docs)
                    var user_result = docs.map(function (el) {
                        var o = Object.assign({}, el);
                        o.role = 'user';
                        return o;
                    })
                    resp.successPostResponse(res, user_result, 'client info');
                } else {
                    resp.noRecordsFound(res, 'No client info foumd');
                }
            });
        } else if (req.query.role == 'employee') {
            query['employeeId'] = req.query.userId;
            // if role was employee then fetch employee data
            therapistController.getAllEmployeeclient(query, function (err, docs) {
                if (err) {
                    resp.errorResponse(res);
                } else if (docs.length > 0) {
                    var employee_result = docs.map(function (el) {
                        var o = Object.assign({}, el);
                        o.role = 'employee';
                        return o;
                    })
                    // console.log("docs", docs)
                    resp.successPostResponse(res, employee_result, 'client info');
                } else {
                    resp.noRecordsFound(res, 'No client info foumd');
                }
            });
        }
    } else {
        resp.missingBody(res, 'Missing parameters');
    }
})

router.get('/getAllfinance', (req, res) => {
    console.log("inside get all finance", req.user)
    if (req.user) {
        const query = {};
        query['therapistId'] = req.user[0]._id;
        // query['$or'] = [{ "status": "appointment confirmed" }, { "status": "appointment cancelled" }, { "status": "appointment closed" }];
        query["booking_status"] = "paid";
        therapistController.getAllfinance(query, function (err, docs) {
            if (err) {
                resp.errorResponse(res);
            } else if (docs.length > 0) {
                console.log("docs", docs)
                let financelist = []
                docs.forEach(element => {
                    let financeDetails = {};
                    //indian time conversion
                    // let bookedSlot_time = element.bookedSlotsTime.setMinutes(element.bookedSlotsTime.getMinutes() + 330);
                    let compare_date = new Date(element.bookedSlotsTime);
                    financeDetails['bookedSlotsTime'] = compare_date;
                    if (element.userId !== null) {
                        financeDetails['name'] = element.userId.first_name + ' ' + element.userId.last_name;
                    }
                    financeDetails['amount'] = element.order.amount / 100;
                    financeDetails['status'] = element.booking_status;
                    financelist.push(financeDetails)
                    financeDetails = {}
                });
                resp.successPostResponse(res, financelist, 'finance list');
            } else {
                resp.noRecordsFound(res, 'No client foumd');
            }
        });
    } else {
        resp.missingBody(res, 'Missing parameters');
    }
})

router.put('/editSessionNotes', (req, res) => {
    console.log("inside updateBooking query", req.query);
    console.log("inside updateBooking body", req.body);
    const query = {};
    query['_id'] = req.query.bookingId;
    const dataToBeUpdated = req.body.updatedData
    if (req.body && req.query) {
        appointmentController.updateBooking(query, dataToBeUpdated, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While updating notes');
            } else if (docs) {
                console.log("docs", docs)
                resp.successGetResponse(res, docs, 'notes updated successfully');
            } else {
                resp.noRecordsFound(res, 'Unable to updated therapists notes');
            }
        })
    }
})

router.put('/callJoin', (req, res) => {
    console.log("inside updateBooking query", req.query);
    console.log("inside updateBooking body", req.body);
    const query = {};
    query['_id'] = req.query.bookingId;
    const dataToBeUpdated = req.body.updatedData
    if (req.user && req.body.updatedData) {
        appointmentController.updateBooking(query, dataToBeUpdated, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While updating login time');
            } else if (docs) {
                console.log("docs", docs)
                resp.successGetResponse(res, 'call login time added');

            } else {
                resp.noRecordsFound(res, 'Unable to add logintime');
            }
        })
    }
})



module.exports = router;