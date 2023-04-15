
const events = require('../projects/models/events.model').eventsModel



function createEvent(data, callback) {
    if(data) {
      console.log("ID__________________________________________", data._id);
      console.log("data________________________________________",data)
      events.create(data, (err, res) => {
        if (err) {
          console.log("error while registering event:", err);
          callback(err, null);
        } else if (res) {
          console.log("events registered successfully:", res);
          events.find(data)
              .populate("userId", { first_name: 1, last_name: 1, emailId: 1 })
              .exec(callback)
          // console.log("result", res)
          // callback(null, res);
        } else {
          callback(null, null);
        }
      })
    }
  }

  module.exports = {
    createEvent
  }