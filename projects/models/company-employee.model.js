const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EmployeeSchema = new Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'company'
        },
        first_name: {
            type: String,
        },
        last_name: {
            type: String,
        },
        profile_image: {
            type: String
        },
        mobileNo: {
            type: String
        },
        emailId: {
            type: String,
            index: {
              unique: true,
              partialFilterExpression: { emailId: { $type: 'string' } },
            },
            default : null
        },

        dob: {
            type: String,
        },

        gender: {
            type: String,
        },
        location: {
            type: String,
        },
        relationship_status: {
            type: String,
        },
        occupation: {
            type: String
        },

        appointments_count: {
            type: Number,
        },
        blocked:{
            type:Boolean,
            default:false
        }

    },
    { timestamps: true }
);

const Employee = mongoose.model("employees", EmployeeSchema); 
module.exports = {
    EmployeeModel: Employee,
    EmployeeSchema: EmployeeSchema
};
