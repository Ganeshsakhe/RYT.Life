const doctorModel = require('../projects/models/doctors.model').doctorModel
const userModel = require('../projects/models/users.model').UserModel
const EmployeeModel = require('../projects/models/company-employee.model').EmployeeModel;
const BookSlots = require('../projects/models/bookslots.model').bookingSlotsModel
const EmployeeBookSlots = require('../projects/models/employee-booking.model').employeeBookingSlotsModel
const DoctormodelHelper = require('../projects/model_helpers/doctor_model.helper')
const adminModel = require('../projects/models/admins.model').adminModel
const CouponModel = require('../projects/models/coupons.model').couponModel


function addNewAdmin(data, callback) {
    console.log("admin model", data)
    adminModel.create(data, (err, res) => {
        console.log("Admin MODEL RESPONSE");
        console.log(res);
        console.log("THE Admin MODEL ERR:", err);
        if (err) {
            console.log("Admin Model Error: ", err)
            callback(err, null);
        } else if (res) {
            console.log("inside else if", res);
            let resp = JSON.parse(JSON.stringify(res));
            console.log('resp', resp);
            if (delete resp.password) {
                console.log("Admin Model Result:", resp);
                callback(null, resp);
            } else {
                callback(null, null);
            }
        } else {
            callback(null, null);
        }
    });
}

function findUser(data, callback) {
    console.log("admin model", data)
    if (data) {
        adminModel.find(data, callback)
    }
}

function getAllDoctors(callback) {
    console.log("inside admin model")
    //doctorModel.find({}, "-password",callback)
    doctorModel.aggregate(
        [
            {
                $lookup:
                {
                    from: "bookedslots",
                    localField: "_id",
                    foreignField: "doctorId",
                    as: "booking_details"
                }
            }
        ]
    ).exec(callback)
}

function downloadAllDoctors(callback) {
    doctorModel.find({}, "-password", callback)
}

function getDoctorsById(query, callback) {
    doctorModel.find(query, "-password", callback)
}

function updateDoctorsProfile(query, dataToBeUpdated, callback) {
    DoctormodelHelper.update({ query: query, update: dataToBeUpdated, options: { new: true, select: '-password' } }, (err, res) => {
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

function getDoctorsAppointment(query, callback) {
    BookSlots.find(query, "-password")
        .populate('userId', { first_name: 1, last_name: 1 })
        .populate('doctorId', { name: 1 })
        .exec(callback)
}

function getDoctorsAppointment_employee(query, callback) {
    EmployeeBookSlots.find(query, "-password")
        .populate('employeeId', { first_name: 1, last_name: 1 })
        .populate('doctorId', { name: 1 })
        .exec(callback)
}

function getAllUsers(callback) {
    // userModel.find({$and:[{},{role:'User'}]}, "-password -role -iniReg",callback)

    userModel.aggregate(
        [
            {
                $lookup:
                {
                    from: "bookedslots",
                    localField: "_id",
                    foreignField: "userId",
                    as: "booking_details"
                }
            }
        ]
    ).exec(callback)
}

function getUsersById(query, callback) {
    userModel.find(query, "-password", callback)
}

function getEmployeeById(query, callback) {
    EmployeeModel.find(query, "-password", callback)
}

function updateUsersProfile(query, data, callback) {
    console.log("query", query)
    console.log("data", data)
    userModel.findOneAndUpdate(query, data, { new: true, select: '-password' }, callback)
}

function getUsersAppointmet(query, callback) {
    BookSlots.find(query, "-password")
        .populate('userId', { first_name: 1, last_name: 1 })
        .populate('doctorId', { name: 1 })
        .exec(callback)
}

function getAllBooking(data, callback) {

    console.log("data", data);

    var bookedslot_sort = data.booking_sort;

    delete data['booking_sort']; // we dont want booking_slot key to check with the collection so we delete

    console.log("after delete data", data);


    BookSlots.find(data)
        .populate('userId', { first_name: 1, last_name: 1 })
        .populate('doctorId', { name: 1 })
        .sort({ "bookedSlotsTime": bookedslot_sort })
        .exec(callback)
}

function getAllEmployeeBooking(data, callback) {
    console.log("data", data);

    var bookedslot_sort = data.booking_sort;

    delete data['booking_sort']; // we dont want booking_slot key to check with the collection so we delete

    console.log("after delete data", data);

    EmployeeBookSlots.find(data)
        .populate('employeeId', { first_name: 1, last_name: 1 })
        .populate('doctorId', { name: 1 })
        .sort({ "bookedSlotsTime": bookedslot_sort })
        .exec(callback)
}

function getBookingById(query, callback) {
    BookSlots.find(query)
        .populate('userId', { first_name: 1, last_name: 1 })
        .populate('doctorId', { name: 1 })
        .exec(callback)
}

function getEmployeeBookingById(query, callback) {
    EmployeeBookSlots.find(query)
        .populate('employeeId', { first_name: 1, last_name: 1 })
        .populate('doctorId', { name: 1 })
        .exec(callback)
}


function blockUser(data, callback) {
    if (data) {
        userModel.findOneAndUpdate(data, { blocked: true }, { new: true }, callback).select("-password -role -iniReg")
    }
}

function unblockuser(data, callback) {
    if (data) {
        userModel.findOneAndUpdate(data, { blocked: false }, { new: true }, callback).select("-password -role -iniReg")
    }
}

function blockDoctor(data, callback) {
    if (data) {
        doctorModel.findOneAndUpdate(data, { blocked: true }, { new: true }, callback).select("-password")
    }
}

function unblockDoctor(data, callback) {
    if (data) {
        doctorModel.findOneAndUpdate(data, { blocked: false }, { new: true }, callback).select("-password")
    }
}

function editDoctor(data, callback) {
    console.log(data)
    if (data) {
        doctorModel.findOneAndUpdate(data._id, {
            specialization: data.specialization, languages: data.languages, blocked: data.blocked,
            name: data.name, emailId: data.emailId, mobileNo: data.mobileNo, qualification: [{ Educational_Qualification: data.qualification[0].Educational_Qualification, University_Institution: data.qualification[0].University_Institution, Completion_Year: data.qualification[0].Completion_Year }],
            consultation_fee: data.consultation_fee, council: [{ MCI_council: data.council[0].MCI_council, MCI_Number: data.council[0].MCI_Number, MCI_Registration: data.council[0].MCI_Registration }], description: data.description
        }, { new: true }, callback)
    }
}

function editUser(data, callback) {
    console.log(data)
    if (data) {
        userModel.findOneAndUpdate(data._id, {
            emailId: data.emailId, mobileNo: data.mobileNo,
            first_name: data.first_name, last_name: data.last_name, dob: data.dob, gender: data.gender,
            blocked: data.blocked
        }, { new: true }, callback)
    }
}

function getAllAppointment(callback) {
    BookSlots.find({ status: { $exists: true } })
        .populate("doctorId")
        .populate("userId")
        .exec(callback)
}

function getCompanyAppointments(data, callback) {
    let query = {}
    //   "employeeId.companyId": data.companyId 
    EmployeeBookSlots.find({})
        .populate("employeeId")
        .populate("doctorId")
        .exec(callback)
}

function getAllPayment(callback) {
    BookSlots.find({ booking_status: "paid" })
        .populate("userId")
        .exec(callback)
}

const login = (query, callback) => {
    console.log('Admin Data');
    console.log(query);
    adminModel.findOne({ emailId: query.emailId }, (err, res) => {
        console.log(res)
        if (err) {
            console.log("Admin Model Error", err);
            callback(err, null);
        } else if (res) {
            console.log("Admin Model Result", res);
            callback(null, res);
        } else {
            callback(null, "Invalid email");
        }
    });
}

const findUserEmailPhone = (query, callback) => {
    console.log('Admin Data');
    console.log(query);
    adminModel.findOne({ emailId: query.emailId })
        .exec(callback)
}

const findUserAndUpdate = (query, data, callback) => {
    console.log('==========148==========');
    console.log(data);
    console.log('---------------150--------------------');
    console.log(query);
    adminModel.findOneAndUpdate(query, data, { new: true, select: '-password' }, callback)
}

const addDoctorId = (data, callback) => 
{
    userProfileModel.findByIdAndUpdate(data.userId, { doctorId: data.doctorId }, 
    { new : true }, callback);
}

const generateCoupon = (data, callback) => {
    CouponModel.create(data, callback)
}

const getAllCoupon = (data, callback) => {
    CouponModel.find(data, callback)
}

const updateCoupon = (query, data, callback) => {
    CouponModel.findOneAndUpdate(query, data, { new: true }, callback)
}

const deleteCoupon = (query, callback) => {
    CouponModel.deleteOne(query, callback)
}

function getIncomingAccounts(callback) {
    BookSlots.find({ status: { $exists: true } }, { payment_transaction_id: 1, booking_status: 1, createdAt: 1, "order.amount": 1 })
        .populate("userId", { first_name: 1, last_name: 1, emailId: 1, mobileNo: 1 })
        .exec(callback)
}

function getOutingAccounts(callback) {

    BookSlots.find({ status: "appointment closed" }, { payment_transaction_id: 1, booking_status: 1, createdAt: 1, "order.amount": 1, payout_status: 1 })
        .populate("doctorId", { name: 1, emailId: 1, mobileNo: 1 })
        .exec(callback)

    // doctorModel.aggregate(
    //     [
    //        {
    //          $lookup:
    //            {
    //              from: "bookedslots",
    //              localField: "_id",
    //              foreignField: "doctorId",
    //              as: "booking_details"
    //            }
    //        },
    //        {$project: {_id: 1, name: 1, emailId: 1, mobileNo: 1, account_number: 1, bank: 1, branch: 1, ifsc_code: 1, 
    //         booking_details: {
    //           $filter: {
    //             input: "$booking_details",
    //             as: "item",
    //             cond: {
    //               $and: [
    //                 {$eq: ["$$item.status", "appointment closed"]},
    //                 {$eq: ["$$item.booking_status", "paid"]},
    //                 {$eq: ["$$item.payout_status", "paid"]}
    //               ]
    //             }
    //           }
    //         } 
    //       }}
    //     ]
    //    ).exec(callback)
}

function getAllDoctorCalender(callback) {
    console.log("inside admin model")
    //doctorModel.find({}, "-password",callback)
    doctorModel.aggregate(
        [
            { $match: { blocked: false } },
            {
                $lookup:
                {
                    from: "timeslots",
                    localField: "_id",
                    foreignField: "doctorId",
                    as: "calender"
                }
            },
            { $project: { name: 1, "calender.slot_timestamp": 1 } }
        ]
    ).exec(callback)
}

function getAllCorporateCalender(callback) {
    console.log("inside admin model")
    //doctorModel.find({}, "-password",callback)
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

function changeBookingStatus(query, data, callback) {
    BookSlots.findOneAndUpdate(query, data, { new: true }, callback)
}

function changeEmployeeBookingStatus(query, data, callback) {
    EmployeeBookSlots.findOneAndUpdate(query, data, { new: true }, callback)
}

function updateAllAppointments(query, callback) {
    BookSlots.updateMany(query, { $set: { payout_status: "unpaid" } }, callback)
}

function updateAllAppointmentsById(query, callback) {
    BookSlots.update(query, { $set: { payout_status: "paid" } }, { multi: true }, callback)
}




module.exports = {
    findUser,
    addNewAdmin,
    getAllDoctors,
    downloadAllDoctors,
    findUserEmailPhone,
    findUserAndUpdate,
    getAllUsers,
    blockUser,
    unblockuser,
    blockDoctor,
    unblockDoctor,
    editDoctor,
    editUser,
    getAllAppointment,
    getAllPayment,
    login,
    getDoctorsById,
    updateDoctorsProfile,
    getUsersById,
    updateUsersProfile,
    getUsersAppointmet,
    getDoctorsAppointment,
    getDoctorsAppointment_employee,
    getAllBooking,
    getBookingById,
    generateCoupon,
    getAllCoupon,
    updateCoupon,
    deleteCoupon,
    getIncomingAccounts,
    getAllDoctorCalender,
    changeBookingStatus,
    updateAllAppointments,
    updateAllAppointmentsById,
    getOutingAccounts,
    getAllCorporateCalender,
    getAllEmployeeBooking,
    getEmployeeBookingById,
    changeEmployeeBookingStatus,
    getEmployeeById,
    getCompanyAppointments,
    addDoctorId
}