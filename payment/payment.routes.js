var request = require('request');
const express = require("express");
const appointmentController = require("../appointment/appointment.controller");
const resp = require("../../helpers/responseHelpers");
const router = express.Router();
const EmailTemplate = require('../projects/model_helpers/email_template')
const adminController = require('../admin/admin.controller')
const doctorModel = require('../doctor/doctor.model')

router.post('/capture', (req, res) =>
{
    console.log('capture', req.body.data);
    var bookingId = req.query.bookingId;
    console.log("bookingId", bookingId);
    var data = req.body.data;
    console.log("data", data);
    if(bookingId) {
        appointmentController.getBookedSlotsById(bookingId, (err, response) => {
            if(err) {
                console.log("err", err);
                resp.errorResponse(res, err, 501, 'Error While getting bookedslots before payment');
            } else if(response.length>0) {
                console.log("res", response);
                var curr_amount = response[0].order.amount;
                var cur_currency = response[0].order.currency;
                var user_firstName = response[0].userId.first_name;
                var user_fullName = response[0].userId.first_name + ' ' + response[0].userId.last_name;
                var user_emailId = response[0].userId.emailId;
                var user_role = response[0].userId.role;
                var doctor_fullname = response[0].doctorId.name;
                var doctor_emailId = response[0].doctorId.emailId;
                var order_id = response[0].order.id;
                var doctor_role = "Doctor";
                if(response[0].coupon_name) {
                    var coupon_name = response[0].coupon_name;
                }

                
                // razor pay
                var data = req.body.data;
                console.log("data", data);
                key_id = process.env.RAZORPAY_KEY_ID;
                secret_key = process.env.RAZORPAY_SECRET_KEY;
                request({
                            method: "POST",
                            url: `https://`+key_id+`:`+secret_key+`@api.razorpay.com/v1/payments/`+ data.razorpay_payment_id + `/capture`,
                            form: {
                                amount: curr_amount,
                                currency: cur_currency
                            }
                        },  (error, response, body) => {
                    console.log('Status:', response.statusCode);
                    console.log('Headers:', JSON.stringify(response.headers));
                    console.log('Response:', body);
                    let bodyResponse = JSON.parse(body);
                    console.log("bodyResponse", bodyResponse);
                    if(bodyResponse.status == "captured") {
                        console.log("sucessFully debited");
                        console.log("inside captured payment", bodyResponse)
                        //payment success email
                        EmailTemplate.paymentSuccessEmail({user_firstName, user_emailId, order_id}, (err, res) => {
                            if (err) {
                              console.log("err", err)
                            } else if (res) {
                              console.log("res", res)
                            } else {
                              console.log("else")
                            }
                        });
                        // update coupon count
                        if(coupon_name) {
                            let query = {
                                coupon_name: coupon_name
                            }
                            adminController.updateCoupon(query, { $inc: {coupon_limit: -1} }, (err, docs) => {
                                if (err) {
                                    console.log(err)
                                    //resp.errorResponse(res, err, 501, 'Error While getting coupon');
                                } else if (docs) {
                                    console.log("docs", docs)
                                    //resp.successGetResponse(res, docs, 'coupons list');
                                } else {
                                    // resp.noRecordsFound(res, 'Unable to get coupon');
                                }
                            })
                        }
                        
                        //call superpro api
                        request({
                            method: "POST",
                            url: "https://roomsvc-dot-sprpro-282209.el.r.appspot.com/videocallstart",
                            body: {
                                "usersAdd": [
                                    { "name": user_fullName, "email": user_emailId, "role" : user_role },
                                    { "name": doctor_fullname, "email": doctor_emailId, "role" : doctor_role },
                                ],
                                config : { enableRecording : 0, enableChat : 1, enableScreenShare : 0 }
                             },
                             json: true,
                             headers: {
                                 "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0cnVldGVjaGxhYnMiLCJidXNpbmVzc0lkIjoiZmZRd0RFbjdNRHpjek9kRzFHZEUiLCJtb2RlIjoicHJvZCIsImFjY2Vzc0xldmVsIjoiMCIsInZpZFN1YkRvbWFpbiI6Imh0dHBzOi8vbWVldC5yeXQubGlmZSIsImFkbWluIjp0cnVlLCJpYXQiOjE2MjAyMDg2MDF9.aVh3VZVmEXItHR89amz5HFZmQyMzRNcsrQCNeER3DL5nX2qR4KBlkU5FQPZfJ5Q2d7Qyn3Slzkgpx1ho5f9oUhQDa3AemAhKZbmKIGCy3FfTKlA32VwN34iGk-B4CWK6ZXJ0sg0NgXVgRtKq2iF6N5rtZVzzs93D344Pj2AuiRY",
                                 "Accept": "application/json"
                             }
                             
                        },  (error, response, body) => {
                            console.log("superpro error", error);
                            console.log('superpro body:', body);
                            if(error) {
                                console.log("superpro error");
                                resp.unsuccessGetResponse(res, error, 'unable to create superpro videocall');
                            } else if(body) {
                                console.log("superpro success");
                                const query = {};
                                query['_id'] = req.query.bookingId;
                                const dataToBeUpdated =  {
                                    "payment_transaction_id": data.razorpay_payment_id,
                                    "booking_status": "paid",
                                    "video_call_url": body.videoCallUrl,
                                    "video_call_id": body.videoCallId,
                                    "status": "appointment confirmed"
                                }
                                if(coupon_name) {
                                    dataToBeUpdated["coupon_name"] = coupon_name;
                                }
                                appointmentController.updateBooking(query, dataToBeUpdated, (err, docs) => {
                                    if (err) {
                                        console.log("error while booking slots");
                                        console.log(err)
                                        resp.errorResponse(res, err, 501, 'Error While booking timeslots after payment for superpro generation');
                                    } else if (docs) {
                                        console.log("docs", docs)
                                        console.log("booking success");
                                        EmailTemplate.bookingSuccessEmail(docs, (err, res) => {
                                            if (err) {
                                              console.log("err", err)
                                            } else if (res) {
                                              console.log("res", res)
                                            } else {
                                              console.log("else")
                                            }
                                        });
                                        resp.successGetResponse(res, docs, 'booking successfull');
                                    } else {
                                        console.log("unable to fetch doctors");
                                        resp.noRecordsFound(res, 'Unable to book doctors timeslots');
                                    }
                                })
                            } else {
                                resp.noRecordsFound(res, 'Unable to get any response from superpro');
                            }
                        })
                    } else if(bodyResponse.error.description){
                        console.log("inside error description", bodyResponse.error.description);
                        console.log("payment unsuccessful");
                        //payment success email
                        EmailTemplate.paymentUnsuccessEmail({user_firstName, user_emailId}, (err, res) => {
                            if (err) {
                            //   callback(err, null);
                            console.log("err", err)
                            } else if (res) {
                            //   callback(null, res);
                            console.log("res", res)
                            } else {
                            //   callback(null, null);
                            console.log("else")
                            }
                        });

                        const query = {};
                        query['_id'] = req.query.bookingId;
                        const dataToBeUpdated =  {
                            "payment_transaction_id": data.razorpay_payment_id,
                            "booking_status": "failed",
                        }
                        if(coupon_name) {
                            dataToBeUpdated["coupon_name"] = coupon_name;
                        }
                        appointmentController.updateBooking(query, dataToBeUpdated, (err, docs) => {
                            if (err) {
                                console.log(err)
                                resp.errorResponse(res, err, 501, 'Error While booking timeslots for booking unsucessful');
                            } else if (docs) {
                                console.log("docs", docs)
                                EmailTemplate.bookingUnsuccessEmail({ user_emailId, user_firstName }, (err, res) => {
                                    if (err) {
                                    //   callback(err, null);
                                    console.log("err", err)
                                    } else if (res) {
                                    //   callback(null, res);
                                    console.log("res", res)
                                    } else {
                                    //   callback(null, null);
                                    console.log("else")
                                    }
                                  });
                                if(bodyResponse.error.description) {
                                    resp.unsuccessGetResponse(res, docs, bodyResponse.error.description);
                                } else {
                                    resp.unsuccessGetResponse(res, docs, 'booking failed');
                                }
                                
                            } else {
                                resp.noRecordsFound(res, 'Unable to book timeslots');
                            }
                        })
                    } else {
                        console.log("razorpay issue");
                        console.log("inside else no error description")
                        resp.noRecordsFound(res, 'Unable to get any response from razorpay');
                    }
                });
            } else {
                console.log("else");
                resp.noRecordsFound(res, 'Unable to get bookedslot');
            }
        })
    }
});

router.post('/payout', (err, res) => {
    console.log("Hello");
    doctorModel.getAllDcotors((err, docs) => {
      if(err) {
        console.log(err)
      } else if(docs) {
        // console.log("doctorlist", docs)
        for (const item of docs) {
            if(item.name === "Prateek"){
                console.log("booking_details_pratheek",item.booking_details);
            }
            // console.log("booking_details",item.booking_details);
            // console.log("account number", item.account_number);
            if(item.booking_details.length > 0 && item.account_number) {
                let payout_ammount = 0;
                // console.log("booking_details.length",item.booking_details.length);
                for (const booking of item.booking_details) {
                    if(booking.status === "appointment closed") {
                        // console.log("booking_status",booking.status);
                        // console.log("order_amount",booking.order.amount);
                        payout_ammount += booking.order.amount;
                    }
                }
                console.log(payout_ammount)
                if(payout_ammount > 0) {
                    request({
                        method: "POST",
                        url: `https://api.razorpay.com/v1/payouts`,
                        body: {
                            "account_number":"4564565751476779",
                            "amount": payout_ammount,
                            "currency":"INR",
                            "mode":"NEFT",
                            "purpose":"refund",
                            "fund_account":{
                                "account_type":"bank_account",
                                "bank_account":{
                                    "name": item.name,
                                    "ifsc": item.ifsc_code,
                                    "account_number": item.account_number
                                },
                                "contact":{
                                    "name": item.name,
                                    "email": item.emailId,
                                    "contact": item.mobileNo,
                                    "type":"employee",
                                    "reference_id":"Acme Contact ID 12345",
                                    "notes":{
                                        "notes_key_1":"Tea, Earl Grey, Hot",
                                        "notes_key_2":"Tea, Earl Grey… decaf."
                                    }
                                }
                            },
                            "queue_if_low_balance":true,
                            "reference_id":"Acme Transaction ID 12345",
                            "narration":"Acme Corp Fund Transfer",
                            "notes":{
                                "notes_key_1":"Beam me up Scotty",
                                "notes_key_2":"Engage"
                            }
                        },
                        json: true,
                        Authorization: {
                            "Username": "rzp_live_odscnZxNRoUPIm",
                            "Password": "lF0te27vyHb12aDKJMxu5hOy"
                        }
                    },  (error, response, body) => {
                        console.log('Status:', response.statusCode);
                        console.log('Headers:', JSON.stringify(response.headers));
                        console.log('body:', body);
                        let bodyResponse = JSON.parse(body);
                        console.log("bodyResponse", bodyResponse);
                    });
                }
            }
        }
      } else {
        console.log("null")
      }     
    })
})


module.exports = router;


