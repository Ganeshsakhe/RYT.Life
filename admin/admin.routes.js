const express = require('express');
const router = express.Router();
const resp = require("../../helpers/responseHelpers");
const adminController = require('./admin.controller');
const doctorModel = require("../doctor/doctor.model");
const Razorpay = require('razorpay');
const appointmentController = require("../appointment/appointment.controller");
const employeeCtrl = require('../company_employee/employee.controller');
const moment = require('moment');
var request = require('request');
const axios = require("axios");
// const express = require('express');
const app = express();
const bodyParser = require('body-parser');


app.use(bodyParser.json());


//doctors

router.get('/alldoctors', (req, res) => {
    adminController.getAllDoctors((err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While getting doctor');
        }else if (docs) {
            console.log(docs)
            resp.successGetResponse(res, docs, 'All doctors');
        }
        else {
            resp.noRecordsFound(res, 'Unabl) to get all doctors');
        }
    })
});

router.get('/downloadAllDoctors', (req, res) => {
    adminController.downloadAllDoctors((err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While getting doctor');
        }else if (docs) {
            console.log(docs)
            resp.successGetResponse(res, docs, 'All doctors');
        }
        else {
            resp.noRecordsFound(res, 'Unable to get all doctors');
        }
    })
})

router.get('/getDoctorsById', (req, res) => {
    let query = {
        '_id': req.query.doctorId
    }
    console.log('query', query)
    adminController.getDoctorsById(query, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While getting doctor');
        }
        if (docs) {
            console.log(docs)
            resp.successGetResponse(res, docs, 'Doctors details');
        }
        else {
            resp.noRecordsFound(res, 'Unable to get doctors');
        }
    })
})

router.put('/updateDoctorsProfile', (req, res) => {
    let query = {
        '_id': req.query.doctorId
    }
    const dataToBeUpdated = req.body.updatedData;

    console.log("dataToBeUpdated", dataToBeUpdated)

    adminController.updateDoctorsProfile(query, dataToBeUpdated, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While updating doctor');
        }
        if (docs) {
            console.log(docs)
            resp.successGetResponse(res, docs, 'Doctors details');
        }
        else {
            resp.noRecordsFound(res, 'Unable to update doctors');
        }
    })
})

router.put('/hideDoctorsProfile', (req, res) => {
    let query = {
        '_id': req.query.doctorId
    }

    adminController.updateDoctorsProfile(query, { hidden: true }, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While updating doctor');
        }
        if (docs) {
            console.log(docs)
            resp.successGetResponse(res, docs, 'Doctors details');
        }
        else {
            resp.noRecordsFound(res, 'Unable to update doctors');
        }
    })
})

router.put('/unhideDoctorsProfile', (req, res) => {
    let query = {
        '_id': req.query.doctorId
    }

    adminController.updateDoctorsProfile(query, { hidden: false }, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While updating doctor');
        }
        if (docs) {
            console.log(docs)
            resp.successGetResponse(res, docs, 'Doctors details');
        }
        else {
            resp.noRecordsFound(res, 'Unable to update doctors');
        }
    })
})
router.get('/getDoctorsAppointment', (req, res) => {
    let user_query = {
        'doctorId': req.query.doctorId,
        'booking_status': 'paid'
    }

    let employee_query = {
        'doctorId': req.query.doctorId,
    }

    adminController.getDoctorsAppointment(user_query, function (err, docs) {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While getting doctor');
        } else if (docs.length > 0) {
            console.log("docs", docs)
            // if there is user appointmentlist
            var user_appointmentresult = docs.map(function (el) {
                var o = Object.assign({}, el);
                o._doc.role = 'user';
                return o._doc;
            })

            adminController.getDoctorsAppointment_employee(employee_query, function (err, employee_docs) {
                if (err) {
                    resp.errorResponse(res, err, 501, 'Error While getting doctor');
                } else if (employee_docs.length > 0) {
                    // if there is both user appointmentlist and employee appointmentlist
                    var employee_appointmentresult = employee_docs.map(function (el) {
                        var o = Object.assign({}, el);
                        o._doc.role = 'employee';
                        return o._doc;
                    })

                    c = user_appointmentresult.concat(employee_appointmentresult);
                    // console.log("BEFORE SORT", c);
                    c.sort((a, b) => new Date(a.bookedSlotsTime) > new Date(b.bookedSlotsTime) ? -1 : 1);
                    // console.log("AFTER SORT", c);
                    resp.successGetResponse(res, c, 'Doctors details');
                } else {
                    // if there is user appointmentlist and no employee appointmentlist
                    user_appointmentresult.sort((a, b) => new Date(a.bookedSlotsTime) > new Date(b.bookedSlotsTime) ? -1 : 1);
                    resp.successGetResponse(res, user_appointmentresult, 'Doctors details');
                }
            });
        } else {
            // if there is no user apoointmentlist and employee appointmentlist
            adminController.getDoctorsAppointment_employee(employee_query, function (err, employee_docs) {
                if (err) {
                    resp.errorResponse(res, err, 501, 'Error While getting doctor');
                } else if (employee_docs.length > 0) {
                    employee_docs.sort((a, b) => new Date(a.bookedSlotsTime) > new Date(b.bookedSlotsTime) ? -1 : 1);
                    var employee_appointmentresult = employee_docs.map(function (el) {
                        var o = Object.assign({}, el);
                        o._doc.role = 'employee';
                        return o._doc;
                    })
                    resp.successGetResponse(res, employee_appointmentresult, 'Doctors details');
                } else {
                    // if there is no user apointmentlist and no employee appointmentlist
                    resp.noRecordsFound(res, 'no appointment found');
                }
            });
        }
    });
})

router.get('/getDoctorsByName', (req, res) => {
    let query = {
        'name': req.query.name
    }
    console.log('query', query)
    adminController.getDoctorsById(query, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While getting doctor');
        }
        if (docs) {
            console.log(docs)
            resp.successGetResponse(res, docs, 'Doctors details');
        }
        else {
            resp.noRecordsFound(res, 'Unable to get doctors');
        }
    })
})

router.get('/getAppointmetByDoctorsName', (req, res) => {
    if (req.query) {
        let query = {
            'name': req.query.name
        }
        console.log('query', query)
        adminController.getDoctorsById(query, (err, docs) => {
            if (err) {
                resp.errorResponse(res, err, 501, 'Error While getting doctor');
            }
            else if (docs) {
                console.log(docs)
                let filterQuery = {}
                if (req.query.status === 'completed') {
                    filterQuery['doctorId'] = docs[0]._id;
                    filterQuery['status'] = 'appointment closed'
                    filterQuery['booking_status'] = 'paid'
                } else if (req.query.status === 'upcoming') {
                    filterQuery['doctorId'] = docs[0]._id;
                    filterQuery['status'] = 'appointment confirmed'
                    filterQuery['booking_status'] = 'paid'
                } else if (req.query.status === 'cancelled') {
                    filterQuery['doctorId'] = docs[0]._id;
                    filterQuery['status'] = 'appointment cancelled'
                    filterQuery['booking_status'] = 'paid'
                } else if (req.query.status === 'rescheduled') {
                    filterQuery['doctorId'] = docs[0]._id;
                    filterQuery['rescheduled'] = true;
                    filterQuery['booking_status'] = 'paid'
                } else if (req.query.status === 'all') {
                    filterQuery['doctorId'] = docs[0]._id;
                    filterQuery['booking_status'] = 'paid'
                } else {
                    filterQuery['doctorId'] = docs[0]._id;
                    filterQuery['booking_status'] = 'paid'
                }
                console.log("filterQuery", filterQuery)
                adminController.getBookingById(filterQuery, (err, docs) => {
                    if (err) {
                        resp.errorResponse(res, err, 501, 'Error While getting booking details');
                    }
                    if (docs) {
                        console.log(docs)
                        resp.successGetResponse(res, docs, 'booking details');
                    }
                    else {
                        resp.noRecordsFound(res, 'Unable to get all booking details');
                    }
                })
                //resp.successGetResponse(res, docs, 'Doctors details');
            }
            else {
                resp.noRecordsFound(res, 'Unable to get doctors');
            }
        })
    }
})

router.get('/getEmployeeAppointmentByDoctorsName', (req, res) => {
    if (req.query) {
        let query = {
            'name': req.query.name
        }
        console.log('query', query)
        adminController.getDoctorsById(query, (err, docs) => {
            if (err) {
                resp.errorResponse(res, err, 501, 'Error While getting doctor');
            }
            else if (docs) {
                console.log(docs)
                let filterQuery = {}
                if (req.query.status === 'completed') {
                    filterQuery['doctorId'] = docs[0]._id;
                    filterQuery['status'] = 'appointment closed'
                    // filterQuery['booking_status'] = 'paid'
                } else if (req.query.status === 'upcoming') {
                    filterQuery['doctorId'] = docs[0]._id;
                    filterQuery['status'] = 'appointment confirmed'
                    // filterQuery['booking_status'] = 'paid'
                } else if (req.query.status === 'cancelled') {
                    filterQuery['doctorId'] = docs[0]._id;
                    filterQuery['status'] = 'appointment cancelled'
                    // filterQuery['booking_status'] = 'paid'
                } else if (req.query.status === 'rescheduled') {
                    filterQuery['doctorId'] = docs[0]._id;
                    filterQuery['rescheduled'] = true;
                    // filterQuery['booking_status'] = 'paid'
                } else if (req.query.status === 'all') {
                    filterQuery['doctorId'] = docs[0]._id;
                    // filterQuery['booking_status'] = 'paid'
                } else {
                    filterQuery['doctorId'] = docs[0]._id;
                    // filterQuery['booking_status'] = 'paid'
                }
                console.log("filterQuery", filterQuery)
                adminController.getEmployeeBookingById(filterQuery, (err, docs) => {
                    if (err) {
                        resp.errorResponse(res, err, 501, 'Error While getting booking details');
                    }
                    if (docs) {
                        console.log(docs)
                        resp.successGetResponse(res, docs, 'booking details');
                    }
                    else {
                        resp.noRecordsFound(res, 'Unable to get all booking details');
                    }
                })
                //resp.successGetResponse(res, docs, 'Doctors details');
            }
            else {
                resp.noRecordsFound(res, 'Unable to get Slots');
            }
        })
    }
})



//users

router.get('/allusers', (req, res) => {
    adminController.getAllUsers((err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While getting user');
        }
        if (docs) {
            console.log(docs)
            resp.successGetResponse(res, docs, 'All users');
        }
        else {
            resp.noRecordsFound(res, 'Unable to get all users');
        }
    })
})

router.get('/getUsersById', (req, res) => {
    let query = {
        '_id': req.query.userId
    }
    console.log('query', query)
    adminController.getUsersById(query, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While getting user');
        }
        if (docs) {
            console.log(docs)
            resp.successGetResponse(res, docs, 'Users details');
        }
        else {
            resp.noRecordsFound(res, 'Unable to get Users');
        }
    })
})

// An API to add doctors id in the user profile.
// router.post('/add_doctor_id', (req, res) =>
// {
//     const { user_id, doctor_id } = req.body;
//     console.log('Received request with user_id:', user_id, 'and doctor_id:', doctor_id);
 
//     if (!user_id || !doctor_id) {
        // console.log('Missing user_id or doctor_id in request body');
//       return res.status(400).json({ message: 'Both user_id and doctor_id are required.' });
//     }

//     // Get the users collection
//     const users = db.collection('users');

//     // Find the user by user_id
//     users.findOne({ user_id }, (err, user) => {
//       if (err) {
//         console.error(err);
//         console.log('Server error while finding user with user_id:', user_id);
//         return res.status(500).json({ message: 'Server error' });
//       }

//       if (!user) {
//         console.log('User with user_id:', user_id, 'not found');
//         return res.status(404).json({ message: `User with ID ${user_id} does not exist.` });
//       }
      

// // Update the user's doctor_id field
// users.updateOne({ user_id }, { $set: { doctor_id } }, (err, result) => {
//     if (err) {
//       console.error(err);
//       console.log('Server error while updating user with user_id:', user_id, 'and doctor_id:', doctor_id);
//       return res.status(500).json({ message: 'Server error' });
//     }
  
//     if (result.modifiedCount === 0) {
//       console.log('No user with user_id:', user_id, 'was updated');
//       return res.status(404).json({ message: `User with ID ${user_id} does not exist.` });
//     }
  
//     console.log('Successfully updated user with user_id:', user_id, 'and doctor_id:', doctor_id);
//     return res.status(200).json({ message: `Doctor ID ${doctor_id} has been added to user with ID ${user_id}.` });
//   });
//     });
//   });




// code for adding doctors id to user profile


// router.post('/add_doctor_id', (req, res) => {
//     const { user_id, doctor_id } = req.body;
//     console.log('Received request with user_id:', user_id, 'and doctor_id:', doctor_id);
  
//     if (!user_id || !doctor_id) {
//       console.log('Missing user_id or doctor_id in request body');
//       return res.status(400).json({ message: 'Both user_id and doctor_id are required.' });
//     }
  
//     // Get the users collection
//     console.log("db");
//     const users = db.collection('users');
//     console.log(users);
//     // Find the user by user_id
//     users.findOne({ _id:user_id }, (err, user) => {
//         console.log(err);
//         console.log(users);
//       if (err) {
//         console.error(err);
//         console.log('Server error while finding user with user_id:', user_id);
//         return res.status(500).json({ message: 'Server error' });
//       }
  
//       if (!user) {
//         console.log('User with user_id:', user_id, 'not found');
//         return res.status(404).json({ message: `User with ID ${user_id} does not exist.` });
//       }
  
//       // Update the user's doctor_id field
//       users.updateOne({ user_id }, { $set: { doctor_id } }, (err, result) => {
//         if (err) {
//           console.error(err);
//           console.log('Server error while updating user with user_id:', user_id, 'and doctor_id:', doctor_id);
//           return res.status(500).json({ message: 'Server error' });
//         }
  
//         if (result.modifiedCount === 0) {
//           console.log('No user with user_id:', user_id, 'was updated');
//           return res.status(404).json({ message: `User with ID ${user_id} does not exist.` });
//         }
  
//         console.log('Successfully updated user with user_id:', user_id, 'and doctor_id:', doctor_id);
//         return res.status(200).json({ message: `Doctor ID ${doctor_id} has been added to user with ID ${user_id}.` });
//       });
//     });
//   });


// router.post('/addDoctorId', (req, res) =>
// {
//     console.log('inside add doctor id')
    
//     if (req.body)
//     {
//     adminController.addDoctorId(req.body, (err, docs) =>
//     {
//     if (err) 
//     {
//     console.log(err)
//     resp.errorResponse(res, err, 501, 'Error while adding doctor id');
//     } 
//     else if (docs) 
//     {
//     console.log("docs", docs)
//     resp.successGetResponse(res, docs, 'Doctor ID added successfully');
//     } 
//     else 
//     {
//     resp.noRecordsFound(res, 'Unable to add doctor ID');
//     }
//     }) 
//     }     
// })



// router.post('/add-doctor-to-user', async (req, res) => {
//     try {
//         const User = require('../user/user.model');
//     const Doctor = require('../doctor/doctor.model');
//       const { userId, doctorId } = req.body;
  
//       // Check if both user and doctor exist in database
//       const user = await User.findById(userId);
//       const doctor = await Doctor.findById(doctorId);
//       if (!user || !doctor) {
//         return res.status(404).json({ message: 'User or doctor not found' });
//       }
  
//       // Add doctor's ID to user's profile
//       user.doctors.push(doctorId);
//       await user.save();
  
//       res.status(200).json({ message: 'Doctor added to user profile' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });











    
    router.put('/updateUsersProfile', (req, res) => {
    let query = {
        '_id': req.query.userId
    }
    const dataToBeUpdated = req.body.updatedData;

    console.log("dataToBeUpdated", dataToBeUpdated)

    adminController.updateUsersProfile(query, dataToBeUpdated, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While updating user');
        }
        if (docs) {
            console.log(docs)
            resp.successGetResponse(res, docs, 'User details');
        }
        else {
            resp.noRecordsFound(res, 'Unable to update user');
        }
    })
})

router.get('/getUsersAppointmet', (req, res) => {
    let query = {
        'userId': req.query.userId,
        'booking_status': 'paid'
    }
    console.log('query', query)
    adminController.getUsersAppointmet(query, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While getting user');
        }
        if (docs) {
            console.log(docs)
            resp.successGetResponse(res, docs, 'Users details');
        }
        else {
            resp.noRecordsFound(res, 'Unable to get Users');
        }
    })
})

router.get('/getUsersByName', (req, res) => {
    let query = {
        'first_name': req.query.first_name,
        'last_name': req.query.last_name
    }
    console.log('query', query)
    adminController.getUsersById(query, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While getting user');
        }
        if (docs) {
            console.log(docs)
            resp.successGetResponse(res, docs, 'Users details');
        }
        else {
            resp.noRecordsFound(res, 'Unable to get Users');
        }
    })
})

router.get('/getAppointmentByUsersName', (req, res) => {
    if (req.query) {
        let query = {
            'first_name': req.query.first_name,
            'last_name': req.query.last_name
        }
        console.log('query', query)
        adminController.getUsersById(query, (err, docs) => {
            if (err) {
                resp.errorResponse(res, err, 501, 'Error While getting user');
            }
            else if (docs) {
                console.log(docs)
                let filterQuery = {}
                if (req.query.status === 'completed') {
                    filterQuery['userId'] = docs[0]._id;
                    filterQuery['status'] = 'appointment closed'
                    filterQuery['booking_status'] = 'paid'
                } else if (req.query.status === 'upcoming') {
                    filterQuery['userId'] = docs[0]._id;
                    filterQuery['status'] = 'appointment confirmed'
                    filterQuery['booking_status'] = 'paid'
                } else if (req.query.status === 'cancelled') {
                    filterQuery['userId'] = docs[0]._id;
                    filterQuery['status'] = 'appointment cancelled'
                    filterQuery['booking_status'] = 'paid'
                } else if (req.query.status === 'rescheduled') {
                    filterQuery['userId'] = docs[0]._id;
                    filterQuery['rescheduled'] = true;
                    filterQuery['booking_status'] = 'paid'
                } else if (req.query.status === 'all') {
                    filterQuery['userId'] = docs[0]._id;
                    filterQuery['booking_status'] = 'paid'
                } else {
                    filterQuery['userId'] = docs[0]._id;
                    filterQuery['booking_status'] = 'paid'
                }
                console.log("filterQuery", filterQuery)
                adminController.getBookingById(filterQuery, (err, docs) => {
                    if (err) {
                        resp.errorResponse(res, err, 501, 'Error While getting booking details');
                    }
                    if (docs) {
                        console.log(docs)
                        resp.successGetResponse(res, docs, 'booking details');
                    }
                    else {
                        resp.noRecordsFound(res, 'Unable to get all booking details');
                    }
                })
                //resp.successGetResponse(res, docs, 'Doctors details');
            }
            else {
                resp.noRecordsFound(res, 'Unable to get Users');
            }
        })
    }
})

router.get('/getAppointmentByEmployeeName', (req, res) => {
    if (req.query) {
        let query = {
            'first_name': req.query.first_name,
            'last_name': req.query.last_name
        }
        console.log('query', query)
        adminController.getEmployeeById(query, (err, docs) => {
            if (err) {
                resp.errorResponse(res, err, 501, 'Error While getting user');
            }
            else if (docs) {
                console.log("employeedocs", docs)
                let filterQuery = {}
                if (req.query.status === 'completed') {
                    filterQuery['employeeId'] = docs[0]._id;
                    filterQuery['status'] = 'appointment closed'
                    // filterQuery['booking_status'] = 'paid'
                } else if (req.query.status === 'upcoming') {
                    filterQuery['employeeId'] = docs[0]._id;
                    filterQuery['status'] = 'appointment confirmed'
                    // filterQuery['booking_status'] = 'paid'
                } else if (req.query.status === 'cancelled') {
                    filterQuery['employeeId'] = docs[0]._id;
                    filterQuery['status'] = 'appointment cancelled'
                    // filterQuery['booking_status'] = 'paid'
                } else if (req.query.status === 'rescheduled') {
                    filterQuery['employeeId'] = docs[0]._id;
                    filterQuery['rescheduled'] = true;
                    // filterQuery['booking_status'] = 'paid'
                } else if (req.query.status === 'all') {
                    filterQuery['employeeId'] = docs[0]._id;
                    // filterQuery['booking_status'] = 'paid'
                } else {
                    filterQuery['employeeId'] = docs[0]._id;
                    // filterQuery['booking_status'] = 'paid'
                }
                console.log("filterQuery", filterQuery)
                adminController.getEmployeeBookingById(filterQuery, (err, docs) => {
                    if (err) {
                        resp.errorResponse(res, err, 501, 'Error While getting booking details');
                    }
                    if (docs) {
                        console.log(docs)
                        resp.successGetResponse(res, docs, 'booking details');
                    }
                    else {
                        resp.noRecordsFound(res, 'Unable to get all booking details');
                    }
                })
                //resp.successGetResponse(res, docs, 'Doctors details');
            }
            else {
                resp.noRecordsFound(res, 'Unable to get Employees');
            }
        })
    }
})

router.get('/getEmployeeById', (req, res) => {
    let query = {
        'employeeId': req.query.employeeId
    }
    console.log('query', query)
    adminController.getEmployeeBookingById(query, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While getting user');
        }
        if (docs) {
            console.log(docs)
            resp.successGetResponse(res, docs, 'Employee details');
        }
        else {
            resp.noRecordsFound(res, 'Unable to get Users');
        }
    })
})

//booking

router.put('/changeBookingStatus', (req, res) => {
    let filterQuery = {}
    if (req.body.status === 'completed') {
        filterQuery['status'] = 'appointment closed'
    } else if (req.body.status === 'upcoming') {
        filterQuery['status'] = 'appointment confirmed'
    } else if (req.body.status === 'cancelled') {
        filterQuery['status'] = 'appointment cancelled'
    } else if (req.body.status === 'rescheduled') {
        filterQuery['rescheduled'] = true;
    } else if (req.body.status === 'TBD') {
        filterQuery['status'] = 'appointment TBD'
    }
    let bookingId = {};
    let bookingConfirmFlag = 0; //used to check whether there is existing confirmed appointment
    bookingId['_id'] = req.query.bookingId;
    console.log(bookingId);
    console.log("filterQuery", filterQuery)


    adminController.getBookingById(bookingId, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While fetching booked slots');
        } else if (docs.length > 0) {
            console.log("particularId slot",docs);
            // if ((req.body.status === 'upcoming') && (docs[0].status == 'appointment confirmed')) {
            //     bookingConfirmFlag = 1;
            // }
            // if (bookingConfirmFlag === 0) {
            //     adminController.changeBookingStatus({ _id: req.query.bookingId }, filterQuery, (err, docs) => {
            //         if (err) {
            //             resp.errorResponse(res, err, 501, 'Error While updating booking status');
            //         }
            //         if (docs) {
            //             console.log(docs)
            //             resp.successGetResponse(res, docs, 'booking status updated successfully');
            //         }
            //         else {
            //             resp.noRecordsFound(res, 'Unable to update booking status');
            //         }
            //     })
            // } else {
            //     resp.unsuccessGetResponse(res, 'Client has an existing appointment', 'Unable to update booking status');
            // }
        } else {
            resp.noRecordsFound(res, 'Unable to fetch booked slots');
        }
    })
})

router.put('/changeEmployeeBookingStatus', (req, res) => {
    let filterQuery = {}
    if (req.body.status === 'completed') {
        filterQuery['status'] = 'appointment closed'
    } else if (req.body.status === 'upcoming') {
        filterQuery['status'] = 'appointment confirmed'
    } else if (req.body.status === 'cancelled') {
        filterQuery['status'] = 'appointment cancelled'
    } else if (req.body.status === 'rescheduled') {
        filterQuery['rescheduled'] = true;
    } else if (req.body.status === 'TBD') {
        filterQuery['status'] = 'appointment TBD'
    }
    let bookingId = {};
    let bookingConfirmFlag = 0; //used to check whether there is existing confirmed appointment
    bookingId['_id'] = req.query.bookingId;
    console.log(bookingId);
    console.log("filterQuery", filterQuery)


    adminController.getEmployeeBookingById(bookingId, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While fetching booked slots');
        } else if (docs.length > 0) {
            console.log("particularId slot",docs);
                if ((req.body.status === 'upcoming') && (docs[0].status == 'appointment confirmed')) {
                    bookingConfirmFlag = 1;
                }
            // for (var item of docs) {
            //     console.log(item.status);
            //     if (item.status === 'appointment confirmed') {
            //         bookingConfirmFlag = 1;
            //     }
            // }
            if (bookingConfirmFlag === 0) {
                adminController.changeEmployeeBookingStatus({ _id: req.query.bookingId }, filterQuery, (err, docs) => {
                    if (err) {
                        resp.errorResponse(res, err, 501, 'Error While updating booking status');
                    }
                    if (docs) {
                        console.log(docs)
                        resp.successGetResponse(res, docs, 'booking status updated successfully');
                    }
                    else {
                        resp.noRecordsFound(res, 'Unable to update booking status');
                    }
                })
            } else {
                resp.unsuccessGetResponse(res, 'Employee has an existing appointment', 'Unable to update booking status');
            }
            // adminController.getEmployeeBookingById({ employeeId: docs[0].employeeId._id }, (err, docs) => {
            //     if (err) {
            //         resp.errorResponse(res, err, 501, 'Error While fetching client booked slots');
            //     } else if (docs.length > 0) {
            //         console.log("user booked_slots",docs);
                    
            //     }
            // })
        } else
        {
            resp.noRecordsFound(res, 'Unable to fetch booked slots');
        }
    })


})

router.get('/getAllBooking', (req, res) => {
    let filterQuery = {}
    if (req.query.status === 'completed')
    {
        filterQuery['status'] = 'appointment closed'
        filterQuery['booking_status'] = 'paid'
        filterQuery['booking_sort'] = -1
    } else if (req.query.status === 'upcoming') 
    {
        filterQuery['status'] = 'appointment confirmed'
        filterQuery['booking_status'] = 'paid'
        filterQuery['booking_sort'] = 1
    } else if (req.query.status === 'cancelled') 
    {
        filterQuery['status'] = 'appointment cancelled'
        filterQuery['booking_status'] = 'paid'
        filterQuery['booking_sort'] = -1
    } else if (req.query.status === 'rescheduled') 
    {
        filterQuery['rescheduled'] = true;
        filterQuery['booking_status'] = 'paid'
        filterQuery['booking_sort'] = -1
    } else if (req.query.status === 'all') 
    {
        filterQuery['booking_status'] = { $exists: true }
        filterQuery['booking_sort'] = -1
    } else if (req.query.status === 'userloggedin') 
    {
        filterQuery['user_login_time'] = { $exists: true }
        filterQuery['booking_sort'] = 1
    } else if (req.query.status === 'userloggedout') 
    {
        filterQuery['user_logout_time'] = { $exists: true }
    } else if (req.query.status === 'missed') 
    {
        filterQuery['status'] = "appointment missed"
        filterQuery['booking_sort'] = -1
    } else if (req.query.status === 'doctorloggedin') 
    {
        filterQuery['doctor_login_time'] = { $exists: true }
    } else if (req.query.status === 'doctorloggedout') 
    {
        filterQuery['doctor_logout_time'] = { $exists: true }
    } else 
    {
        filterQuery['booking_status'] = { $exists: true }
        filterQuery['booking_sort'] = -1
    }
    console.log("filterQuery", filterQuery)
    adminController.getAllBooking(filterQuery, (err, docs) => {
        // console.log('testing get all call data :: => ',docs[1]);
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While getting booking details');
        }
        if (docs) {
            // console.log(docs)
            resp.successGetResponse(res, docs, 'All booking details');

        }
        else {
            resp.noRecordsFound(res, 'Unable to get all booking details');
        }
    })
})

router.get('/getAllEmployeeBooking', (req, res) => {
    let filterQuery = {}
    if (req.query.status === 'completed') {
        filterQuery['status'] = 'appointment closed'
        filterQuery['booking_sort'] = -1
    } else if (req.query.status === 'upcoming') {
        filterQuery['status'] = 'appointment confirmed'
        filterQuery['booking_sort'] = 1
    } else if (req.query.status === 'cancelled') {
        filterQuery['status'] = 'appointment cancelled'
        filterQuery['booking_sort'] = -1
    } else if (req.query.status === 'rescheduled') {
        filterQuery['rescheduled'] = true;
        filterQuery['booking_sort'] = -1
    } else if (req.query.status === 'all') {
        filterQuery['status'] = { $exists: true }
        filterQuery['booking_sort'] = -1
    } else if (req.query.status === 'employeeloggedin') {
        filterQuery['employee_login_time'] = { $exists: true }
        filterQuery['booking_sort'] = 1
    } else if (req.query.status === 'employeeloggedout') {
        filterQuery['employee_logout_time'] = { $exists: true }
    } else if (req.query.status === 'missed') {
        filterQuery['status'] = "appointment missed"
        filterQuery['booking_sort'] = -1
    } else if (req.query.status === 'doctorloggedin') {
        filterQuery['doctor_login_time'] = { $exists: true }
    } else if (req.query.status === 'doctorloggedout') {
        filterQuery['doctor_logout_time'] = { $exists: true }
    } else {
        filterQuery['status'] = { $exists: true }
        filterQuery['booking_sort'] = -1
    }
    console.log("filterQuery", filterQuery)
    adminController.getAllEmployeeBooking(filterQuery, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While getting booking details');
        }
        if (docs) {
            console.log(docs)
            resp.successGetResponse(res, docs, 'All booking details');

        }
        else {
            resp.noRecordsFound(res, 'Unable to get all booking details');
        }
    })
})

router.get('/getBookingById', (req, res) => {
    console.log('query', req.query)
    if (req.query) {
        let filterQuery = {}
        if (req.query.status === 'completed') {
            filterQuery['_id'] = req.query.bookingId;
            filterQuery['status'] = 'appointment closed'
            filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'upcoming') {
            filterQuery['_id'] = req.query.bookingId;
            filterQuery['status'] = 'appointment confirmed'
            filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'cancelled') {
            filterQuery['_id'] = req.query.bookingId;
            filterQuery['status'] = 'appointment cancelled'
            filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'rescheduled') {
            filterQuery['_id'] = req.query.bookingId;
            filterQuery['rescheduled'] = true;
            filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'all') {
            filterQuery['_id'] = req.query.bookingId;
            filterQuery['booking_status'] = 'paid'
        } else {
            filterQuery['_id'] = req.query.bookingId;
            filterQuery['booking_status'] = 'paid'
        }
        console.log("filterQuery", filterQuery)
        adminController.getBookingById(filterQuery, (err, docs) => {
            if (err) {
                resp.errorResponse(res, err, 501, 'Error While getting booking details');
            }
            if (docs) {
                console.log(docs)
                resp.successGetResponse(res, docs, 'booking details');
            }
            else {
                resp.noRecordsFound(res, 'Unable to get all booking details');
            }
        })
    }
})

router.get('/getBookingByRating', (req, res) => {
    if (req.query) {
        let filterQuery = {}
        if (req.query.status === 'completed') {
            filterQuery['rating'] = req.query.rating;
            filterQuery['status'] = 'appointment closed'
            filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'upcoming') {
            filterQuery['rating'] = req.query.rating;
            filterQuery['status'] = 'appointment confirmed'
            filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'cancelled') {
            filterQuery['rating'] = req.query.rating;
            filterQuery['status'] = 'appointment cancelled'
            filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'rescheduled') {
            filterQuery['rating'] = req.query.rating;
            filterQuery['rescheduled'] = true;
            filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'all') {
            filterQuery['rating'] = req.query.rating;
            filterQuery['booking_status'] = 'paid'
        } else {
            filterQuery['rating'] = req.query.rating;
            filterQuery['booking_status'] = 'paid'
        }
        console.log("filterQuery", filterQuery)
        adminController.getBookingById(filterQuery, (err, docs) => {
            if (err) {
                resp.errorResponse(res, err, 501, 'Error While getting booking details');
            } else if (docs) {
                console.log(docs)
                resp.successGetResponse(res, docs, 'booking details');
            }
            else {
                resp.noRecordsFound(res, 'Unable to get all booking details');
            }
        })
    }
})

router.get('/getCorporateBookingByRating', (req, res) => {
    if (req.query) {
        let filterQuery = {}
        if (req.query.status === 'completed') {
            filterQuery['rating'] = req.query.rating;
            filterQuery['status'] = 'appointment closed'
            // filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'upcoming') {
            filterQuery['rating'] = req.query.rating;
            filterQuery['status'] = 'appointment confirmed'
            // filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'cancelled') {
            filterQuery['rating'] = req.query.rating;
            filterQuery['status'] = 'appointment cancelled'
            // filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'rescheduled') {
            filterQuery['rating'] = req.query.rating;
            filterQuery['rescheduled'] = true;
            // filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'all') {
            filterQuery['rating'] = req.query.rating;
            // filterQuery['booking_status'] = 'paid'
        } else {
            filterQuery['rating'] = req.query.rating;
            // filterQuery['booking_status'] = 'paid'
        }
        console.log("filterQuery", filterQuery)
        adminController.getEmployeeBookingById(filterQuery, (err, docs) => {
            if (err) {
                resp.errorResponse(res, err, 501, 'Error While getting booking details');
            }
            else if (docs) {
                console.log(docs)
                resp.successGetResponse(res, docs, 'booking details');
            }
            else {
                resp.noRecordsFound(res, 'Unable to get all booking details');
            }
        })
    }
})

router.get('/getBookingByPartnerRating', (req, res) => {
    if (req.query) {
        let filterQuery = {}
        if (req.query.status === 'completed') {
            filterQuery['doctor_rating'] = req.query.rating;
            filterQuery['status'] = 'appointment closed'
            filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'upcoming') {
            filterQuery['doctor_rating'] = req.query.rating;
            filterQuery['status'] = 'appointment confirmed'
            filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'cancelled') {
            filterQuery['doctor_rating'] = req.query.rating;
            filterQuery['status'] = 'appointment cancelled'
            filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'rescheduled') {
            filterQuery['doctor_rating'] = req.query.rating;
            filterQuery['rescheduled'] = true;
            filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'all') {
            filterQuery['doctor_rating'] = req.query.rating;
            filterQuery['booking_status'] = 'paid'
        } else {
            filterQuery['doctor_rating'] = req.query.rating;
            filterQuery['booking_status'] = 'paid'
        }
        console.log("filterQuery", filterQuery)
        adminController.getBookingById(filterQuery, (err, docs) => {
            if (err) {
                resp.errorResponse(res, err, 501, 'Error While getting booking details');
            }
            else if (docs) {
                console.log(docs)
                resp.successGetResponse(res, docs, 'booking details');
            }
            else {
                resp.noRecordsFound(res, 'Unable to get all booking details');
            }
        })
    }
})

router.get('/getBookingByCouponCode', (req, res) => {
    if (req.query) {
        let filterQuery = {}
        if (req.query.status === 'completed') {
            filterQuery['coupon_name'] = req.query.couponCode;
            filterQuery['status'] = 'appointment closed'
            filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'upcoming') {
            filterQuery['coupon_name'] = req.query.couponCode;
            filterQuery['status'] = 'appointment confirmed'
            filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'cancelled') {
            filterQuery['coupon_name'] = req.query.couponCode;
            filterQuery['status'] = 'appointment cancelled'
            filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'rescheduled') {
            filterQuery['coupon_name'] = req.query.couponCode;
            filterQuery['rescheduled'] = true;
            filterQuery['booking_status'] = 'paid'
        } else if (req.query.status === 'all') {
            filterQuery['coupon_name'] = req.query.couponCode;
            filterQuery['booking_status'] = 'paid'
        } else {
            filterQuery['coupon_name'] = req.query.couponCode;
            filterQuery['booking_status'] = 'paid'
        }
        console.log("filterQuery", filterQuery)
        adminController.getBookingById(filterQuery, (err, docs) => {
            if (err) {
                resp.errorResponse(res, err, 501, 'Error While getting booking details');
            }
            else if (docs) {
                console.log(docs)
                resp.successGetResponse(res, docs, 'booking details');
            }
            else {
                resp.noRecordsFound(res, 'Unable to get all booking details');
            }
        })
    }

})

router.get('/getBookingByLoginStatus', (req, res) => {
    if (req.query) {
        let filterQuery = {}
        if (req.query.loginStatus === 'loggedin') {
            filterQuery['user_login_time'] = { $exists: true }
        } else if (req.query.loginStatus === 'loggedout') {
            filterQuery['user_logout_time'] = { $exists: true }
        } else if (req.query.loginStatus === 'missed') {
            filterQuery['status'] = "appointment missed"
        }
        adminController.getBookingById(filterQuery, (err, docs) => {
            if (err) {
                resp.errorResponse(res, err, 501, 'Error While getting booking details');
            }
            else if (docs) {
                console.log(docs)
                resp.successGetResponse(res, docs, 'booking details');
            }
            else {
                resp.noRecordsFound(res, 'Unable to get all booking details');
            }
        })
    }
})

router.get('/getCorporateBookingByLoginStatus', (req, res) => {
    if (req.query) {
        let filterQuery = {}
        if (req.query.loginStatus === 'loggedin') {
            filterQuery['employee_login_time'] = { $exists: true }
        } else if (req.query.loginStatus === 'loggedout') {
            filterQuery['employee_logout_time'] = { $exists: true }
        } else if (req.query.loginStatus === 'missed') {
            filterQuery['status'] = "appointment missed"
        }
        adminController.getEmployeeBookingById(filterQuery, (err, docs) => {
            if (err) {
                resp.errorResponse(res, err, 501, 'Error While getting booking details');
            }
            else if (docs) {
                console.log(docs)
                resp.successGetResponse(res, docs, 'booking details');
            }
            else {
                resp.noRecordsFound(res, 'Unable to get all booking details');
            }
        })
    }
})

router.get('/getBookingByLoginStatusPatner', (req, res) => {
    if (req.query) {
        let filterQuery = {}
        if (req.query.loginStatus === 'loggedin') {
            filterQuery['doctor_login_time'] = { $exists: true }
        } else if (req.query.loginStatus === 'loggedout') {
            filterQuery['doctor_logout_time'] = { $exists: true }
        } else if (req.query.loginStatus === 'missed') {
            filterQuery['status'] = "appointment missed"
        }
        adminController.getBookingById(filterQuery, (err, docs) => {
            if (err) {
                resp.errorResponse(res, err, 501, 'Error While getting booking details');
            }
            else if (docs) {
                console.log(docs)
                resp.successGetResponse(res, docs, 'booking details');
            }
            else {
                resp.noRecordsFound(res, 'Unable to get all booking details');
            }
        })
    }
})

router.put('/blockuser', (req, res) => {
    let query = {
        '_id': req.body.userId
    }
    console.log('query', query)
    adminController.blockUser(query, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While blocking user');
        }
        console.log(docs)

        if (docs) {
            resp.successGetResponse(res, 'user blocked');
        }
        else {
            resp.noRecordsFound(res, 'Unable to block the user');
        }
    })
})

router.put('/unblockuser', (req, res) => {
    let query = {
        '_id': req.body.userId
    }
    console.log('query', query)
    adminController.unblockuser(query, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While blocking user');
        }
        console.log(docs)

        if (docs) {
            resp.successGetResponse(res, 'user blocked');
        }
        else {
            resp.noRecordsFound(res, 'Unable to block the user');
        }
    })
})

router.put('/blockdoctor', (req, res) => {
    let query = {
        '_id': req.body.doctorId
    }
    console.log('query', query)
    adminController.blockDoctor(query, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While blocking doctor');
        }
        console.log(docs)

        if (docs) {
            resp.successGetResponse(res, 'doctor blocked');
        }
        else {
            resp.noRecordsFound(res, 'Unable to block the doctor');
        }
    })
})

router.put('/unblockdoctor', (req, res) => {
    let query = {
        '_id': req.body.doctorId
    }
    console.log('query', query)
    adminController.unblockDoctor(query, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While unblocking doctor');
        }
        console.log(docs)

        if (docs) {
            resp.successGetResponse(res, 'doctor unblocked');
        }
        else {
            resp.noRecordsFound(res, 'Unable to unblock the doctor');
        }
    })
})

// NOT IN USE BUT NOT SURE WHETHER THIS API IS USING OR NOT

router.get('/allAppointments', (req, res) => {
    adminController.getAllAppointment((err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While creating timeslots');
        }
        if (docs) {
            console.log(docs)
            resp.successGetResponse(res, docs, 'All appointments');
        }
        else {
            resp.noRecordsFound(res, 'Unable to get all appointments');
        }
    })
})


// NOT IN USE BUT NOT SURE WHETHER THIS API IS USING OR NOT
router.put('/editdoctor', (req, res) => {
    adminController.editDoctor(req.body, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While saving doctor details');
        }
        console.log(docs)

        if (docs) {
            resp.successGetResponse(res, docs, 'doctor details');
        }
        else {
            resp.noRecordsFound(res, 'Unable to fetch doctor details');
        }
    })
})

// NOT IN USE BUT NOT SURE WHETHER THIS API IS USING OR NOT
router.get('/allpayments', (req, res) => {
    adminController.getAllPayment((err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While creating timeslots');
        }
        if (docs) {
            console.log(docs)
            resp.successGetResponse(res, docs, 'All appointments');
        }
        else {
            resp.noRecordsFound(res, 'Unable to get all appointments');
        }
    })
})

// NOT IN USE BUT NOT SURE WHETHER THIS API IS USING OR NOT
router.put('/edituser', (req, res) => {
    adminController.editUser(req.body, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While saving user details');
        }
        console.log(docs)

        if (docs) {
            resp.successGetResponse(res, docs, 'user details');
        }
        else {
            resp.noRecordsFound(res, 'Unable to fetch user details');
        }
    })
})

// write in documentation later
router.put('/cancelappointment', (req, res) => {
    if (req.body) {
        adminController.cancelappointment(req.body, (err, docs) => {
            if (err) {
                resp.errorResponse(res, err, 501, 'Error While fetching data');
            }
            if (docs) {
                resp.successGetResponse(res, docs, 'cancel Appointment');
            } else {
                resp.noRecordsFound(res, 'Unable to fetch cancelappointment');
            }
        })
    } else {
        resp.noRecordsFound(res, 'missing');

    }
});

// didnt find this api
router.put('/deleteslot', (req, res) => {
    if (req.body) {
        appointmentController.getTimeSlots({ doctorId: req.body.doctorId }, (err, docs) => {
            if (err) {
                resp.errorResponse(res, err, 501, 'Error While fetching data');
            }
            if (docs) {

                appointmentController.deleteslot({ doctorId: req.body.doctorId }, docs, req.body.availableSlots, (err, result) => {
                    if (err) {
                        resp.errorResponse(res, err, 501, 'Error While fetching data');
                    }
                    if (result) {
                        appointmentController.calendar({ doctorId: req.body.doctorId }, (err, document) => {
                            if (err) {
                                resp.errorResponse(res, err, 501, 'Error While fetching data');
                            }
                            if (document) {
                                appointmentController.calendarCore(document, result.availableSlots, (err, results) => {
                                    if (err) {
                                        resp.errorResponse(res, err, 501, 'Error While fetching data');
                                    }
                                    if (results) {
                                        resp.successGetResponse(res, results, 'timeslots List');
                                    }
                                    else {
                                        resp.noRecordsFound(res, 'Unable to fetch timeslots List');
                                    }
                                })
                            } else {
                                resp.successGetResponse(res, null, 'timeslots List');
                            }

                        })
                    }
                    else {
                        console.log("gg")
                        resp.noRecordsFound(res, 'Unable to fetch timeslots List');
                    }

                })
            } else {
                resp.errorResponse(res, err, 501, 'Error While fetching data');
            }
        })

    } else {
        resp.noRecordsFound(res, 'missing');

    }
});

router.post('/createBooking', (req, res) => {
    console.log("inside bookappointments", req.body);
    if (req.body) {
        function generateReciept() 
        {
            var digits = '0123456789';
            let order_rcptid = '';
            for (let i = 0; i < 4; i++) 
            {
                order_rcptid += digits[Math.floor(Math.random() * 10)];
            }
            return order_rcptid;
        }
        var receiptId = generateReciept();
        receiptId = 'order_rcptid_' + receiptId;
        console.log(receiptId);

        var instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_SECRET_KEY })

        var options = 
        {
            amount: (req.body.payment.fee) * 100,  // amount in the smallest currency unit
            currency: req.body.payment.currency,
            receipt: receiptId
        };
        instance.orders.create(options, function (err, order) {
            if (err) 
            {
                console.log("err", err)
                resp.errorResponse(res, err, 501, 'Error While creating orderId');
            } else if (order) 
            {
                console.log("order", order);
                req.body["order"] = order;
                // convert date-time string to timestamp
                let date = req.body.bookedslots.date;
                let time = req.body.bookedslots.slots[0].from;
                let timearr = time.split(':');
                console.log(timearr)
                let timestr = "";
                if (timearr[2] === "PM") 
                {
                    timestr = parseInt(timearr[0]) + 12 + ':' + timearr[1];
                } else 
                {
                    timestr = timearr[0] + ':' + timearr[1];
                }
                console.log('timestr', timestr)
                var dateString = "27/04/2021 15:00";

                console.log('dateString', dateString);

                var dateMomentObject = moment(dateString, "DD/MM/YYYY HH:mm"); // 1st argument - string, 2nd argument - format
                var dateObject = dateMomentObject.toDate(); // convert moment.js object to Date object

                console.log("date", dateObject)
                console.log("dateobj", dateObject.toString())
                req.body["order"] = order;
                req.body["bookedSlotsTime"] = dateObject;
                appointmentController.bookTimeSlots(req.body, (err, docs) => {
                    if (err) 
                    {
                        console.log(err)
                        resp.errorResponse(res, err, 501, 'Error While booking appointment');
                    } else if (docs) 
                    {
                        resp.successGetResponse(res, docs, 'appointment created successfully');
                    } else 
                    {
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

router.put('/rescheduleBooking', (req, res) => {
    console.log("inside rescheduleBooking query", req.query);
    console.log("inside rescheduleBooking body", req.body);
    const query = {};
    query['_id'] = req.query.bookingId;
    const dataToBeUpdated = req.body.updatedData
    if (req.body && req.query) {
        appointmentController.updateBooking(query, dataToBeUpdated, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While booking timeslots');
            } else if (docs) {
                console.log("docs", docs)
                resp.successGetResponse(res, docs.bookedslots, 'rescheduled appointment successfully');
            } else {
                resp.noRecordsFound(res, 'Unable to book doctors timeslots');
            }
        })
    }
})









// coupon 
router.post('/generateCoupon', (req, res) => 
{
    console.log('inside generate coupon')
    if (req.body) {
        adminController.generateCoupon(req.body, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error while generating coupon');
            } else if (docs) {
                console.log("docs", docs)
                resp.successGetResponse(res, docs, 'coupon geneated successfully');
            } else {
                resp.noRecordsFound(res, 'Unable to geneate coupon');
            }
        })
    }
})

router.get('/getAllCoupon', (req, res) => {
    console.log('inside getAllCoupon coupon')

    adminController.getAllCoupon({}, (err, docs) => {
        if (err) {
            console.log(err)
            resp.errorResponse(res, err, 501, 'Error While getting coupon');
        } else if (docs) {
            console.log("docs", docs)
            resp.successGetResponse(res, docs, 'coupons list');
        } else {
            resp.noRecordsFound(res, 'Unable to get coupon');
        }
    })

})

router.get('/getAllActiveCoupon', (req, res) => {
    console.log('inside getAllActiveCoupon coupon')
    let current_date = new Date();
    console.log("current_date", current_date)
    let new_date = current_date.setMinutes(current_date.getMinutes() + 330);
    let compare_date = new Date(new_date)
    console.log("compare_date", compare_date)
    let query = {
        'start_date': { '$lte': compare_date },
        'end_date': { '$gte': compare_date },
        'active': true
    }

    adminController.getAllCoupon(query, (err, docs) => {
        if (err) {
            console.log(err)
            resp.errorResponse(res, err, 501, 'Error While getting coupon');
        } else if (docs) {
            console.log("docs", docs)
            resp.successGetResponse(res, docs, 'coupons list');
        } else {
            resp.noRecordsFound(res, 'Unable to get coupon');
        }
    })

})

// NOT IN USE BUT NOT SURE WHETHER THIS API IS USING OR NOT
router.get('/getCoupnByName', (req, res) => {
    console.log('inside getCoupnByName coupon')

    if (req.query) {
        adminController.getAllCoupon(req.query, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While getting coupon');
            } else if (docs) {
                console.log("docs", docs)
                resp.successGetResponse(res, docs, 'coupons list');
            } else {
                resp.noRecordsFound(res, 'Unable to get coupon');
            }
        })
    }

})

router.put('/updateCoupon', (req, res) => {
    console.log('inside updateCoupon')
    if (req.query && req.body) {
        let query = {
            "_id": req.query.coupon_id
        }
        adminController.updateCoupon(query, req.body.updatedData, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While getting coupon');
            } else if (docs) {
                console.log("docs", docs)
                resp.successGetResponse(res, docs, 'coupons list');
            } else {
                resp.noRecordsFound(res, 'Unable to get coupon');
            }
        })
    }

})

router.delete('/deleteCoupon', (req, res) => {
    console.log('inside deleteCoupon')
    if (req.query && req.body) {
        let query = {
            "_id": req.query.coupon_id
        }
        adminController.deleteCoupon(query, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While deleting coupon');
            } else if (docs) {
                console.log("docs", docs)
                resp.successGetResponse(res, 'coupon deleted successfully!');
            } else {
                resp.noRecordsFound(res, 'Unable to delete coupon');
            }
        })
    }

})

router.put('/activateCoupon', (req, res) => {
    console.log('inside updateCoupon')
    if (req.query) {
        let query = {
            "_id": req.query.coupon_id
        }
        adminController.updateCoupon(query, { active: true }, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While getting coupon');
            } else if (docs) {
                console.log("docs", docs)
                resp.successGetResponse(res, docs, 'coupons list');
            } else {
                resp.noRecordsFound(res, 'Unable to get coupon');
            }
        })
    }

})

router.put('/deactivateCoupon', (req, res) => {
    console.log('inside updateCoupon')
    if (req.query) {
        let query = {
            "_id": req.query.coupon_id
        }
        adminController.updateCoupon(query, { active: false }, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While getting coupon');
            } else if (docs) {
                console.log("docs", docs)
                resp.successGetResponse(res, docs, 'coupons list');
            } else {
                resp.noRecordsFound(res, 'Unable to get coupon');
            }
        })
    }

})


router.put('/visibleCoupon', (req, res) => {
    console.log('inside updateCoupon')
    if (req.query) {
        let query = {
            "_id": req.query.coupon_id
        }
        adminController.updateCoupon(query, { is_visible: true }, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While getting coupon');
            } else if (docs) {
                console.log("docs", docs)
                resp.successGetResponse(res, docs, 'coupons list');
            } else {
                resp.noRecordsFound(res, 'Unable to get coupon');
            }
        })
    }

})

router.put('/invisibleCoupon', (req, res) => {
    console.log('inside updateCoupon')
    if (req.query) {
        let query = {
            "_id": req.query.coupon_id
        }
        adminController.updateCoupon(query, { is_visible: false }, (err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While getting coupon');
            } else if (docs) {
                console.log("docs", docs)
                resp.successGetResponse(res, docs, 'coupons list');
            } else {
                resp.noRecordsFound(res, 'Unable to get coupon');
            }
        })
    }

})

router.get('/getIncomingAccounts', (req, res) => {
    if (req.user) {
        adminController.getIncomingAccounts((err, docs) => {
            if (err) {
                resp.errorResponse(res, err, 501, 'Error While getting booking details');
            }
            if (docs) {
                console.log(docs)
                resp.successGetResponse(res, docs, 'All booking details');
            }
            else {
                resp.noRecordsFound(res, 'Unable to get all booking details');
            }
        })
    }

})

router.get('/getOutingAccounts', (req, res) => {
    if (req.user) {
        adminController.getOutingAccounts((err, docs) => {
            if (err) {
                resp.errorResponse(res, err, 501, 'Error While getting Outing Accounts');
            }
            if (docs) {
                console.log(docs)
                resp.successGetResponse(res, docs, 'All Outing Accounts');
            }
            else {
                resp.noRecordsFound(res, 'Unable to get all Outing Accounts');
            }
        })
    }

})

router.get('/getAllDoctorCalender', (req, res) => {
//     const processDoctorCalendarSlots = (docs, slots_docs) => {
//     //     return {docs, slots_docs};
//     //     docs.forEach((e, v) => {
//     //         var doctor_id1 = '"' + e._id + '"';
//     //         e.calender.forEach((element, index1) => {
//     //             element.slot_timestamp.forEach((date_element, index1) => {
//     //                 var date_r = date_element.date;
//     //                 date_r = moment(date_r).format('YYYY-MM-DD HH:mm:ss') + ".000Z";
//     //                 date_r = date_r.toString();
//     //                 slots_docs.forEach((slot_element, index2) => {
//     //                     var slot_date = slot_element.bookedSlotsTime;
//     //                     var doctor_id = '"' + slot_element.doctorId + '"';
                       
//     //                     slot_date = moment(slot_date).format('YYYY-MM-DD HH:mm:ss') + ".000Z";
//     //                     slot_date = slot_date.toString();

//     //                     if ((slot_date == date_r) && (doctor_id.toString() == doctor_id1.toString())) {

//     //                         date_element.booked = true;
//     //                         // console.log("]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]", slot_element.doctorId);
//     //                     }
//     //                 })
//     //             })

//     //         })
//     //     })
//     //     return docs;
//     // }
//     console.log("Process started", new Date().toISOString());
//     // return {docs, slots_docs};
//     docs.forEach((e, v) => {
//         var doctor_id1 = '"' + e._id + '"';
//         e.calender.forEach((element, index1) => {
//             element.slot_timestamp.forEach((date_element, index1) => {
//                 var date_r = date_element.date;
//                 slots_docs.forEach((slot_element, index2) => {
//                     var slot_date = slot_element.bookedSlotsTime;
//                     var doctor_id = '"' + slot_element.doctorId + '"';

//                     if ((slot_date == date_r) && (doctor_id.toString() == doctor_id1.toString())) {
//                         date_element.booked = true;
//                         console.log('booked executed');
//                     }
//                 })
//             })

//         })
//     })
//     console.log("Process ended", new Date().toISOString());
//     return docs;
// }
const processDoctorCalendarSlots = (docs, slots_docs) => {
    console.log("Process started", new Date().toISOString());
    let logNSpaceSlots = (slots_docs) => {
        let output = {};
        for (let i in slots_docs) {
            if (output[slots_docs[i].doctorId] == undefined) {
                output[slots_docs[i].doctorId] = {}
            }
            output[slots_docs[i].doctorId][slots_docs[i].bookedSlotsTime] = true;
        }
        return output;
    }
    const slots_docs_processed = logNSpaceSlots(slots_docs);
    docs.forEach((e, v) => {
        e.calender.forEach((element, index1) => {
            element.slot_timestamp.forEach((date_element, index1) => {
                var date_r = date_element.date;
                if (slots_docs_processed[e._id] && slots_docs_processed[e._id][date_r]) {
                    date_element.booked = true;
                    console.log('booked executed');
                }
            })

        })
    })
    console.log("Process ended", new Date().toISOString());
    return docs;
}
    if (req.user) {
        let options = {

        }
        console.log('Time started', new Date().toISOString());
        employeeCtrl.getRemainingSlotsAdminCalendarAPI(options, (err, slots_docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While getting appointment');
            } else if (slots_docs.length > 0) {
                console.log('Remaining slots fetched', new Date().toISOString());
                adminController.getAllDoctorCalender((err, docs) => {
                    if (err) {
                        resp.errorResponse(res, err, 501, 'Error While getting calender');
                    }
                    if (docs.length > 0) {
                        console.log('Doctors fetched', new Date().toISOString());
                        docs = processDoctorCalendarSlots(docs, slots_docs);
                        console.log('Data Processed', new Date().toISOString());
                        resp.successGetResponse(res, docs, 'All calender details');
                    }
                    else {
                        resp.noRecordsFound(res, 'Unable to get all calender details');
                    }
                })
            }
        })
    }
})

router.get('/getAllCorporateCalender', (req, res) => {
    if (req.user) {
        let options = {

        }
        employeeCtrl.getRemainingSlots_employee(options, (err, slots_docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While getting appointment');
            } else if (slots_docs.length > 0) {
                adminController.getAllCorporateCalender((err, docs) => {
                    if (err) {
                        resp.errorResponse(res, err, 501, 'Error While getting calender');
                    }
                    if (docs.length > 0) {
                        docs.forEach((e, v) => {
                            var doctor_id1 = '"' + e._id + '"';
                            e.calender.forEach((element, index) => {
                                element.slot_timestamp.forEach((date_element, index1) => {
                                    var date_r = date_element.date;
                                    date_r = moment(date_r).format('YYYY-MM-DD HH:mm:ss') + ".000Z";
                                    date_r = date_r.toString();
                                    slots_docs.forEach((slot_element, index2) => {
                                        var slot_date = slot_element.bookedSlotsTime;
                                        var doctor_id = '"' + slot_element.doctorId + '"';
                                        slot_date = moment(slot_date).format('YYYY-MM-DD HH:mm:ss') + ".000Z";
                                        slot_date = slot_date.toString();
                                        if ((slot_date == date_r) && (doctor_id.toString() == doctor_id1.toString())) {
                                            date_element.booked = true;
                                        }
                                    })
                                })

                            })
                        })

                        resp.successGetResponse(res, docs, 'All calender details');
                    }
                    else {
                        resp.noRecordsFound(res, 'Unable to get all calender details');
                    }
                })
            }
        })
    }
})

// NOT IN USE BUT NOT SURE WHETHER THIS API IS USING OR NOT
router.get('/getAllPartnerBooking', (req, res) => {
    if (req.user) {
        doctorModel.getAllDcotors((err, docs) => {
            if (err) {
                console.log(err)
                resp.errorResponse(res, err, 501, 'Error While getting partner-booking');
            } else if (docs) {
                console.log("doctorlist", docs)
                resp.successGetResponse(res, docs, 'partner-booking details');
            } else {
                console.log("null")
                resp.noRecordsFound(res, 'Unable to get partner-booking');
            }
        })
    }
})

router.post('/processPayout', (req, res) => {
    console.log("Hello payment");
    if (req.user && req.body) {
        console.log("data 1201", req.body)
        console.log("payment_amount", req.body.payout_ammount);
        key_id = process.env.RAZORPAY_KEY_ID;
        secret_key = process.env.RAZORPAY_SECRET_KEY;
        let id_arr = [];
        for (const iterator of req.body.bookingId) {
            id_arr.push(iterator._id)
        }
        console.log("id_arr 1205", id_arr)
        request({
            method: "POST",
            url: `https://` + key_id + `:` + secret_key + `@api.razorpay.com/v1/payouts`,
            form: {
                "account_number": "4564565751476779",
                "amount": req.body.payout_ammount,
                "currency": "INR",
                "mode": "NEFT",
                "purpose": "refund",
                "fund_account": {
                    "account_type": "bank_account",
                    "bank_account": {
                        "name": req.body.name,
                        "ifsc": req.body.ifsc_code,
                        "account_number": req.body.account_number
                    },
                    "contact": {
                        "name": req.body.name,
                        "email": req.body.emailId,
                        "contact": req.body.mobileNo,
                        "type": "employee",
                        "reference_id": "Acme Contact ID 12345",
                        "notes": {
                            "notes_key_1": "",
                            "notes_key_2": ""
                        }
                    }
                },
                "queue_if_low_balance": new Boolean(true),
                "reference_id": "Acme Transaction ID 12345",
                "narration": "Acme Corp Fund Transfer",
                "notes": {
                    "notes_key_1": "Beam me up Scotty",
                    "notes_key_2": "Engage"
                }
            }
        }, (error, response, body) => {
            console.log("razorpay-error");
            console.log("error", error)
            console.log('Status:', response.statusCode);
            console.log('Headers:', JSON.stringify(response.headers));
            console.log('body:', body);
            let bodyResponse = JSON.parse(body);
            console.log("bodyResponse", bodyResponse);
            if (error) {
                resp.errorResponse(res, error, response.statusCode, 'Response');
            } else if (bodyResponse.error) {
                resp.errorResponse(res, bodyResponse.error, response.statusCode, bodyResponse.error.code);
            } else {
                resp.successGetResponse(res, "", 'payout successfull');

                let query = { _id: { $in: id_arr } }

                adminController.updateAllAppointmentsById(query, (err, docs) => {
                    if (err) {
                        console.log(err)
                        //resp.errorResponse(res, err, 501, 'Error While updateAllAppointments');
                    }
                    if (docs) {
                        console.log(docs)
                        //resp.successGetResponse(res, docs, 'updateAllAppointments');
                    }
                    else {
                        console.log("null")
                        //resp.noRecordsFound(res, 'Unable to updateAllAppointments');
                    }
                })
            }
        });
    }
});

router.get('/getcompanyappointments', (req, res) => {
    let Query = {
        "companyId": req.query.companyId
    };
    adminController.getCompanyAppointments(Query, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While getting CompanyAppointments');
        } else if (docs) {
            var arr = [];
            for (var i = 0; i < docs.length; i++) {
                if (docs[i].employeeId !== null && docs[i].employeeId.companyId == req.query.companyId) {
                    arr.push(docs[i]);
                }
            }
            if (arr.length > 0) {
                resp.successGetResponse(res, arr, 'CompanyAppointments');

            } else {
                resp.noRecordsFound(res, 'Not found CompanyAppointments');
            }
        }
        else {
            resp.noRecordsFound(res, 'Unable to get CompanyAppointments');
        }
    })
})

module.exports = router;