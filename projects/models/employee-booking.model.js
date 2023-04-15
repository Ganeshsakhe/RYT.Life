const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set('debug', true)

const employeeBookingSlotsSchema = new Schema(
    {
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'doctors'
        },
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'employees'
        },
        bookedslots: {
            type: {
                date: "",
                day: "",
                slots: []
            },
        },
        bookedSlotsTime: {
            type: Date
        },
        previous_bookedSlotsTime: {
            type: Date
        },
        booking_status: {
            type: String
        },
        video_call_id: {
            type: String
        },
        video_call_url: {
            type: String
        },
        status: {
            type: String
        },
        rescheduled: {
            type: Boolean
        },
        rescheduled_count: {
            type: Number,
            default: 0
        },
        feedback: {
            type: String
        },
        anonymous: {
            type: Boolean
        },
        rating: {
            type: Number
        },
        comments: {
            type: String
        },
        doctor_notes: {
            type: String
        },
        doctor_rating: {
            type: Number
        },
        doctor_comments: {
            type: String
        },
        session_notes: {
            type: String
        },
        employee_login_time: {
            type: Date
        },
        employee_logout_time: {
            type: Date
        },
        doctor_login_time: {
            type: Date
        },
        doctor_logout_time: {
            type: Date
        }
    },
    { timestamps: true }
);

const employeeBookSlots = mongoose.model('employeeBookedslots', employeeBookingSlotsSchema);

module.exports = {
    employeeBookingSlotsModel: employeeBookSlots,
    employeeBookingSlotsSchema: employeeBookingSlotsSchema
}