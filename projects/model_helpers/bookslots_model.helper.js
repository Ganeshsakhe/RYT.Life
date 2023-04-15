const Model = require('../models/bookslots.model').bookingSlotsModel;
const employeeSlotModel = require('../models/employee-booking.model').employeeBookingSlotsModel;

function getBookedSlots(options = {}, callback) {
    console.log("inside bookedSlot model helper", options)
    if (options.userId) {
        Model.find(options)
            .populate('doctorId', '-password -account_number -bank -branch -ifsc_code')
            .exec(callback)
    }
}

function getEmployeeBookedSlots(options = {}, callback) {
    console.log("inside bookedSlot model helper", options)
    if (options.employeeId) {
        employeeSlotModel.find(options)
            .populate('doctorId', '-password -account_number -bank -branch -ifsc_code')
            .exec(callback)
    }
}

function getBookedSlotsForDoctor(options = {}, callback) {
    //console.log("inside getBookedSlotsForDoctor model helper", options)
    let data = {};
    data["bookedSlotsTime"] = 1;
    console.log("sortdata", data);
    if (options) {
        return Model.find(options)
            .populate('userId', '-password')
            .sort(data)
            .exec(callback)
    }
    return []
}

function getBookedSlotsForDoctor_employee(options = {}, callback) {
    let data = {};
    data["bookedSlotsTime"] = 1;
    console.log("sortdata", data);
    if (options) {
        return employeeSlotModel.find(options)
            .populate('employeeId', '-password')
            .sort(data)
            .exec(callback)
    }
    return []
}

function getAllfinance(options = {}, callback) {
    console.log("inside getAllfinance model helper", options)
    let data = {};
    data["bookedSlotsTime"] = 1;
    console.log("sortdata", data);
    if (options) {
        Model.find(options, { bookedSlotsTime: 1, booking_status: 1, order: 1 })
            .populate('userId', { first_name: 1, last_name: 1 })
            .sort(data)
            .exec(callback)
    }
}

function getSession111(options = {}, callback) {
    console.log("inside getSession model helper", options)
    let data = {};
    data["bookedSlotsTime"] = 1;
    console.log("sortdata", data);
    if (options) {
        Model.find(options)
            .sort(data)
            .exec(callback)
    }
}

function getSession(options) {
    if (options) {
        return Model.find(options)
    }
    return []
}

function getEmployeeSession(options) {
    if (options) {
        console.log("options", options);
        return employeeSlotModel.find(options)
    }
    return []
}

module.exports = {
    getBookedSlots,
    getBookedSlotsForDoctor,
    getAllfinance,
    getSession,
    getSession111,
    getEmployeeSession,
    getEmployeeBookedSlots,
    getBookedSlotsForDoctor_employee
}

//Model.find({ doctorId: "609a62cb4c6cda0790dbc216", userId: "605197473f537838a4be1296" }).then(console.log).catch(console.log)