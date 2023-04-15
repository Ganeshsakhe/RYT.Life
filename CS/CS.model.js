const mongoose = require('mongoose');
const UserModelHelper = require("../projects/model_helpers/CS_model.helper");
const bcrypt = require('bcryptjs');
const validators = require("../../helpers/validators");
const CSs = require('../projects/models/CSs.model.js').CSModel;
const tokens = require('../projects/models/CSs.model').TokenModel
// const ProfileDetailsModel = require('../projects/models/ProfileDetails').ProfileDetailsModel;
const jwt=require('jsonwebtoken')
const addUser = (CS, callback) => 
{
    console.log("ADD CS MODEL")
    console.log(CS);
    CSs.create(CS, (err, res) => {
        console.log("CS MODEL RESPONSE");
        console.log(res);
        console.log("THE CS MODEL ERR:",err);
        if (err) {
            console.log("CS Model Error: ", err)
            callback(err, null);
        } else if (res) {
            console.log("inside else if", res);
            let resp = JSON.parse(JSON.stringify(res));
            console.log('resp',resp);
            if (delete resp.password) {
                console.log("CS Model Result:", resp);
                callback(null, resp);
            } else {
                callback(null, null);
            }
        } else {
            callback(null, null);
        }
    });
}

const login = (query, callback) => {
    console.log('csModel Data');
    console.log(query);
    UserModelHelper.find({ query }, (err, res) => {
        if (err) {
            console.log("CS Model Error", err);
            callback(err, null);
        } else if (res.length > 0) {
            console.log("CS Model Result", res);
            callback(null, res);
        } else {
            callback(null, "Invalid email/mobileNo");
        }
    });
}

const findUser = (query, callback) => {
    console.log("searching for location");
    UserModelHelper.find({ query: query }, (err, res) => {
        if (err) {
            console.log("CS Model Error:", err);
            callback(err, null);
        } else if (res.length > 0) {
            console.log("CS Model Result:", res);
            callback(null, res);
        } else {
            callback(null, null);
        }
    });
}

const findUserEmailPhone = (body, callback) => {
    console.log("inside findUserEmailPhone model", body);
    
    UserModelHelper.findEmailPhone(body, (err, res) => {
        if (err) {
            console.log("CS Model Error:", err);
            callback(err, null);
        } else if (res.length > 0) {
            console.log("CS Model Result:", res);
            callback(null, res);
        } else {
            console.log("CS Model Result:11", res);

            callback(null, null);
        }
    });
}

const findUserAndUpdate = (query, data, callback) => {
    console.log('==========3==========');
    console.log(data);
    console.log('-----------------------------------');
    console.log(query);
    UserModelHelper.update({ query: query, update: data, options: { new: true, select: '-password' } }, (err, res) => {
        //console.log("========5========");
        if (err) {
            // console.log("======err======");
            console.log("CS Model Error:", err);
            callback(err, null);
        } else if (res) {
            //console.log("======res======");
            console.log("CS Model Result:", res);
            callback(null, res);
        } else {
            //console.log("=====else null=====");
            callback(null, null);
        }
    });
}

// const update = (query, data, callback) => {
//     Users.findOneAndUpdate({query:query,update:data},(err, res) => {
//         if (err) {
//             console.log("User Model Error:", err);
//             callback(err, null);
//         } else if (res) {
//             console.log("User Model Result:", res);
//             callback(null, res);
//         } else {
//             callback(null, null);
//         }
//     });
// }

const createProfile = (csDetails, profileDetails) => {
    return new Promise((resolve, reject) => {

      CS.update({_id: csDetails._id}, profileDetails, { new: true }).then(
          (data) => resolve(data),
          (err) => reject(err)
      )
        // UserModelHelper.update({
        //         query: {
        //             _id: userDetails._id
        //         },
        //         update: {profileDetails: profileDetails}
        //     }, (err, data) => {
        //         if(err)
        //             reject(err);
        //         else
        //           if(data)
        //             resolve(data)
        //     }
        // )
        // ProfileDetailsModel.create(profileDetails).then(
        //   (data) => {
        //     resolve(data)
        //   },
        //   (err) => {
        //     reject(err)
        //   }
        // )
    })
};

const getProfileDetailsById = (query) => {
    return new Promise((resolve, reject) => {
      Users.findOne(query).then(
            (data) => resolve(data),
            (err) => reject(err)
        )
    })
};

const updateProfileDetails = (query, updateData) => {
    return new Promise((resolve, reject) => {
        UserModelHelper.update(query, updateData, { new: true }).then(
            (data) => {
                 resolve(data)
            },
            (err) => {
                reject(err)
            }
        )
    })
};


const appointmentSchema = new mongoose.Schema({
    clientname: {type: String, required: true },
    date: {type: String, required: true },
    time: {type: String, required: true},
});

const Appointment = mongoose.model('Appointment', appointmentSchema) ;

function logout(tok,callback){
    var decoded = jwt.decode(tok, {complete: true});
    if(decoded){
   var it = new Date(decoded.payload.exp * 1000);
   var  token = new tokens({
       value: tok,
       id: decoded.payload._id,
       expire: it.toUTCString()
   })
      token.save(function (err, book) {
    if (err) 
    { 
        console.log("err")
        callback(err,null)
    }
    if(book){
        console.log("book")
    callback(null,book)
    }
    else{
        console.log("else")
        callback(null,null)
    }
  });
}
else{
    console.log("out else")
    callback(null,null)
}
}

function checktoken(token ,_id,callback){
    console.log("ID****************", _id);
    tokens.find({id:_id},(err,doc)=>{
        if(err){
            callback(err,null)
        }
        console.log(doc.length)
        if(doc.length !=0)
        {
            let iterate =0;
            doc.forEach((e)=>{
            iterate++
            if(e.value == token){
                callback(null,null)
            }
            if((iterate == doc.length) &&(e.value != token)){
                callback(null,"valid")
            }
            })
        }
        else{
            console.log("dndn")
            callback(null,"valid")
        }       
    })
}

module.exports = Appointment;