const Users = require('../projects/models/users.model.js').UserModel;
const express = require('express');
const router = express.Router();
const misc = require('../../helpers/misc');
const resp = require('../../helpers/responseHelpers');
const UserCtrl = require('./user.controller');
// const AWS = require('../../helpers/aws-S3');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
// const UserModel = require('./user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const SECRET = process.env.SECRET;
const doctorController = require("../doctor/doctor.controller");
const appointmentController = require("../appointment/appointment.controller");
const eventController = require('../events/events.controller');
const adminController = require("../admin/admin.controller")
const emailTemplate = require('../../modules/projects/model_helpers/email_template');

const User = require('./user.model');
const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_SECRET_KEY });






router.post('/add-doctor-to-user', async (req, res) => {
    try {
        
        //req.body["userId"] = req.user[0].id; 
    //const Doctor = require('../doctor/doctor.model');
      const { userId, doctorId } = req.body;
      console.log(req.body);
      // Check if both user and doctor exist in database
      //const user = await User.findById(userId);
      //const doctor = await Doctor.findById(doctorId);
      if (!userId || !doctorId) {
        return res.status(404).json({ message: 'User or doctor not found' });
      }
  
      // Add doctor's ID to user's profile
      console.log("users:",userId);
      console.log("doctor:",doctorId);
      let userdoctor = [];
      userdoctor.push({
        "doctorId": userId.doctorId  
    })
      
      res.status(200).json({ message: 'Doctor added to user profile' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


router.get('/allusers', (req, res) => {
    adminController.getAllUsers((err, users) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error while getting users');
        } else if (users) {
            console.log(users);
            resp.successGetResponse(res, users, 'All users');
        } else {
            resp.noRecordsFound(res, 'Unable to get all users');
        }
    });
});

router.get('/getUserById', (req, res) => {
    let query = {
        '_id': req.query.userId
    }
    console.log('query', query)
    adminController.getUsersById(query, (err, user) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error while getting user');
        }
        if (user) {
            console.log(user);
            resp.successGetResponse(res, user, 'User details');
        } else {
            resp.noRecordsFound(res, 'Unable to get user');
        }
    })
});




const app = express();



// Define the API route for adding a journal to a user's collection

router.post('/users/:userId/journals', async (req, res) => {
  try {
    const { userId } = req.params;
    const { partnerId, journals } = req.body;

    
    // Find the user by ID
    const user = await findUserById(userId);

    if (!user)
    {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add the journals to the user's collection
    user.journals.push(...journals);
    
    // Save the user to the database
    await user.save();
    
    // Return the updated user object
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/profile', (req, res) => {
    console.log("====inside post profile======");
    console.log(req.body);
    misc.checkUser(req).then(
        (user) => {
            misc.checkProps(req, ["body"], "missing Parameters").then(
                (data) => {
                    UserCtrl.createProfile(user, req.body).then(
                        (data) => resp.successPostResponse(res, data),
                        (err) => resp.errorResponse(res, err)
                    )
                },
                (err) => {
                    resp.errorResponse(res, err);
                }
            )
        }
    )
});


router.put('/updateUser', (req, res) => 
{
    console.log("inside update user")
    if (req.user && req.body.updatedData) {
        const query = {};
        query['emailId'] = req.user[0].emailId;
        const dataToBeUpdated = req.body.updatedData
        delete dataToBeUpdated._id
        UserCtrl.updateUser(query, dataToBeUpdated, function (err, docs) {
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

router.put('/updatePassword', (req, res) => {
    console.log("inside update user")
    if (req.user) {
        console.log("req.user", req.user);
        const query = {};
        query['emailId'] = req.user[0].emailId;
        // const dataToBeUpdated = req.body.updatedData
        // delete dataToBeUpdated._id

        bcrypt.compare(req.body.current_password, req.user[0].password, (err, same) => {
            console.log('-----------------------------------');
            console.log(req.body.current_password, req.user[0].password, same);
            console.log('-----------------------------------');  
            if (err) {
                resp.errorResponse(res);
            } else if (same) {
                console.log("inside else if", same)
                UserCtrl.resetpsw(req.user[0].emailId, req.body.new_password, function (err, docs) {
                    if (err) {
                        resp.errorResponse(res);
                    } else if (docs) {
                        resp.successPostResponse(res, docs, 'Password changed successfully!');
                    } else {
                        resp.noRecordsFound(res, 'unable to reset password');
                    }
                });
            } else {
                resp.missingBody(res, 'Incorrect password');
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
        query["$or"] = [{status: "appointment confirmed"}, {status: "appointment cancelled"}];
        query['userId'] = req.user[0]._id;
        //query["status"] = "appointment confirmed";
        UserCtrl.getBookedSlots(query, function (err, docs) {
            if (err) {
                resp.errorResponse(res);
            } else if (docs.length>0) {
                console.log("docs", docs);
                let docs_final_arr = [];
                for(let i=0; i<docs.length; i++){
                    let present_date = new Date();
                    let present_time = present_date.getTime();

                    let slot_date = new Date(docs[i].bookedSlotsTime);
                    let slot_time = slot_date.getTime();

                    let time_obj = {
                        "present_time" : present_time,
                        "slot_time" : slot_time
                    };
                    let x = Object.assign(docs[i],time_obj);
                    docs_final_arr.push(x);
                    // docs[i]["present_time"] = present_time;
                    // docs[i]["slot_time"] = slot_time;
                    // Object.assign(docs[i],{
                    //     "present_time" : present_time,
                    //     "slot_time" : slot_time
                    // });
                }
                resp.successPostResponse(res, docs_final_arr , 'upcoming appointment');
            } else {
                resp.noRecordsFound(res, 'no appointment found');
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
        query["$or"] = [{status: "appointment confirmed"},{status: "appointment cancelled"}];
        query['userId'] = req.user[0]._id;
        //query["status"] = "appointment confirmed";
        UserCtrl.getBookedSlots(query, function (err, docs) {
            if (err) {
                resp.errorResponse(res);
            } else if (docs.length>0) {
                console.log("docs", docs);
                for(var i=0; i<docs.length; i++){
                    var present_time1 = new Date();
                    present_time1 = present_time1.setMinutes( present_time1.getMinutes() + 330 );
                    var present_time = new Date(present_time1);

                    let slot_date = docs[0].bookedSlotsTime; 
                    let slot_start_time = slot_date.setMinutes( slot_date.getMinutes() - 10 );
                    slot_start_time = new Date(slot_start_time);
                    let slot_reschedule_end_time = slot_date.setMinutes( slot_date.getMinutes() - 110 );
                    slot_reschedule_end_time = new Date(slot_reschedule_end_time);
                    let join_call_flag = new Boolean();
                    let reschedule_flag = new Boolean();
                    
                    if(docs[0].status === 'appointment confirmed'){
                        if(slot_start_time <= present_time){
                            join_call_flag = true; 
                        }else{
                            join_call_flag = false;
                        }

                        if(slot_reschedule_end_time > present_time){
                            if(docs[0].rescheduled === false){
                                reschedule_flag = true;
                            }else{
                                reschedule_flag = false;
                            }
                        }else{
                            reschedule_flag = false;
                        }
                    }else if(docs[0].status === 'appointment cancelled'){
                        join_call_flag = false;
                        reschedule_flag = true;
                    }

                    

                    var time_obj = {
                        "join_call_flag" : join_call_flag,
                        "reschedule_flag" : reschedule_flag
                    };
                }
                resp.successPostResponse(res, time_obj , 'Status Flags');
            } else {
                resp.noRecordsFound(res, 'no status flags found');
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
        query['userId'] = req.user[0]._id;
        query["booking_status"] = "paid";
        UserCtrl.getBookedSlots(query, function (err, docs) {
            // console.log('doc:::testing',docs);
            if (err) {
                resp.errorResponse(res);
            } else if (docs.length>0) {
                resp.successPostResponse(res, docs, 'past appointment');
            } else {
                resp.noRecordsFound(res, 'no past appointment found');
            }
        });
    } else {
        resp.missingBody(res, 'Missing parameters');
    }
})


router.put('/profile', (req, res) => {
    console.log("=====inside put profile=======")
    //console.log(req.body);
    console.log(req.body.profileDetails.category[0]);
    if (req.user && req.body.profileDetails) {
        //console.log("=========1=========");
        const query = {};
        query['emailId'] = req.user[0].emailId;
        query['id'] = req.user[0].id;
        //console.log(query);
        UserCtrl.updateUserData(query, req.body.profileDetails, function (err, docs) {
            // console.log("======docs=====");
            // console.log(docs);
            if (err) {
                //console.log("=======err=====");
                resp.errorResponse(res);
            } else if (docs) {
                //console.log("========docs=======");
                resp.successPostResponse(res, docs, 'User Data updated successfully');
            } else {
                //console.log("==========else=========");
                resp.noRecordsFound(res, 'Invalid Email Id');
            }
        });
    } else {
        resp.missingBody(res, 'Missing parameters');
    }
});

router.get('/profile', (req, res) => {
    console.log("inside get profile")
    misc.checkUser(req, res).then(
        (user) => {
            console.log("user", user)
            UserCtrl.getProfile(user).then(
                (data) => {
                    console.log(data)
                let user =data
                delete user['password']
                  console.log("dd")
                resp.successGetResponse(res, user)
                },
                (err) => resp.errorResponse(res, err)
            )
        }
    )
});

router.put('/resetpsw', function (req, res) {
    if (req.user) {
        console.log("req.user", req.user)
        if (req.body.data.password && req.query.emailId) {
            UserCtrl.resetpsw(req.query.emailId, req.body.data, function (err, docs) {
                if (err) {
                    resp.errorResponse(res);
                } else if (docs) {
                    resp.successPostResponse(res, docs, 'Password changed successfully, Please login with new Password');
                } else {
                    resp.noRecordsFound(res, 'Invalid Email Id');
                }
            });
        } else {
            resp.missingBody(res, 'Missing parameters');
        }
    } else {
        resp.unauthorized(res, "Unauthorized");
    }

});

router.put('/emailverification', function (req, res) {
    if (req.user) {
        const emailId = req.user[0].emailId;
        const emailIdVerified = req.user[0].emailIdVerified;
        UserCtrl.verifyEmail(emailId, emailIdVerified, function (err, docs) {
            if (err) {
                resp.errorResponse(res);
            } else if (docs) {
                resp.successPostResponse(res, 'Email Id successfully verified');
            } else {
                resp.noRecordsFound(res, 'No Email Id  Found');
            }
        })
    } else {
        resp.missingBody(res, 'Missing Body');
    }
})



router.get('/getMe/:token', function(req, res, next) {
    try {
        const user = jwt.verify(req.params.token, SECRET );
        UserModel.getProfileDetailsById({_id: user._id}).then((dbUser) => {
            if (dbUser) {
                res.status(200);
                res.json(dbUser);
            } else {
                res.json('Invalid Token');
            }
        }).catch((err) => {
            next(err);
        });
    } catch(err) {
        res.json(err);
    }
    // try {
    //     var token = jwt.verify(req.params.token, SECRET);
    //     console.log(token.data.user._id);
    //     UserModel.findUser(token.data.user._id, function (err, dbUser) {
    //         if (err) {
    //             next(err);
    //         } else {
    //             if (dbUser) {
    //                 res.status(200);
    //                 res.json(dbUser);
    //             } else {
    //                 res.json('Invalid Token');
    //             }
    //         }
    //     })
    // } catch(err) {
    //     res.json({success: false});
    // }
});

router.get('/logout', function(req, res) {
    if(req.headers && req.headers.authorization){
     let headers = req.get("authorization");
        headers = headers.split(" ");
        UserCtrl.logout(headers[1],(err,docs)=>{
            if(err){
                resp.errorResponse(res,err); 
            }
         if(docs){
                console.log("hhh")
            resp.successPostResponse(res,null, 'logout');
            }
          

        })
    }
    else{
        resp.missingBody(res, "Missing/Invalid Body Parameters") 
    }
});

router.put('/callJoin', (req, res) => {
    console.log("inside updateBooking query", req.query);
    console.log("inside updateBooking body", req.body);
    const query = {};
        query['_id'] = req.query.bookingId;
        const dataToBeUpdated = req.body.updatedData
    if(req.user && req.body.updatedData) {
        appointmentController.updateBooking(query, dataToBeUpdated, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While updating login time');
            } else if (docs) {
                console.log("docs", docs)
                resp.successGetResponse(res,  'call login time added');
                
            } else {
                resp.noRecordsFound(res, 'Unable to add logintime');
            }
        })
    }
})


router.get('/getEventList', (req, res) => {
    if(req.user){
        const query = {};
        query['userId'] = req.user[0]._id;
        eventController.eventGetList(query, (err, docs) => {
            if(err){
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While fetching registered event');
            }else if(docs.length > 0){
                resp.successGetResponse(res, docs, 'event registered successfully');
            }else if(docs.length === 0){
                console.log("else")
                resp.noRecordsFound(res, 'No Records Found');
            } else {
                console.log("else")
                resp.noRecordsFound(res, 'Unable to fetch register event');
            }
        })
    }
})


router.post('/userDoctor', (req, res) => {
    if(req.query){
        console.log(req.user);
        req.body["userId"] = req.user[0].id;
        req.body["doctorId"] = req.query;
        appointmentController.createInterestedWith(req.body, (err, docs) => {
            if(err){
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While creating InterestedWith');
            }else if(docs){
                resp.successGetResponse(res, docs, 'interestedWith created successfully');
            } else {
                console.log("else")
                resp.noRecordsFound(res, 'Unable to create InterestedWith');
            }
        })
    }
})

router.post('/createEvent', (req, res) => {
    console.log("inside createEvents");
    if(req.body && req.user){
        console.log(req.body);
        req.body["userId"] = req.user[0].id;
        req.body["event_name"] = req.body.event_name;
        eventController.eventCreate(req.body, (err, docs) => {
            if(err){
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While registering event');
            }else if(docs){
                resp.successGetResponse(res, docs, 'event registered successfully');
                // emailTemplate.EventRegistration(docs, (err, res) => {
                //     if (err) {
                //       console.log(err)
                //     } else if(res) {
                //       console.log(res)
                //     } else {
                //       console.log("appointment missed2")
                //     }
                //   })
            } else {
                console.log("else")
                resp.noRecordsFound(res, 'Unable to register event');
            }
        })
    }
})

router.post('/createBooking', (req, res) => {
    console.log("inside bookappointments", req.body);
    if(req.body && req.user) {
        var receiptId = Math.floor(1000 + Math.random()*9000);
        receiptId = 'order_rcptid_'+ receiptId;
        console.log(receiptId);

        var options = {
            amount: (req.body.payment.fee)*100,  // amount in the smallest currency unit
            currency: req.body.payment.currency,
            receipt: receiptId
        };
        instance.orders.create(options, function(err, order) {
            if(err) {
                console.log("err", err)
                resp.errorResponse(res, err, 501, 'Error While creating orderId');
            } else if(order) {
                console.log("order", order);
                req.body["userId"] = req.user[0].id;
                req.body["order"] = order;
                req.body["previous_bookedSlotsTime"] = req.body.bookedSlotsTime;
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


router.get('/applyCoupon', (req, res) => {
    if(req.user && req.query) {
        let current_date = new Date();
        console.log("current_date", current_date)
        let new_date = current_date.setMinutes( current_date.getMinutes() + 330 );
        let compare_date = new Date(new_date)
        console.log("compare_date", compare_date)
        let coupon_data = {
            $or : [{eligibility: 'ALL'}, {userId: req.user[0]._id}],
            coupon_name: req.query.coupon_name,
            start_date: { '$lte': compare_date },
            end_date: { '$gte': compare_date },
            active: true
        }
        console.log("coupon_data", coupon_data)
        adminController.getAllCoupon(coupon_data, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While getting coupon');
            } else if (docs.length>0) {
                console.log("docs", docs)
                if(docs[0].coupon_limit && docs[0].coupon_limit > 0) {
                    if(docs[0].user_limit){
                        let check_user_limit = {
                            userId: req.user[0]._id,
                            coupon_name: req.query.coupon_name
                        }
                        console.log("check_user_limit", check_user_limit)
                        appointmentController.getBookingCount(check_user_limit, (err, count) => {
                            console.log("count value", count)
                            if(err) {
                                resp.errorResponse(res, err, 501, 'Error While getting booking count for the user');
                            } else if(count < docs[0].user_limit) {
                                console.log("inside this <")
                                resp.successGetResponse(res, docs, 'coupons details');
                            } else if(count === docs[0].user_limit) {
                                console.log("inside this ===")
                                resp.noRecordsFound(res, `you have already used this coupon ${count} times`);
                            } else {
                                console.log("inside this else")
                                resp.noRecordsFound(res, 'unable to get count');
                            }
                        })
                    } else {
                        resp.successGetResponse(res, docs, 'coupons details');
                    }
                } else {
                    resp.successGetResponse(res, docs, 'coupons details');
                }
            } else {
                resp.noRecordsFound(res, 'Invalid coupon');
            }
        })
    }
});

module.exports = router;
