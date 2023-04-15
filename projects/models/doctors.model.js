const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const doctorSchema = new Schema(
    {
        emailId: {
            type: String,
            unique: true,
            required: [true, ["Email Id Is Required"]],
            validate: {
                validator: function (email) {
                    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    return re.test(email);
                },
                message: "Not a valid email id"
            }
        },
        password: {
            type: String,
            minlength: 6
        },
        mobileNo: {
            type: Number,
            unique: true,
            trim: true,
            sparse: true,
            required: [true, ["mobileNo Is Required"]],
        },
        name: {
            type: String
        },
        qualification: [
                {
                    Educational_Qualification: {type:String},
                    University_Institution: {type:String},
                    Completion_Year: {type:Number}
                } 
            ],
        council: [
                {
                    MCI_council : {type:String},
                    MCI_Number: {type:String},
                    MCI_Registration: {type:Number}
                } 
            ],
        consultation_fee: {
            type: Number
        },
        profession: {
            type: String
        },
        city: {
            type: String
        },
        bank: {
            type: String
        },
        branch: {
            type: String
        },
        account_number: {
            type: String
        },
        ifsc_code: {
            type: String
        },
        specialization: {
            type: []
        },
        languages: {
            type: []
        },
        profile_image: {
            type: String
        },
        description: {
            type: String
        },
        availability: {
            type: Date
        },
        corperate_doctor: {
            type: Boolean
        },
        corperate_appointments: {
            type: Number
        },
        blocked: { type: Boolean, default: false },
        password_created: {type:Boolean, default: false},
        hidden: {type: Boolean, default: true}
    },
    { timestamps: true }
);


const Doctor = mongoose.model('doctors', doctorSchema);

module.exports = {
    doctorModel: Doctor,
    doctorSchema: doctorSchema
}