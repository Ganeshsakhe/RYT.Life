const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set('debug', true)

const interestedWithSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'doctors'
        }
    },
    { timestamps: true }
);

const interest = mongoose.model('interestedWith', interestedWithSchema);

module.exports = {
    interestedWithModel: interest,
    interestedWithSchema: interestedWithSchema
}