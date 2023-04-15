const TimeSlots = require('../projects/models/timeslots.model').timeSlotsModel
const BookSlots = require('../projects/models/bookslots.model').bookingSlotsModel
const employeeBookSlots = require('../projects/models/employee-booking.model').employeeBookingSlotsModel;
const users = require('../projects/models/users.model').UserModel
const interest = require('../projects/models/interestedWith.model').interestedWithModel

function createdInterestedWith(data, callback) { 
  if (data) { 
    console.log("ID__________________________________________", data._id);
    console.log("data________________________________________", data)
    interest.create(data, (err, res) => {
      if (err) {
        console.log("error while creating interestedWith:", err);
        callback(err, null);
      } else if (res) {
        console.log("interestedWith created successfully:", res);
        interest.find(data)
          .populate("userId", { first_name: 1, last_name: 1, emailId: 1 })
          .exec(callback)
        // console.log("result", res)
        // callback(null, res);
      } else {
        callback(null, null);
      }
    })
  }
}

function addTimeSlots(data, callback) {
  console.log("inside add time slots");
  TimeSlots.create(data, (err, res) => {
    if (err) {
      console.log("error while adding slots:", err);
      callback(err, null);
    } else if (res) {
      console.log("slots added successfully:", res);
      callback(null, res);
    } else {
      callback(null, null);
    }
  })
}

function getTimeSlots(options, callback) {
  console.log("inside appointment model timeslots")
  if (options.doctorId) {
    console.log("inside if");
    TimeSlots.find(options)
      .exec(callback)
  }
}

function cancelSlots(options, data, callback) {
  console.log("inside appointment model cancelSlots")
  console.log("options", options);
  console.log("data", data)
  if (options.doctorId) {
    TimeSlots.updateOne(
      options,
      { $pull: { slot_timestamp: { date: data.cancel_slot } } },
      { multi: true }
    ).exec(callback)
  }

}

function createSingleSlots(options, data, callback) {
  console.log("inside appointment model create_slot")
  console.log("options", options);
  console.log("data", data)
  if (options.doctorId) {
    // TimeSlots.updateOne(
    //   options, 
    //   { $push: { slot_timestamp: { date: data.create_slot } } },
    //   {multi:true}
    // ).exec(callback)

    TimeSlots.update(
      options,
      {
        $push: {
          slot_timestamp: {
            $each: [{ date: data.create_slot }],
            $sort: { date: 1 },
          }
        }
      }
    ).exec(callback)

  }

}

function getRemainingSlots(options, callback) {
  console.log("inside getremaining slots");
  if (options.doctorId) {
    console.log("inside if get remaining slots")
    BookSlots.find(options)
      .populate("userId", { first_name: 1, last_name: 1 })
      .exec(callback)
  }
}

function getRemainingSlots_employee(options, callback) {
  console.log("inside getremaining_employee slots");
  if (options.doctorId) {
    console.log("inside if get remaining slots")
    employeeBookSlots.find(options)
      .populate("employeeId", { first_name: 1, last_name: 1 })
      .exec(callback)
  }
}

function getBookedSlotsById(options, callback) {
  console.log("inside getBookedSlotsById", options);
  let query = {}
  query["_id"] = options;
  console.log(query)
  if (options) {
    BookSlots.find(query)
      .populate('userId')
      .populate('doctorId')
      .exec(callback)
  }
}

function getEmployeeBookedSlotsById(options, callback) {
  console.log("inside getBookedSlotsById", options);
  let query = {}
  query["_id"] = options;
  console.log(query)
  if (options) {
    employeeBookSlots.find(query)
      .populate('employeeId')
      .populate('doctorId')
      .exec(callback)
  }
}

function findBookingById(options, callback) {
  console.log("inside findBookingById", options);
  if (options) {
    BookSlots.find(options)
      .exec(callback)
  }
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

function updateTimeSlots(_id, data, callback) {
  console.log("inside update time slots")
  console.log("id", _id);
  console.log("data", data);

  if (_id && data) {
    BookSlots.findOneAndUpdate(_id, data, { new: true })
      .populate("userId", { first_name: 1, emailId: 1, mobileNo: 1 })
      .populate("doctorId", { name: 1, emailId: 1 })
      .exec(callback)
    // console.log("callback::",callback);
  }
}


function updateEmployeeTimeSlots(_id, data, callback) {
  console.log("inside update time slots")
  console.log("id", _id);
  console.log("data", data);
  if (_id && data) {
    employeeBookSlots.findOneAndUpdate(_id, data, { new: true })
      .populate("employeeId", { first_name: 1, emailId: 1, mobileNo: 1 })
      .populate("doctorId", { name: 1, emailId: 1 })
      .exec(callback)
    console.log(callback);
  }
}

function updateDoctorTimeslots(_id, data, callback) {
  console.log("inside updateDoctorTimeslots")
  console.log("id", _id);
  console.log("data", data);
  if (_id && data) {
    TimeSlots.findOneAndUpdate(_id, data, { new: true }, callback);
    console.log(callback);
  }
}
function calendar(query, callback) {
  console.log(query)
  if (query) {
    BookSlots.find(query, callback);
  }
}

function calendarCore(data, callback) {
  if (data) {
    console.log(data)
    users.findById(data, callback);
  }
}
function deleteslot(id, current, callback) {
  if (id) {
    console.log(current)
    let objFriends = { date: current[0].date, day: current[0].day, slots: current[0].slots }

    TimeSlots.findOneAndUpdate({ doctorId: id.doctorId }, { $push: { cancelSlots: objFriends } }, { new: true }, callback)
    console.log(callback);
  }
}

function getdeleteslot(id, callback) {
  TimeSlots.findOne({ doctorId: id.doctorId }, callback);
}

function cancelappointment(body, callback) {
  console.log(body)
  if (body) {
    BookSlots.find({ $and: [{ userId: body.userId }, { doctorId: body.doctorId }] }, callback);
    console.log(callback);
  }

}

function cancelappointmentsave(body, data, callback) {
  console.log(JSON.stringify(body) + "hhh" + data)
  BookSlots.findOneAndUpdate({ $and: [{ userId: body.userId }, { doctorId: body.doctorId }] }, { bookedslots: data }, { new: true }, callback);

}

function getAllBooking(query, callback) {
  BookSlots.find(query)
    .populate('userId', { first_name: 1, emailId: 1, mobileNo: 1 })
    .populate('doctorId', { name: 1, emailId: 1, mobileNo: 1 })
    .exec(callback)
}

function getAllEmployeeBooking(query, callback) {
  employeeBookSlots.find(query)
    .populate('employeeId', { first_name: 1, emailId: 1, mobileNo: 1 })
    .populate('doctorId', { name: 1, emailId: 1, mobileNo: 1 })
    .exec(callback)
}

function updateBooking(query, data, callback) {
  console.log("inside update updateBooking")
  console.log("query", query);
  console.log("data", data);
  if (query && data) {
    BookSlots.findOneAndUpdate(query, data, { new: true })
      .populate('userId', { first_name: 1, emailId: 1 })
      .populate('doctorId', { name: 1, emailId: 1 })
      .exec(callback)
    console.log(callback);
  }
}


function updateEmployeeBooking(query, data, callback) {
  console.log("inside update updateBooking")
  console.log("query", query);
  console.log("data", data);
  if (query && data) {
    employeeBookSlots.findOneAndUpdate(query, data, { new: true })
      .populate('employeeId', { first_name: 1, emailId: 1 })
      .populate('doctorId', { name: 1, emailId: 1 })
      .exec(callback)
    console.log(callback);
  }
}

function getBookingCount(data, callback) {
  BookSlots.find(data)
    .count()
    .exec(callback)
}

module.exports = {
  addTimeSlots,
  getTimeSlots,
  bookTimeSlots,
  getRemainingSlots,
  getRemainingSlots_employee,
  updateTimeSlots,
  getBookedSlotsById,
  getEmployeeBookedSlotsById,
  calendar,
  calendarCore,
  deleteslot,
  cancelappointment,
  cancelappointmentsave,
  getdeleteslot,
  updateDoctorTimeslots,
  findBookingById,
  cancelSlots,
  createSingleSlots,
  getAllBooking,
  updateBooking,
  getBookingCount,
  createdInterestedWith,
  getAllEmployeeBooking,
  updateEmployeeBooking,
  updateEmployeeTimeSlots
}