const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("../../../helpers/validators");
const CSSchema = new Schema(
{
        iniReg: {
            type: String,
            enum: ["Native","Google","Facebook"]
        },
        gid: {
            type: String,
        },
        fid: {
            type: String,
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
            type: String,
            index: {
              unique: true,
              partialFilterExpression: { mobileNo: { $type: 'string' } },
            },
            default : null
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
        role: {
            type: String,
            enum: ['User', 'Doctor', 'Patient'],
        },
        password: {
            type: String,
            minlength: 4
        },
        blocked:{
            type:Boolean,
            default:false
        }

},
    { timestamps: true }
);
const tokenSchema = new Schema(
    {
        value:
        {type:String,unique:true},
        expire:
        {type:Date,default:Date.now,index:{expires: 604800 * 4}},
        id:
        {
            type:Schema.Types.ObjectId
        }
    }
)
const CS = mongoose.model("users", CSSchema); 
const Token = mongoose.model("tokens",tokenSchema)
module.exports = {
    UserModel: CS,
    UserSchema: CSSchema,
    TokenModel: Token
};