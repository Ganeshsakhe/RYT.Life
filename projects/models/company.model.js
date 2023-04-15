const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CompanySchema = new Schema(
    {
        company_name: {
            type: String,
        },
        contact_person: {
            type: String,
        },
        company_logo: {
            type: String
        },
        mobileNo: {
            type: String,
            index: {
                unique: true,
                partialFilterExpression: { mobileNo: { $type: 'string' } },
            },
            default: null
        },

        emailId: {
            type: String,
            index: {
                unique: true,
                partialFilterExpression: { emailId: { $type: 'string' } },
            },
            default: null
        },

        company_domain: {
            type: String,
            index: {
                unique: true,
                partialFilterExpression: { company_domain: { $type: 'string' } },
            },
            default: null
        },
        company_session_limit: {
            type: Number,
        },

        personalEmails: {
            type: []
        },

        personalEmails_sheet: {
            type: String
        },

        remaining_sessions: {
            type: Number,
        },

        company_payment_type: {
            type: String,
        },
        blocked: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Company = mongoose.model("company", CompanySchema);
module.exports = {
    CompanyModel: Company,
    CompanySchema: CompanySchema
};
