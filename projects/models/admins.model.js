const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const adminSchema = new Schema(
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
        }
    },
    { timestamps: true }
);


const Admin = mongoose.model('admin', adminSchema);

module.exports = {
    adminModel: Admin,
    adminSchema: adminSchema
}