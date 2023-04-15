const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set('debug', true)

const couponSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        eligibility: {
            type: String
        },
        start_date: {
            type: Date
        },
        end_date: {
            type: Date
        },
        discount_type: {
            type: String
        },
        discount_value: {
            type: Number
        },
        coupon_limit: {
            type: Number
        },
        user_limit: {
            type: Number
        },
        min_cart_value: {
            type: Number
        },
        max_cart_value: {
            type: Number
        },
        max_discount: {
            type: Number
        },
        coupon_name: {
            type: String,
            unique: true,
            required: true
        }, 
        terms_condition: {
            type: String
        },
        description: {
            type: String
        },
        active: {
            type: Boolean,
            default: true
        },
        is_visible: {
            type: Boolean,
            default: true
        }

    },
    { timestamps: true }
);

const Coupon = mongoose.model('coupon', couponSchema);

module.exports = {
    couponModel: Coupon,
    couponSchema: couponSchema
}