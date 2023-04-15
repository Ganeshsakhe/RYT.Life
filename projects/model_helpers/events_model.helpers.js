const Model = require('../models/events.model').eventsModel;


function getEvent(options = {}, callback) {

    console.log("inside event model helper", options)
    if(options.userId) {
        Model.find(options)
             .exec(callback)
    }
}


module.exports = {
    getEvent
}