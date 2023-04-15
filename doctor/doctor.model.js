const Doctors = require('../projects/models/doctors.model').doctorModel;
const DoctormodelHelper = require('../projects/model_helpers/doctor_model.helper')
const TimeSlots = require('../projects/models/timeslots.model').timeSlotsModel
const BookSlots = require('../projects/models/bookslots.model').bookingSlotsModel

const getAllDcotors = (callback) => {
  Doctors.aggregate(
    [
       {
         $lookup:
           {
             from: "bookedslots",
             localField: "_id",
             foreignField: "doctorId",
             as: "booking_details"
           }
       },
       {$project: {_id: 1, name: 1, emailId: 1, mobileNo: 1, account_number: 1, bank: 1, branch: 1, ifsc_code: 1, 
        booking_details: {
          $filter: {
            input: "$booking_details",
            as: "item",
            cond: {
              $and: [
                {$eq: ["$$item.status", "appointment closed"]},
                {$eq: ["$$item.booking_status", "paid"]},
                {$eq: ["$$item.payout_status", "unpaid"]}
              ]
            }
          }
        } 
      }}
    ]
   ).exec(callback)
};

const getProfileDetailsById = (query) => {
  return new Promise((resolve, reject) => {
    Doctors.findOne(query).then(
          (data) => resolve(data),
          (err) => reject(err)
      )
  })
};

function addProfile(project, callback) {
    Doctors.create(project, (err, res) => {
      if (err) {
        console.log("error while adding product:", err);
        callback(err, null);
      } else if (res) {
        console.log("profile added successfully:", res);
        callback(null, res);
      } else {
        callback(null, null);
      }
    });
}

const findUser = (query, callback) => {
  console.log("searching for location");
  DoctormodelHelper.find({ query: query }, (err, res) => {
      if (err) {
          console.log("Doctor Model Error:", err);
          callback(err, null);
      } else if (res.length > 0) {
          console.log("Doctor Model Result:", res);
          callback(null, res);
      } else {
          callback(null, null);
      }
  });
}

function getAllPostedProfile(options, callback) {
  console.log("========3========");
  console.log("options", options)
  Doctors.find(options,"-password -account_number -bank -branch -ifsc_code -council -profession -city", (err, res) => {
    if (err) {
      console.log("profile Model Error:", err);
      callback(err, null);
    } else if (res.length>0) {
      let count = res.length;
      console.log("doctor profile Result:", { profile: res});
      callback(null, { profile: res});
    } else {
      callback(null, null);
    }
  });
}

function getPostedProfileByOptions(options, callback) {
  console.log("inside doctormodel")
  DoctormodelHelper.findAll(options, (err, res) => {
    if (err) {
      console.log("profile Model Error:", err);
      callback(err, null);
    } else if (res.length>0) {
      let count = res.length;
      console.log("doctor profile Result:", { profile: res});
      callback(null, { profile: res});
    } else {
      callback(null, null);
    }
  });
}


const login = (query, callback) => {
  console.log('doctorModel Data');
  console.log(query);
  DoctormodelHelper.find({ query }, (err, res) => {
      if (err) {
          console.log("User Model Error", err);
          callback(err, null);
      } else if (res.length > 0) {
          console.log("Doctor Model Result", res);
          callback(null, res);
      } else {
          callback(null, "Invalid email/mobileNo");
      }
  });
}

const findUserEmailPhone = (body, callback) => {
  console.log("inside findUserEmailPhone model");
  DoctormodelHelper.findEmailPhone(body, (err, res) => {
      if (err) {
          console.log("Doctor Model Error:", err);
          callback(err, null);
      } else if (res.length > 0) {
          console.log("Doctor Model Result:", res);
          callback(null, res);
      } else {
          callback(null, null);
      }
  });
}

const findUserAndUpdate = (query, data, callback) => {
  console.log('==========3==========');
  console.log(data);
  console.log('-----------------------------------');
  console.log(query);
  DoctormodelHelper.update({ query: query, update: data, options: { new: true, select: '-password' } }, (err, res) => {
      //console.log("========5========");
      if (err) {
          // console.log("======err======");
          console.log("Doctor Model Error:", err);
          callback(err, null);
      } else if (res) {
          //console.log("======res======");
          console.log("Doctor Model Result:", res);
          callback(null, res);
      } else {
          //console.log("=====else null=====");
          callback(null, null);
      }
  });
}

const updateDoctorNots = (query, data, callback) => {
  console.log('==========updateDoctorNots==========');
  console.log(data);
  console.log('-----------------------------------');
  console.log(query);
  BookSlots.updateOne(
    { _id: "60a342c06f2765312c64e9be", "session.video_call_id": "2636" },
    { $set: { "session.$.booking_status" : "failed" } })
        .exec(callback)
        console.log(callback);
}


function createPassword(body,hash,callback){
  Doctors.findOneAndUpdate({$or:[{emailId:body.emailId},{mobileNo:body.mobileNo}]},{password:hash,password_created:true},{new:true},callback)

}
module.exports = {
    addProfile,
    getAllPostedProfile,
    getPostedProfileByOptions,
    login,
    findUserEmailPhone,
    getProfileDetailsById,
    findUser,
    findUserAndUpdate,
    createPassword,
    updateDoctorNots,
    getAllDcotors
}