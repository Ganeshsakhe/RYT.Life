const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.set('debug', true)

const eventsSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        event_name: {
            type: String
        }
    },
    { timestamps: true }
);

const Events = mongoose.model('events', eventsSchema);

module.exports = {
    eventsModel: Events,
    eventsSchema: eventsSchema
}