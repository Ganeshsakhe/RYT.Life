const employeeModel = require('../company_employee/employee.model');
const validators = require("../../helpers/validators");
var request = require('request');
const bookedslotsModel = require('../projects/model_helpers/bookslots_model.helper');
const EmailTemplate = require("../projects/model_helpers/email_template");

const findEmployeeDomain = (body, callback) => {
  console.log("inside findEmployeeDomain");
  console.log('body', body);
  let EmployeeDomain = body["emailId"].split('@');
  EmployeeDomain = '@' + EmployeeDomain[1];
  console.log("EMPLOYEE DOMAIN", EmployeeDomain);
  let obj = {
    "company_domain": EmployeeDomain
  }
  console.log("/////////////////////>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n", EmployeeDomain);
  employeeModel.findEmployeeDomain(obj, (err, docs) => {
    if (err) {
      console.log(err);
    } else if (docs) {
      callback(null, docs);
    } else {
      callback(null, null);
    }
  })
}

function employeeEmailOtpLogin(data, callback) {
  console.log('inside user otp login', data);
  if (data) {
    let query = {
      "emailId": data["emailId"]
    }
    employeeModel.employeeLogin(query, (err, res) => {
      console.log("Employee MODEL");
      console.log('res', res);
      if (err) {
        callback(err, null);
      } else if (res[0].emailId) {
        validators.generateJWTToken(res[0]._id, (err, token) => {
          callback(null, { token: token, role: "employee" });
        });
      } else if (res === "Invalid email/mobileNo") {
        employeeModel.employeeSignUp(data, (err, docs) => {
          if (err) {
            console.log(err);
          } else if (docs) {
            console.log(docs);
            validators.generateJWTToken(docs._id, (err, token) => {
              callback(null, { token: token, docs: docs, role: "employee" });
            });
          }
        })
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
}

function bookTimeSlots(data, callback) {
  console.log("inside bookTimeSlots", data)
  employeeModel.bookTimeSlots(data, (err, res) => {
    if (err) {
      callback(err, null);
    } else if (res) {
      callback(null, res);
    } else {
      callback(null, null);
    }
  });
}


function getBookedSlotsById(data, callback) {
  // if (data._id.match(/^[0-9a-fA-F]{24}$/)) {
  console.log("////////////\n", data);
  employeeModel.getBookedSlotsById(data, (err, res) => {
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


function getEmployeeById(data, callback) {
  console.log("////////////\n", data);
  employeeModel.getEmployeeById(data, (err, res) => {
    if (err) {
      console.log("EMPLOYEEDETAILS///////ERR\n", err);
      callback(err, null);
    } else if (res.length > 0) {
      console.log("EMPLOYEEDETAILS/////////RES\n", res);
      callback(null, res);
    } else {
      console.log("EMPLOYEEDETAILS/////////ELSE\n", res);
      callback(null, null);
    }
  })
}

function updateBooking(query, dataToBeUpdated, callback) {
  employeeModel.updateTimeSlots(query, dataToBeUpdated, callback);
}

function UpdateVideoUrl(data, callback) {
  getBookedSlotsById(data["_id"], (err, response) => {
    if (err) {
      console.log("err", err);
      callback(err, null);
    } else if (response.length > 0) {
      console.log("%%%%%%%%%%%%%%%%%%%%%\n", response);
      request({
        method: "POST",
        url: "https://roomsvc-dot-sprpro-282209.el.r.appspot.com/videocallstart",
        body: {
          "usersAdd": [
            { "name": "Employee", "email": response[0].employeeId.emailId, "role": "Employee" },
            { "name": response[0].doctorId.name, "email": response[0].doctorId.emailId, "role": "Doctor" },
          ],
          config: { enableRecording: 0, enableChat: 1, enableScreenShare: 0 }
        },
        json: true,
        headers: {
          "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cnVldGVjaGxhYnMiLCJidXNpbmVzc0lkIjoiZmZRd0RFbjdNRHpjek9kRzFHZEUiLCJtb2RlIjoicHJvZCIsImFjY2Vzc0xldmVsIjoiMCIsInZpZFN1YkRvbWFpbiI6Imh0dHBzOi8vbWVldC5yeXQubGlmZSIsImFkbWluIjp0cnVlLCJpYXQiOjE2MjAyMDg2MDF9.aVh3VZVmEXItHR89amz5HFZmQyMzRNcsrQCNeER3DL5nX2qR4KBlkU5FQPZfJ5Q2d7Qyn3Slzkgpx1ho5f9oUhQDa3AemAhKZbmKIGCy3FfTKlA32VwN34iGk-B4CWK6ZXJ0sg0NgXVgRtKq2iF6N5rtZVzzs93D344Pj2AuiRY",
          "Accept": "application/json"
        }

      }, (error, response, body) => {
        console.log("superpro error", error);
        console.log('superpro body:', body);
        if (error) {
          console.log("superpro error");
          resp.unsuccessGetResponse(res, error, 'unable to create superpro videocall');
        } else if (body) {
          console.log("superpro success\n", body);
          const query = {};
          query['_id'] = data["_id"];
          const dataToBeUpdated = {
            "video_call_url": body.videoCallUrl,
            "video_call_id": body.videoCallId,
            "status": "appointment confirmed"
          }
          updateBooking(query, dataToBeUpdated, (err, docs) => {
            if (err) {
              console.log("error while booking slots");
              console.log(err)
            } else if (docs) {
              console.log("docs", docs)
              console.log("booking success");
              callback(null, docs);
              // EmailTemplate.bookingSuccessEmail(docs, (err, res) => {
              //     if (err) {
              //       console.log("err", err)
              //     } else if (res) {
              //       console.log("res", res)
              //     } else {
              //       console.log("else")
              //     }
              // });
            } else {
              console.log("unable to fetch doctors");
            }
          })
        } else {
          resp.noRecordsFound(res, 'Unable to get any response from superpro');
        }
      })
    } else {
      callback(null, null);
    }
  });
}

const getProfile = (user) => {
  return new Promise((resolve, reject) => {
    console.log("USER!", user);
    employeeModel.getProfileDetailsById({ _id: user._id }).then(
      (data) => resolve(data),
      (err) => reject(err)
    )
  })
};


const updateUser = (query, userDetails, callback) => {
  console.log("userDetails");
  console.log(userDetails);
  employeeModel.findUserAndUpdate(query, userDetails, callback);
}

const getBookedSlots = (query, callback) => {
  bookedslotsModel.getEmployeeBookedSlots(query, callback)
}


function getTimeSlotsById(data, callback) {
  employeeModel.getTimeSlotsById(data, (err, res) => {
    if (err) {
      console.log("&&&&&&&&&&&&&&&&&", err);
      callback(null, null);
    } else if (res) {
      console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", res);
      callback(null, res);
    } else {
      console.log("&&&&&&//////////////", res);
      callback(null, null);
    }
  })
}

function getTimeSlots(callback) {
  employeeModel.getTimeSlots((err, res) => {
    if (err) {
      callback(null, null);
    } else if (res) {
      // console.log("/////CALENDER/////\n", res);
      var remaining_slots = [];
      for (var i = 0; i < res.length; i++) {
        let remianing_slots_calender = [];
        var obj = {
          "_id": res[i]._id,
          "name": res[i].name,
          "calender": [

          ]
        }
        if (res[i].corperate_appointments !== undefined) {
          obj["corperate_appointments"] = res[i].corperate_appointments;
        }
        if (res[i].calender.length !== 0) {
          let query = { "doctorId": res[i]._id };
          // 
          for (var j = 0; j < res[i].calender[0].slot_timestamp.length; j++) {
            let current_date1 = new Date();
            let current_date2 = current_date1.setMinutes(current_date1.getMinutes() + 330);
            let slot_time = res[i].calender[0].slot_timestamp[j].date;
            if (slot_time >= current_date2) {
              // let res

              remianing_slots_calender.push(res[i].calender[0].slot_timestamp[j]);
            }

          }
          obj.calender.push({ "slot_timestamp": remianing_slots_calender });
        }
        remaining_slots.push(obj);
      }

      callback(null, remaining_slots);
    } else {
      callback(null, null);
    }
  });
}

function getRemainingSlots_employee(query, callback) {
  // console.log("query", query);
  employeeModel.getRemainingSlots_employee(query, (err, res1) => {
    if (err) {
      callback(err, null);
    } else if (res1.length > 0) {
      console.log("................", res1.length);
      console.log("................", typeof (res1.length));
      callback(null, res1);
    } else {
      callback(null, null);
    }
  })
}

function getRemainingSlots(query, callback) {
  console.log("query", query);
  employeeModel.getRemainingSlots(query, (err, res1) => {
    if (err) {
      callback(err, null);
    } else if (res1.length > 0) {
      console.log("................", res1.length);
      console.log("................", typeof (res1.length));
      callback(null, res1);
    } else {
      callback(null, null);
    }
  })
}
function getRemainingSlotsAdminCalendarAPI(query, callback) {
  console.log("query", query);
  employeeModel.getRemainingSlotsAdminCalendarAPI(query, (err, res1) => {
    if (err) {
      callback(err, null);
    } else if (res1.length > 0) {
      console.log("................", res1.length);
      console.log("................", typeof (res1.length));
      callback(null, res1);
    } else {
      callback(null, null);
    }
  })
}

module.exports = {
  findEmployeeDomain,
  employeeEmailOtpLogin,
  bookTimeSlots,
  getBookedSlotsById,
  updateBooking,
  UpdateVideoUrl,
  getBookedSlots,
  getProfile,
  updateUser,
  getRemainingSlots,
  getRemainingSlotsAdminCalendarAPI,
  getRemainingSlots_employee,
  getTimeSlots,
  getTimeSlotsById,
  getEmployeeById
}