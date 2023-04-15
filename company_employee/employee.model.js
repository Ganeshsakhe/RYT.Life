const mongoose = require('mongoose');
const UserModelHelper = require('../projects/model_helpers/user_model.helper');
const EmployeeModel = require('../projects/models/company-employee.model').EmployeeModel;
const doctorModel = require('../projects/models/doctors.model').doctorModel;
const userBookSlots = require('../projects/models/bookslots.model').bookingSlotsModel
const BookSlots = require('../projects/models/employee-booking.model').employeeBookingSlotsModel;


const findEmployeeDomain = (body, callback) => {
  console.log("inside findEmployeeModelError model");
  UserModelHelper.findDomain(body, (err, res) => {
    if (err) {
      console.log("Employee Model Error:", err);
      callback(err, null);
    } else if (res.length > 0) {
      console.log("Employee Model Result:", res);
      callback(null, res);
    } else {
      callback(null, null);
    }
  });
}


const employeeSignUp = (body, callback) => {
  console.log("inside SignUp Employee Model");
  EmployeeModel.create(body, (err, res) => {
    if (err) {
      console.log("error while signing up Employee slots:", err);
      callback(err, null);
    } else if (res) {
      console.log("Employee Signedup successfully:", res);
      console.log("result", res)
      callback(null, res);
    } else {
      callback(null, null);
    }
  })
}


const employeeLogin = (query, callback) => {
  console.log('employeeModel query');
  console.log(query);
  UserModelHelper.findEmployee({ query }, (err, res) => {
    if (err) {
      console.log("User Model Error", err);
      callback(err, null);
    } else if (res.length > 0) {
      console.log("User Model Result", res);
      callback(null, res);
    } else {
      callback(null, "Invalid email/mobileNo");
    }
  });
}

function bookTimeSlots(data, callback) {
  if (data) {
    console.log("ID__________________________________________", data._id);
    console.log("data________________________________________", data)
    BookSlots.create(data, (err, res) => {
      if (err) {
        console.log("error while booking slots:", err);
        callback(err, null);
      } else if (res) {
        console.log("slots booked successfully:", res);
        console.log("result", res)
        callback(null, res);
      } else {
        callback(null, null);
      }
    })
  }
}

function getBookedSlotsById(options, callback) {
  console.log("inside getBookedSlotsById", options);
  let query = {}
  query["_id"] = options["_id"];
  console.log(query)
  if (options) {
    BookSlots.find(query)
      .populate('employeeId')
      .populate('doctorId')
      .exec(callback)
  }
}

function getEmployeeById(options, callback) {
  console.log("inside getBookedSlotsById", options);
  let query = {}
  query["_id"] = options["_id"];
  console.log(query)
  if (options) {
    EmployeeModel.find(query)
      .populate('companyId')
      .exec(callback)
  }
}

function updateBooking(query, data, callback) {
  console.log("inside update updateBooking")
  console.log("query", query);
  console.log("data", data);
  if (query && data) {
    BookSlots.findOneAndUpdate(query, data, { new: true })
      .populate('employeeId')
      .populate('doctorId')
      .exec(callback)
    console.log(callback);
  }
}

function updateTimeSlots(_id, data, callback) {
  console.log("inside update time slots")
  console.log("id", _id);
  console.log("data", data);
  if (_id && data) {
    BookSlots.findOneAndUpdate(_id, data, { new: true })
      .populate("employeeId")
      .populate("doctorId")
      .exec(callback)
    console.log(callback);
  }
}

const getProfileDetailsById = (query) => {
  return new Promise((resolve, reject) => {
    EmployeeModel.findOne(query).populate("companyId", { company_name: 1, company_logo: 1 }).then(
      (data) => resolve(data),
      (err) => reject(err)
    )
  })
};


function findUser(data, callback) {
  console.log("admin model", data)
  if (data) {
    EmployeeModel.find(data, callback)
  }
}

const findUserAndUpdate = (query, data, callback) => {
  console.log('==========3==========');
  console.log(data);
  console.log('-----------------------------------');
  console.log(query);
  UserModelHelper.updateEmployee({ query: query, update: data, options: { new: true } }, (err, res) => {
    //console.log("========5========");
    if (err) {
      // console.log("======err======");
      console.log("User Model Error:", err);
      callback(err, null);
    } else if (res) {
      //console.log("======res======");
      console.log("User Model Result:", res);
      callback(null, res);
    } else {
      //console.log("=====else null=====");
      callback(null, null);
    }
  });
}

const getTimeSlotsById = (data, callback) => {
  console.log("inside getBookedSlotsById123", data);
  if (data) {
    doctorModel.aggregate(
      [
        { $match: { _id: mongoose.Types.ObjectId(`${data["_id"]}`), corperate_doctor: true, blocked: false } },
        {
          $lookup:
          {
            from: "timeslots",
            localField: "_id",
            foreignField: "doctorId",
            as: "calender"
          }
        },
        { $project: { name: 1, corperate_appointments: 1, "calender.slot_timestamp": 1 } }
      ]
    ).exec(callback)
  }
}


const getTimeSlots = (callback) => {
  console.log("//////////////\n", typeof (query));
  doctorModel.aggregate(
    [
      { $match: { corperate_doctor: true, blocked: false } },
      {
        $lookup:
        {
          from: "timeslots",
          localField: "_id",
          foreignField: "doctorId",
          as: "calender"
        }
      },
      { $project: { name: 1, corperate_appointments: 1, "calender.slot_timestamp": 1 } }
    ]
  ).exec(callback)
}

function getRemainingSlots_employee(options, callback) {
  console.log("inside getRemainingSlots_employee slots");
  // if (options.employeeId) {
  console.log("inside if get getRemainingSlots_employee slots")
  BookSlots.find(options)

    .exec(callback)
  // }
}

function getRemainingSlots(options, callback) {
  console.log("inside getremaining slots");
  // if (options.userId) {
  console.log("inside if get remaining slots")
  userBookSlots.find(options)

    .populate("userId", { first_name: 1, last_name: 1 })
    .exec(callback)
  // }
}

function getRemainingSlotsAdminCalendarAPI(options, callback) {
  console.log("inside getremaining slots");
  // if (options.userId) {
  console.log("inside if get remaining slots")
  return userBookSlots.find(options, {bookedSlotsTime: 1, doctorId: 1})
    .exec(callback);
}



module.exports = {
  findEmployeeDomain,
  employeeSignUp,
  employeeLogin,
  bookTimeSlots,
  getBookedSlotsById,
  updateBooking,
  updateTimeSlots,
  getProfileDetailsById,
  findUser,
  findUserAndUpdate,
  getTimeSlots,
  getRemainingSlots,
  getRemainingSlotsAdminCalendarAPI,
  getRemainingSlots_employee,
  getTimeSlotsById,
  getEmployeeById
}
