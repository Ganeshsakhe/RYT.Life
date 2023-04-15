const express = require('express');
const router = express.Router();
const employeeCtrl = require('./employee.controller');
const misc = require('../../helpers/misc');
const resp = require('../../helpers/responseHelpers');

router.put('/callJoin', (req, res) => {
    console.log("inside updateBooking query", req.query);
    console.log("inside updateBooking body", req.body);
    const query = {};
    query['_id'] = req.query.bookingId;
    const dataToBeUpdated = req.body.updatedData
    if (req.user && req.body.updatedData) {
        employeeCtrl.updateBooking(query, dataToBeUpdated, (err, docs) => {
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

router.get('/upcomingAppointment', (req, res) => {
    console.log("inside upcomingAppointment", req.user)
    if (req.user) {
        const query = {};
        query["$or"] = [{ status: "appointment confirmed" }, { status: "appointment cancelled" }];
        query['employeeId'] = req.user[0]._id;
        //query["status"] = "appointment confirmed";
        employeeCtrl.getBookedSlots(query, function (err, docs) {
            if (err) {
                resp.errorResponse(res);
            } else if (docs.length > 0) {
                console.log("docs", docs);
                let docs_final_arr = [];
                for (let i = 0; i < docs.length; i++) {
                    let present_date = new Date();
                    let present_time = present_date.getTime();

                    let slot_date = new Date(docs[i].bookedSlotsTime);
                    let slot_time = slot_date.getTime();

                    let time_obj = {
                        "present_time": present_time,
                        "slot_time": slot_time
                    };
                    let x = Object.assign(docs[i], time_obj);
                    docs_final_arr.push(x);
                    // docs[i]["present_time"] = present_time;
                    // docs[i]["slot_time"] = slot_time;
                    // Object.assign(docs[i],{
                    //     "present_time" : present_time,
                    //     "slot_time" : slot_time
                    // });
                }
                resp.successPostResponse(res, docs_final_arr, 'upcoming appointment');
            } else {
                resp.noRecordsFound(res, 'no appointment found');
            }
        });
    } else {
        resp.missingBody(res, 'Missing parameters');
    }
})



router.get('/profile', (req, res) => {
    console.log("inside get profile")
    misc.checkUser(req, res).then(
        (user) => {
            console.log("user", user)
            employeeCtrl.getProfile(user).then(
                (data) => {
                    console.log(data)
                    let user = data
                    console.log("dd")
                    resp.successGetResponse(res, user)
                },
                (err) => resp.errorResponse(res, err)
            )
        }
    )
});

router.put('/updateUser', (req, res) => {
    console.log("inside update user")
    if (req.user && req.body.updatedData) {
        const query = {};
        query['emailId'] = req.user[0].emailId;
        const dataToBeUpdated = req.body.updatedData
        delete dataToBeUpdated._id
        employeeCtrl.updateUser(query, dataToBeUpdated, function (err, docs) {
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

router.get('/pastAppointment', (req, res) => {
    console.log("inside pastAppointment", req.user)
    if (req.user) {
        const query = {};
        query['employeeId'] = req.user[0]._id;
        // query["status"] = "appointment closed";
        employeeCtrl.getBookedSlots(query, function (err, docs) {
            if (err) {
                resp.errorResponse(res);
            } else if (docs.length > 0) {
                docs.sort((a, b) => new Date(a.bookedSlotsTime) > new Date(b.bookedSlotsTime) ? -1 : 1);
                resp.successPostResponse(res, docs, 'past appointment');
            } else {
                resp.noRecordsFound(res, 'no past appointment found');
            }
        });
    } else {
        resp.missingBody(res, 'Missing parameters');
    }
})


router.get('/statusFlag', (req, res) => {
    console.log("inside appointmentStatusFlag", req.user)
    if (req.user) {
        const query = {};
        query["$or"] = [{ status: "appointment confirmed" }, { status: "appointment cancelled" }];
        query['employeeId'] = req.user[0]._id;
        //query["status"] = "appointment confirmed";
        employeeCtrl.getBookedSlots(query, function (err, docs) {
            if (err) {
                resp.errorResponse(res);
            } else if (docs.length > 0) {
                console.log("docs Reschedule", docs);
                for (var i = 0; i < docs.length; i++) {
                    var present_time1 = new Date();
                    present_time1 = present_time1.setMinutes(present_time1.getMinutes() + 330);
                    var present_time = new Date(present_time1);

                    let slot_date = docs[0].bookedSlotsTime;
                    let slot_start_time = slot_date.setMinutes(slot_date.getMinutes() - 10);
                    slot_start_time = new Date(slot_start_time);
                    let slot_reschedule_end_time = slot_date.setMinutes(slot_date.getMinutes() - 110);
                    slot_reschedule_end_time = new Date(slot_reschedule_end_time);
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
                    } else if (docs[0].status === 'appointment cancelled') {
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

router.get('/previousAppointment', (req, res) => {
    console.log("inside pastAppointment", req.user)
    if (req.user) {
        const query = {};
        query['_id'] = req.query.doctorId;
        employeeCtrl.getTimeSlotsById(query, function (err, docs) {
            if (err) {
                resp.errorResponse(res);
            } else if (docs.length > 0) {
                resp.successPostResponse(res, docs, 'previous appointment slots');
            } else {
                resp.noRecordsFound(res, 'no slots found');
            }
        });
    } else {
        resp.missingBody(res, 'Missing parameters');
    }
})


router.get('/getAllDoctorSlots', (req, res) => {
    employeeCtrl.getTimeSlots((err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While getting timeSlots');
        } else if (docs) {
            console.log("[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[", docs);
            // try {
            const query = {};
            // query["employeeId"] = req.user[0]._id;
            console.log(query);
            employeeCtrl.getRemainingSlots_employee(query, (err, docs1) => {
                if (err) {
                    console.log("////////HELLO", err);
                } else if (docs1) {
                    // if there is employee timeslots
                    for (var i = 0; i < docs.length; i++) {
                        if (docs[i].calender.length > 0) {
                            for (var j = 0; j < docs[i].calender[0].slot_timestamp.length; j++) {
                                for (var k = 0; k < docs1.length; k++) {
                                    let date1 = new Date(docs[i].calender[0].slot_timestamp[j].date);
                                    let date2 = new Date(docs1[k].bookedSlotsTime);

                                    if (date1.toString() === date2.toString() && docs1[k].status === 'appointment confirmed') {
                                        docs[i].calender[0].slot_timestamp[j]["booked"] = true;
                                    }
                                }
                            }
                        }
                    }

                    employeeCtrl.getRemainingSlots(query, (err, docs2) => {
                        if (err) {
                            console.log("////////HELLO", err);
                        } else if (docs2) {
                            // if there is both employee timelsots and user timeslots
                            for (var i = 0; i < docs.length; i++) {
                                if (docs[i].calender.length > 0) {
                                    for (var j = 0; j < docs[i].calender[0].slot_timestamp.length; j++) {
                                        for (var k = 0; k < docs2.length; k++) {
                                            let date1 = new Date(docs[i].calender[0].slot_timestamp[j].date);
                                            let date2 = new Date(docs2[k].bookedSlotsTime);
                                            // console.log("i",i,"j",j,"val",docs[i].calender[j]);
                                            // console.log(date2.toString());
                                            if (date1.toString() === date2.toString() && docs2[k].status === 'appointment confirmed') {
                                                docs[i].calender[0].slot_timestamp[j]["booked"] = true;
                                            }
                                        }
                                    }
                                }
                            }
                            resp.successGetResponse(res, docs, 'timeslots List');
                        } else {
                            // if there is only user timeslots
                            resp.successGetResponse(res, docs, 'timeslots List');
                        }
                    })
                    // resp.successGetResponse(res, docs, 'timeslots List');
                } else {
                    // if there is only user timeslots

                    employeeCtrl.getRemainingSlots(query, (err, docs1) => {
                        if (err) {
                            console.log("////////HELLO", err);
                        } else if (docs1) {
                            for (var i = 0; i < docs.length; i++) {
                                if (docs[i].calender.length > 0) {
                                    for (var j = 0; j < docs[i].calender[0].slot_timestamp.length; j++) {
                                        for (var k = 0; k < docs1.length; k++) {
                                            let date1 = new Date(docs[i].calender[0].slot_timestamp[j].date);
                                            let date2 = new Date(docs1[k].bookedSlotsTime);
                                            // console.log("i",i,"j",j,"val",docs[i].calender[j]);
                                            // console.log(date2.toString());
                                            if (date1.toString() === date2.toString() && docs1[k].status === 'appointment confirmed') {
                                                docs[i].calender[0].slot_timestamp[j]["booked"] = true;
                                            }
                                        }
                                    }
                                }
                            }
                            resp.successGetResponse(res, docs, 'timeslots List');
                        }
                    })
                }
            })
            // } catch (err) {
            // resp.noRecordsFound(res, 'Something went wrong');
            // }
        } else {
            resp.noRecordsFound(res, 'Unable to get timeSlots');
        }
    })
})


module.exports = router;