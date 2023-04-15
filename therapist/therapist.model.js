const Therapists = require('../projects/models/therapists.model').therapistModel;
const TherapistmodelHelper = require('../projects/model_helpers/therapist_model.helper')
const TimeSlots = require('../projects/models/timeslots.model').timeSlotsModel
const BookSlots = require('../projects/models/bookslots.model').bookingSlotsModel

const getAllTherapists = (callback) => {
  Therapists.aggregate(
    [
       {
         $lookup:
           {
             from: "bookedslots",
             localField: "_id",
             foreignField: "therapistId",
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
    Therapists.findOne(query).then(
          (data) => resolve(data),
          (err) => reject(err)
      )
  })
};

function addProfile(project, callback) {
    Therapists.create(project, (err, res) => {
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
  TherapistmodelHelper.find({ query: query }, (err, res) => {
      if (err) {
          console.log("Therapist Model Error:", err);
          callback(err, null);
      } else if (res.length > 0) {
          console.log("Therapist Model Result:", res);
          callback(null, res);
      } else {
          callback(null, null);
      }
  });
}

function getAllPostedProfile(options, callback) {
  console.log("========3========");
  console.log("options", options)
  Therapists.find(options,"-password -account_number -bank -branch -ifsc_code -council -profession -city", (err, res) => {
    if (err) {
      console.log("profile Model Error:", err);
      callback(err, null);
    } else if (res.length>0) {
      let count = res.length;
      console.log("therapist profile Result:", { profile: res});
      callback(null, { profile: res});
    } else {
      callback(null, null);
    }
  });
}

function getPostedProfileByOptions(options, callback) {
  console.log("inside therapistmodel")
  TherapistmodelHelper.findAll(options, (err, res) => {
    if (err) {
      console.log("profile Model Error:", err);
      callback(err, null);
    } else if (res.length>0) {
      let count = res.length;
      console.log("therapist profile Result:", { profile: res});
      callback(null, { profile: res});
    } else {
      callback(null, null);
    }
  });
}


const login = (query, callback) => {
  console.log('therapistModel Data');
  console.log(query);
  TherapistmodelHelper.find({ query }, (err, res) => {
      if (err) {
          console.log("User Model Error", err);
          callback(err, null);
      } else if (res.length > 0) {
          console.log("Therapist Model Result", res);
          callback(null, res);
      } else {
          callback(null, "Invalid email/mobileNo");
      }
  });
}

const findUserEmailPhone = (body, callback) => {
  console.log("inside findUserEmailPhone model");
  TherapistmodelHelper.findEmailPhone(body, (err, res) => {
      if (err) {
          console.log("Therapist Model Error:", err);
          callback(err, null);
      } else if (res.length > 0) {
          console.log("Therapist Model Result:", res);
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
  TherapistmodelHelper.update({ query: query, update: data, options: { new: true, select: '-password' } }, (err, res) => {
      //console.log("========5========");
      if (err) {
          // console.log("======err======");
          console.log("Therapist Model Error:", err);
          callback(err, null);
      } else if (res) {
          //console.log("======res======");
          console.log("Therapist Model Result:", res);
          callback(null, res);
      } else {
          //console.log("=====else null=====");
          callback(null, null);
      }
  });
}

const updateTherapistNots = (query, data, callback) => {
  console.log('==========updateTherapistNots==========');
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
  Therapists.findOneAndUpdate({$or:[{emailId:body.emailId},{mobileNo:body.mobileNo}]},{password:hash,password_created:true},{new:true},callback)

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
    updateTherapistNots,
    getAllTherapists
}