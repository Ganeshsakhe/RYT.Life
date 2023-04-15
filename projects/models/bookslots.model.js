const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set('debug', true)

const bookingSlotsSchema = new Schema(
    {
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'doctors'
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        payment_transaction_id: {
            type: String
        },
        order: {
            type: {}
        },
        payment: {
            type: {
                fee: "",
                currency: ""
            }
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
        user_login_time: {
            type: Date
        },
        user_logout_time: {
            type: Date
        },
        doctor_login_time: {
            type: Date
        },
        doctor_logout_time: {
            type: Date
        },
        coupon_name: {
            type: String
        },
        payout_status: {
            type: String, default: "unpaid"
        }
    },
    { timestamps: true }
);

const BookSlots = mongoose.model('bookedslots', bookingSlotsSchema);

module.exports = {
    bookingSlotsModel: BookSlots,
    bookingSlotsSchema: bookingSlotsSchema
}