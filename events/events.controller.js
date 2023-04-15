const eventModel = require('./events.model');
const eventModelHelper = require("../projects/model_helpers/events_model.helpers");



function eventCreate(data, callback) {
    console.log("inside createeventController", data)
    eventModel.createEvent(data, (err, res) => {
        if (err) {
            callback(err, null);
        } else if (res) {
            callback(null, res);
        } else {
            callback(null, null);
        }
    });
}

function eventGetList(data, callback) {
    console.log("inside get EventList", data)
    eventModelHelper.getEvent(data, (err, res) => {
        if(err){
            callback(err, null);
        }else if(res){
            callback(null, res);
        }else{
            callback(null, null);
        }
    })
}



module.exports = {
    eventCreate,
    eventGetList
}