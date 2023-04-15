const appointmentModel = require('./appointment.model');
var moment = require('moment');
const EmailTemplate = require("../projects/model_helpers/email_template");

async function createSlots(query, data, callback) {
    console.log("inside createSlots");
    if (data.slot_timestamp) {
        console.log("inside slot_timestamp")
        let data_obj = {}
        data_obj.doctorId = query.doctorId;
        data_obj.slot_timestamp = data.slot_timestamp;

        console.log("data_obj 14", data_obj)

        appointmentModel.addTimeSlots(data_obj, (err, res) => {
            if (err) {
                callback(err, null);
            } else if (res) {
                callback(null, res);
            } else {
                callback(null, null);
            }
        });
    } else {
        console.log("inside else 26");
        console.log("res", data);
        var fromDate = new Date(data.fromDate);
        var toDate = new Date(data.toDate);
        let day = [];
        day.push(data.slots.Sunday)
        day.push(data.slots.Monday)
        day.push(data.slots.Tuesday)
        day.push(data.slots.Wednesday)
        day.push(data.slots.Thursday)
        day.push(data.slots.Friday)
        day.push(data.slots.Saturday)

        console.log("day", day)
        console.log("fromDate line38", fromDate)
        console.log("toDate line39", toDate)

        Date.prototype.addDays = function (days) {
            var dat = new Date(this.valueOf())
            dat.setDate(dat.getDate() + days);
            return dat;
        }

        function getDates(startDate, stopDate) {
            var dateArray = new Array();
            var currentDate = startDate;
            while (currentDate <= stopDate) {
                dateArray.push(currentDate)
                currentDate = currentDate.addDays(1);
            }
            return dateArray;
        }

        //var dateArray = getDates(new Date(), (new Date()).addDays(6));
        var dateArray = await getDates(fromDate, toDate);

        console.log("dateArray", dateArray)
        var startdate = moment(dateArray[0], "DD.MM.YYYY");
        console.log("startdate day", startdate)
        console.log("startday", startdate.day());

        let weeksDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",];

        let getAllSlots = [];
        let startday = startdate.day();
        let totalday = dateArray.length;
        for (let i = 0; i < totalday; i++) {
            if (startday > day.length - 1) {
                startday = 0;
                let date = moment(dateArray[i]).format('DD/MM/YYYY')
                console.log("date", date)
                day[startday].forEach((time) => {
                    console.log("time", time)
                    let dateMomentObject = moment(date + ' ' + time.from, "DD/MM/YYYY hh:mm:A");
                    console.log("dateMomentObject", dateMomentObject.toDate())
                    let formated_date = moment(dateMomentObject.toDate()).format('DD/MM/YYYY hh:mm:A')
                    console.log("formated_date", formated_date)
                    getAllSlots.push({
                        "date": dateMomentObject.toDate()
                    })
                })
                startday++;
            } else {
                let date = moment(dateArray[i]).format('DD/MM/YYYY')
                console.log("date", date)
                day[startday].forEach((time) => {
                    console.log("time", time)
                    let dateMomentObject = moment(date + ' ' + time.from, "DD/MM/YYYY hh:mm:A");
                    console.log("dateMomentObject", dateMomentObject.toDate())
                    let formated_date = moment(dateMomentObject.toDate()).format('DD/MM/YYYY hh:mm:A')
                    console.log("formated_date", formated_date)
                    getAllSlots.push({
                        "date": dateMomentObject.toDate()
                    })
                })
                startday++;
            }
        }
        let data_obj = {}
        data_obj.doctorId = query.doctorId;
        data_obj.fromDate = data.fromDate;
        data_obj.toDate = data.toDate;
        data_obj.slots = data.slots;
        data_obj.slot_timestamp = getAllSlots;

        console.log("data", data)

        appointmentModel.addTimeSlots(data_obj, (err, res) => {
            if (err) {
                callback(err, null);
            } else if (res) {
                callback(null, res);
            } else {
                callback(null, null);
            }
        });

    }
}

async function updateDoctorTimeslots(query, data, callback) {
    console.log("inside controller")
    console.log("query", query)
    console.log("data", data)

    console.log("inside updateDoctorTimeslots");
    if (data.slot_timestamp) {
        appointmentModel.updateDoctorTimeslots(query, data, callback)
    } else {
        console.log("res", data);
        var fromDate = new Date(data.fromDate);
        var toDate = new Date(data.toDate);
        let day = [];
        day.push(data.slots.Sunday)
        day.push(data.slots.Monday)
        day.push(data.slots.Tuesday)
        day.push(data.slots.Wednesday)
        day.push(data.slots.Thursday)
        day.push(data.slots.Friday)
        day.push(data.slots.Saturday)

        console.log("day", day)
        console.log("fromDate line38", fromDate)
        console.log("toDate line39", toDate)

        Date.prototype.addDays = function (days) {
            var dat = new Date(this.valueOf())
            dat.setDate(dat.getDate() + days);
            return dat;
        }

        function getDates(startDate, stopDate) {
            var dateArray = new Array();
            var currentDate = startDate;
            while (currentDate <= stopDate) {
                dateArray.push(currentDate)
                currentDate = currentDate.addDays(1);
            }
            return dateArray;
        }

        //var dateArray = getDates(new Date(), (new Date()).addDays(6));
        var dateArray = await getDates(fromDate, toDate);

        console.log("dateArray", dateArray)
        var startdate = moment(dateArray[0], "DD.MM.YYYY");
        console.log("startdate day", startdate)
        console.log("startday", startdate.day());

        let weeksDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",];

        let getAllSlots = [];
        let startday = startdate.day();
        let totalday = dateArray.length;
        for (let i = 0; i < totalday; i++) {
            if (startday > day.length - 1) {
                startday = 0;
                let date = moment(dateArray[i]).format('DD/MM/YYYY')
                console.log("date", date)
                day[startday].forEach((time) => {
                    console.log("time", time)
                    let dateMomentObject = moment(date + ' ' + time.from, "DD/MM/YYYY hh:mm:A");
                    console.log("dateMomentObject", dateMomentObject.toDate())
                    let formated_date = moment(dateMomentObject.toDate()).format('DD/MM/YYYY hh:mm:A')
                    console.log("formated_date", formated_date)
                    getAllSlots.push({
                        "date": dateMomentObject.toDate()
                    })
                })
                startday++;
            } else {
                let date = moment(dateArray[i]).format('DD/MM/YYYY')
                console.log("date", date)
                day[startday].forEach((time) => {
                    console.log("time", time)
                    let dateMomentObject = moment(date + ' ' + time.from, "DD/MM/YYYY hh:mm:A");
                    console.log("dateMomentObject", dateMomentObject.toDate())
                    let formated_date = moment(dateMomentObject.toDate()).format('DD/MM/YYYY hh:mm:A')
                    console.log("formated_date", formated_date)
                    getAllSlots.push({
                        "date": dateMomentObject.toDate()
                    })
                })
                startday++;
            }
        }

        data.slot_timestamp = getAllSlots

        console.log("data", data)

        appointmentModel.updateDoctorTimeslots(query, data, callback)
    }

}

function cancelTimeslots(query, data, callback) {
    console.log("inside cancelTimeslots", query, data)
    appointmentModel.cancelSlots(query, data, (err, res) => {
        if (err) {
            callback(err, null)
        } else if (res) {
            console.log("res", res)
            callback(null, res)
        } else {
            callback(null, null)
        }
    });
}

function createSingleSlots(query, data, callback) {
    console.log("inside createSingleSlots", query, data)
    appointmentModel.createSingleSlots(query, data, (err, res) => {
        if (err) {
            callback(err, null)
        } else if (res) {
            console.log("res", res)
            callback(null, res)
        } else {
            callback(null, null)
        }
    });
}

function findBookingById(data, callback) {
    console.log("data 21", data)
    appointmentModel.findBookingById(data, callback)
}

function createInterestedWith(data, callback) {
    console.log("inside createinterestedWith", data)
    appointmentModel.createdInterestedWith(data, (err, res) => {
        if (err) {
            callback(err, null);
        } else if (res) {
            callback(null, res);
        } else {
            callback(null, null);
        }
    });
}

function getTimeSlots(data, callback) {
    console.log("inside getSlots");
    appointmentModel.getTimeSlots(data, (err, res) => {
        if (err) {
            callback(err, null);
        } else if (res.length != 0) {
            console.log("res", res);
            var fromDate = res[0].fromDate;
            var toDate = res[0].toDate;
            let day = [];
            day.push(res[0].slots.Sunday)
            day.push(res[0].slots.Monday)
            day.push(res[0].slots.Tuesday)
            day.push(res[0].slots.Wednesday)
            day.push(res[0].slots.Thursday)
            day.push(res[0].slots.Friday)
            day.push(res[0].slots.Saturday)

            console.log("day", day)
            console.log("fromDate line38", fromDate)
            console.log("toDate line39", toDate)

            Date.prototype.addDays = function (days) {
                var dat = new Date(this.valueOf())
                dat.setDate(dat.getDate() + days);
                return dat;
            }

            function getDates(startDate, stopDate) {
                var dateArray = new Array();
                var currentDate = startDate;
                while (currentDate <= stopDate) {
                    dateArray.push(currentDate)
                    currentDate = currentDate.addDays(1);
                }
                return dateArray;
            }

            //var dateArray = getDates(new Date(), (new Date()).addDays(6));
            var dateArray = getDates(fromDate, toDate);
            console.log("dateArray", dateArray)
            console.log("dateArrayformat", moment(dateArray[0]).format('DD/MM/YYYY'))

            var startdate = moment(dateArray[0], "DD.MM.YYYY");
            console.log("startdate day", startdate)
            console.log("startday", startdate.day());

            let weeksDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday",];

            let getAllSlots = [];
            let startday = startdate.day();
            let totalday = dateArray.length;
            for (let i = 0; i < totalday; i++) {
                if (startday > day.length - 1) {
                    startday = 0;
                    getAllSlots.push({
                        "date": moment(dateArray[i]).format('DD/MM/YYYY'),
                        "day": weeksDays[startday],
                        "slots": day[startday]
                    })
                    startday++;
                } else {
                    getAllSlots.push({
                        "date": moment(dateArray[i]).format('DD/MM/YYYY'),
                        "day": weeksDays[startday],
                        "slots": day[startday]
                    })
                    startday++;
                }
            }

            console.log("getAllSlots", getAllSlots)

            //callback(null, getAllSlots);

            if (getAllSlots) {
                appointmentModel.getRemainingSlots(data, (err, res) => {
                    if (err) {
                        callback(err, null);
                    } else if (res.length > 0) {
                        console.log("getRemaining slots with userId", res);
                        console.log("res", res[0].bookedslots.date);
                        for (let i = 0; i < res.length; i++) {
                            for (let j = 0; j < getAllSlots.length; j++) {
                                let date = getAllSlots[j].date;
                                getAllSlots[j].slots.forEach((time, index) => {
                                    let formated_time = new Date(moment(date + ' ' + time.from, "DD/MM/YYYY hh:mm:A"));
                                    console.log("formated_time", formated_time)
                                    console.log("res[i].bookedSlotsTime", res[i].bookedSlotsTime);
                                    if (formated_time.toString() === res[i].bookedSlotsTime.toString() && res[i].status === "appointment confirmed") {
                                        time["booked"] = true;
                                        time["userDetails"] = res[i].userId;
                                    }
                                })
                            }
                        }
                        callback(null, { "availableSlots": getAllSlots });
                    } else {
                        console.log("else available slots")


                        callback(null, { "availableSlots": getAllSlots });
                    }
                })
            }
        } else {
            callback(null, null);
        }
    });
}

function getTimeSlotsAvailabilty(data, callback) {
    console.log("inside getSlots", data);
    appointmentModel.getTimeSlots(data, (err, res) => {
        if (err) {
            callback(err, null);
        } else if (res.length > 0) {
            console.log("res", res);

            let getAllSlots = [];

            for (const iterator of res[0].slot_timestamp) {
                getAllSlots.push({ date: iterator.date })
            }
            console.log("getAllSlots", getAllSlots)
            //logic for elapsed time
            let current_date = new Date();
            console.log("current_date", current_date)
            console.log("formated current_date", moment(current_date).format('DD/MM/YYYY hh:mm:A'))
            var new_date = current_date.setMinutes(current_date.getMinutes() + 389);
            var compare_date = new Date(new_date)
            console.log("compare_date", compare_date)
            console.log("formated compare_date", moment(compare_date).format('DD/MM/YYYY hh:mm:A'))

            let available_slot = [];
            let iterate = 0;
            for (let i = 0; i < getAllSlots.length; i++) {
                iterate++;
                let slot_date = new Date(getAllSlots[i].date);
                if (slot_date > compare_date) {
                    console.log(getAllSlots[i].date);
                    available_slot.push(getAllSlots[i])
                }
            }
            if (iterate === getAllSlots.length) {
                getAllSlots = available_slot;
            }
            console.log("Available Slots____________________________________________________________________________/n", getAllSlots);

            if (getAllSlots.length > 0) {
                // console.log("inside if getAllSlots", getAllSlots.length)
                appointmentModel.getRemainingSlots(data, (err, res) => {
                    if (err) {
                        callback(err, null);
                    } else if (res.length > 0) {
                        // if there is user slots 
                        console.log("getRemaining slots with userId", res)
                        for (let i = 0; i < res.length; i++) {
                            let compare_date = new Date(res[i].bookedSlotsTime);
                            for (let j = 0; j < getAllSlots.length; j++) {
                                if (getAllSlots[j].date.toString() === compare_date.toString() && res[i].status === "appointment confirmed") {
                                    console.log("inside if")
                                    console.log("getAllSlots[j].date", getAllSlots[j].date)
                                    console.log("res[i].bookedSlotsTime", compare_date)
                                    getAllSlots[j]["booked"] = true;
                                    //getAllSlots[j]["userDetails"] = res[i].userId;
                                }
                            }
                        }


                        // console.log("Available Slots222222222+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++/n", getAllSlots);

                        appointmentModel.getRemainingSlots_employee(data, (err, docs2) => {
                            if (err) {
                                console.log("////////HELLO", err);
                            } else if (docs2) {
                                // if there is both employee timelsots and user timeslots
                                for (let i = 0; i < docs2.length; i++) {
                                    let compare_date = new Date(docs2[i].bookedSlotsTime);
                                    for (let j = 0; j < getAllSlots.length; j++) {
                                        if (getAllSlots[j].date.toString() === compare_date.toString() && docs2[i].status === "appointment confirmed") {
                                            console.log("inside if")
                                            console.log("getAllSlots[j].date", getAllSlots[j].date)
                                            console.log("docs2[i].bookedSlotsTime", compare_date)
                                            getAllSlots[j]["booked"] = true;
                                            //getAllSlots[j]["userDetails"] = res[i].userId;
                                        }
                                    }
                                }
                                // resp.successGetResponse(res, docs, 'timeslots List');
                                callback(null, { "availableSlots": getAllSlots });

                            } else {
                                // if there is only user timeslots
                                // resp.successGetResponse(res, docs, 'timeslots List');
                                callback(null, { "availableSlots": getAllSlots });
                            }
                        })
                    } else {
                        // if there is only employee slots
                        appointmentModel.getRemainingSlots_employee(data, (err, docs1) => {
                            if (err) {
                                console.log("////////HELLO", err);
                            } else if (docs1) {
                                for (let i = 0; i < docs1.length; i++) {
                                    let compare_date = new Date(docs1[i].bookedSlotsTime);
                                    for (let j = 0; j < getAllSlots.length; j++) {
                                        if (getAllSlots[j].date.toString() === compare_date.toString() && docs1[i].status === "appointment confirmed") {
                                            console.log("inside if")
                                            console.log("getAllSlots[j].date", getAllSlots[j].date)
                                            console.log("res[i].bookedSlotsTime", compare_date)
                                            getAllSlots[j]["booked"] = true;
                                            //getAllSlots[j]["userDetails"] = res[i].userId;
                                        }
                                    }
                                }
                                // resp.successGetResponse(res, docs, 'timeslots List');
                                callback(null, { "availableSlots": getAllSlots });

                            }
                        })
                    }
                })
            } else {
                callback(null, null);
            }
        } else {
            callback(null, null);
        }
    });
}


function getCalender(data, callback) {
    console.log("inside getSlots");
    appointmentModel.getTimeSlots(data, (err, res) => {
        if (err) {
            callback(err, null);
        } else if (res.length > 0) {
            // console.log("res]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]", res[0].slots);

            let getAllSlots = [];

            //getAllSlots = res[0].slot_timestamp;
            for (const iterator of res[0].slot_timestamp) {
                getAllSlots.push({ date: iterator.date })
            }
            // console.log("getAllSlots", getAllSlots)

            if (getAllSlots.length > 0) {
                // console.log("inside if getAllSlots", getAllSlots.length)
                appointmentModel.getRemainingSlots(data, (err, res) => {
                    if (err) {
                        callback(err, null);
                    } else if (res.length > 0) {
                        // console.log("getRemaining slots with userId", res);
                        appointmentModel.getRemainingSlots_employee(data, (err, employee_res) => {
                            if (err) {
                                callback(err, null);
                            } else if (employee_res.length > 0) {

                                // comes when both user data and employee data is present
                                console.log("getRemaining slots with employeeId", employee_res);

                                // for loop 4 user data
                                for (let i = 0; i < res.length; i++) {
                                    let compare_date = new Date(res[i].bookedSlotsTime);
                                    for (let j = 0; j < getAllSlots.length; j++) {
                                        if (getAllSlots[j].date.toString() === compare_date.toString() && res[i].status === "appointment confirmed") {
                                            console.log("Yes Matched");
                                            getAllSlots[j]["booked"] = true;
                                            getAllSlots[j]["userDetails"] = res[i].userId;
                                            getAllSlots[j]["role"] = "user";
                                            getAllSlots[j]["bookingId"] = res[i]._id;
                                            getAllSlots[j]["isRescheduled"] = res[i].rescheduled;
                                        }
                                    }
                                }

                                // for loop 4 employee data
                                for (let k = 0; k < employee_res.length; k++) {
                                    let compare_date = new Date(employee_res[k].bookedSlotsTime);
                                    for (let j = 0; j < getAllSlots.length; j++) {
                                        if (getAllSlots[j].date.toString() === compare_date.toString() && employee_res[k].status === "appointment confirmed") {
                                            console.log("Yes Matched");
                                            getAllSlots[j]["booked"] = true;
                                            getAllSlots[j]["EmployeeDetails"] = employee_res[k].employeeId;
                                            getAllSlots[j]["role"] = "employee";
                                            getAllSlots[j]["bookingId"] = employee_res[k]._id;
                                            getAllSlots[j]["isRescheduled"] = employee_res[k].rescheduled;
                                        }
                                    }
                                }


                                callback(null, { "availableSlots": getAllSlots });

                            } else {
                                // comes when only user data is present

                                for (let i = 0; i < res.length; i++) {
                                    let compare_date = new Date(res[i].bookedSlotsTime);
                                    for (let j = 0; j < getAllSlots.length; j++) {
                                        if (getAllSlots[j].date.toString() === compare_date.toString() && res[i].status === "appointment confirmed") {
                                            console.log("Yes Matched");
                                            getAllSlots[j]["booked"] = true;
                                            getAllSlots[j]["userDetails"] = res[i].userId;
                                            getAllSlots[j]["bookingId"] = res[i]._id;
                                            getAllSlots[j]["role"] = "user";
                                            getAllSlots[j]["isRescheduled"] = res[i].rescheduled;
                                        }
                                    }
                                }
                                callback(null, { "availableSlots": getAllSlots });
                            }
                        })
                        // deleteslotcore({"availableSlots": getAllSlots},callback)
                    } else {
                        appointmentModel.getRemainingSlots_employee(data, (err, employee_res) => {
                            if (err) {
                                callback(err, null);
                            } else if (employee_res.length > 0) {

                                // comes when employee data is present

                                // for loop 4 employee data
                                for (let k = 0; k < employee_res.length; k++) {
                                    let compare_date = new Date(employee_res[k].bookedSlotsTime);
                                    for (let j = 0; j < getAllSlots.length; j++) {
                                        if (getAllSlots[j].date.toString() === compare_date.toString() && employee_res[k].status === "appointment confirmed") {
                                            console.log("Yes Matched");
                                            getAllSlots[j]["booked"] = true;
                                            getAllSlots[j]["EmployeeDetails"] = employee_res[k].employeeId;
                                            getAllSlots[j]["role"] = "employee";
                                            getAllSlots[j]["bookingId"] = employee_res[k]._id;
                                            getAllSlots[j]["isRescheduled"] = employee_res[k].rescheduled;
                                        }
                                    }
                                }
                                callback(null, { "availableSlots": getAllSlots });
                            } else {
                                // comes when data is not present
                                console.log("else available slots")
                                callback(null, { "availableSlots": getAllSlots });
                            }
                        })

                    }
                })
            }
        } else {
            callback(null, null);
        }
    });
}

function getBookedSlotsById(data, callback) {
    // if (data._id.match(/^[0-9a-fA-F]{24}$/)) {
    appointmentModel.getBookedSlotsById(data, (err, res) => {
        if (err) {
            callback(err, null);
        } else if (res.length > 0) {
            console.log("res cont", res)
            callback(null, res);
        } else {
            callback(null, null);
        }
    })
    // }
}

function getEmployeeBookedSlotsById(data, callback) {
    // if (data._id.match(/^[0-9a-fA-F]{24}$/)) {
    appointmentModel.getEmployeeBookedSlotsById(data, (err, res) => {
        if (err) {
            callback(err, null);
        } else if (res.length > 0) {
            console.log("res cont", res)
            callback(null, res);
        } else {
            callback(null, null);
        }
    })
    // }
}

function bookTimeSlots(data, callback) {
    console.log("inside bookTimeSlots", data)
    appointmentModel.bookTimeSlots(data, (err, res) => {
        if (err) {
            callback(err, null);
        } else if (res) {
            callback(null, res);
        } else {
            callback(null, null);
        }
    });
}

function updateBooking(query, dataToBeUpdated, callback) {
    console.log('im here==>');
    appointmentModel.updateTimeSlots(query, dataToBeUpdated, callback);
    console.log('im here==>1');
}

function updateEmployeeBooking(query, dataToBeUpdated, callback) {
    appointmentModel.updateEmployeeTimeSlots(query, dataToBeUpdated, callback);
}

function calendar(query, callback) {
    appointmentModel.calendar(query, callback);
}

function calendarCore(document, timeSlot, callback) {
    let length = document.length;
    let iterate = 0;
    document.forEach((e) => {
        // moment(e.bookedslots.date.slice(0,10)).format("DD/MM/YYYY") ||
        console.log("eee" + e.bookedslots)
        let date = e.bookedslots.date
        timeSlot.forEach((e1) => {
            console.log("eee" + e1.date + "" + date)
            if ((e1.date == date) && (e1.day.toLowerCase() == e.bookedslots.day.toLowerCase())) {
                console.log("eee" + e1.date + "" + date)
                e.bookedslots.slots.forEach((e2) => {
                    e1.slots.forEach((e3, index) => {
                        if ((e2.from == e3.from) && (e2.cancel_appointment == false)) {
                            e1.slots[index]['userId'] = e.userId;
                            appointmentModel.calendarCore({ _id: e.userId }, (err, user) => {
                                if (err) {
                                    callback(err, null)
                                }
                                if (user) {
                                    e1.slots[index]['name'] = user["first_name"] + " " + user["last_name"];
                                    console.log(e1.slots[index])
                                    iterate++
                                    console.log("inside" + length + "" + iterate)
                                    if (length == iterate) {
                                        callback(null, timeSlot);

                                    }
                                } else {
                                    callback(null, null)
                                }

                            })
                        }
                        if ((e2.from == e3.from) && (e2.cancel_appointment == true)) {
                            iterate++
                            console.log("outside" + length + "" + iterate)
                            e1.slots.splice(index, 1)
                            if (length == iterate) {
                                callback(null, timeSlot)
                            }
                        }

                    });
                })
            }
            //    if((length== 1) &&(0 == e.bookedslots.slots.length)){
            //        callback(null,timeSlot)
            //    }
            //    if((length > 1) &&(e1.date == date) && (e1.day.toLowerCase() == e.bookedslots.day.toLowerCase()) && (0 == e.bookedslots.slots.length)){
            //        console.log(iterate)
            //         iterate++;
            //    }
        })

    })
}

function getdeleteslot(id, timeSlot, callback) {
    appointmentModel.getdeleteslot(id, (err, docs) => {
        if (err) {
            callback(err, null)
        }
        if (docs.cancelSlots.length != 0) {
            deleteslotcore(docs.cancelSlots, timeSlot, callback)
        }
        else {
            callback(null, timeSlot.availableSlots)
        }
    })
}

function deleteslotcore(cancelslots, data, callback) {
    let length = cancelslots.length;
    let iterate = 0;
    console.log("data1" + JSON.stringify(cancelslots))
    cancelslots.forEach((e1, index1) => {
        data.availableSlots.forEach((e, index) => {
            e1.slots.forEach((e2) => {
                e.slots.forEach((e3, index2) => {
                    if ((e.date == e1.date) && (e.day.toLowerCase() == e1.day.toLowerCase())) {
                        console.log(e3.from + "" + e2.from + "" + e1.date)
                        if (e3.from == e2.from) {

                            iterate++
                            e.slots.splice(index2, 1)
                            console.log(e.slots)
                            if (length == iterate) {
                                console.log(data)
                                callback(null, data)
                            }
                        }
                    }
                })
            })
        })
    })
}

function deleteslot(id, timeSlot, current, callback) {
    console.log("hhh")
    appointmentModel.deleteslot(id, current, (err, data) => {
        if (err) {
            callback(null, null)
        }
        console.log("data" + data)
        if (data) {
            deleteslotcore(data.cancelSlots, timeSlot, callback)
        }
    })
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
                                    getTimeSlots({ doctorId: body.doctorId }, (err, docs) => {
                                        if (err) {
                                            callback(err, null)
                                        }
                                        console.log(JSON.stringify(docs))
                                        if (docs) {
                                            let timeSlot = docs.availableSlots
                                            calendar({ doctorId: body.doctorId }, (err, document) => {
                                                if (err) {
                                                    resp.errorResponse(res, err, 501, 'Error While fetching data');
                                                }
                                                if (document) {
                                                    console.log(document)
                                                    calendarCore(document, timeSlot, (err, result) => {
                                                        if (err) {
                                                            resp.errorResponse(res, err, 501, 'Error While fetching data');
                                                        }
                                                        if (result) {
                                                            //console.log("resut"+JSON.stringify)
                                                            getdeleteslot({ doctorId: body.doctorId }, { "availableSlots": result }, (err, results) => {
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

function getDoctorTimeSlots(query, callback) {
    console.log("inside getDoctorTimeSlots", query)
    appointmentModel.getTimeSlots(query, (err, res) => {
        if (err) {
            callback(err, null);
        } else if (res.length > 0) {
            console.log("res cont", res)
            callback(null, res);
        } else {
            callback(null, null);
        }
    })
}

function appointmentRescheduleEmail(data, callback) {
    EmailTemplate.rescheduleAppointmentEmail(data, callback)
}

function feedbackEmail(data, callback) {
    EmailTemplate.feedbackEmail(data, callback)
}

function getBookingCount(data, callback) {
    appointmentModel.getBookingCount(data, callback)
}



module.exports = {
    createSlots,
    getTimeSlots,
    bookTimeSlots,
    updateBooking,
    getBookedSlotsById,
    getEmployeeBookedSlotsById,
    calendar,
    calendarCore,
    deleteslot,
    cancelappointment,
    getdeleteslot,
    getDoctorTimeSlots,
    updateDoctorTimeslots,
    getTimeSlotsAvailabilty,
    getCalender,
    appointmentRescheduleEmail,
    findBookingById,
    feedbackEmail,
    cancelTimeslots,
    createSingleSlots,
    getBookingCount,
    createInterestedWith,
    updateEmployeeBooking
}
