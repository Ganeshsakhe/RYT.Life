const mongoose = require('mongoose');
const UserModelHelper = require("../projects/model_helpers/user_model.helper");
const bcrypt = require('bcryptjs');
const validators = require("../../helpers/validators");
const Users = require('../projects/models/users.model.js').UserModel;
const tokens = require('../projects/models/users.model').TokenModel
// const ProfileDetailsModel = require('../projects/models/ProfileDetails').ProfileDetailsModel;
const jwt=require('jsonwebtoken')
const addUser = (user, callback) => 
{
    console.log("ADD USER MODEL")
    console.log(user);
    Users.create(user, (err, res) => {
        console.log("USER MODEL RESPONSE");
        console.log(res);
        console.log("THE USER MODEL ERR:",err);
        if (err) {
            console.log("User Model Error: ", err)
            callback(err, null);
        } else if (res) {
            console.log("inside else if", res);
            let resp = JSON.parse(JSON.stringify(res));
            console.log('resp',resp);
            if (delete resp.password) {
                console.log("User Model Result:", resp);
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
    console.log('userModel Data');
    console.log(query);
    UserModelHelper.find({ query }, (err, res) => {
        if (err) {
            console.log("User Model Error", err);
            callback(err, null);
        } else if (res.length > 0) {
            console.log("User Model Result", res);
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
            console.log("User Model Error:", err);
            callback(err, null);
        } else if (res.length > 0) {
            console.log("User Model Result:", res);
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
            console.log("User Model Error:", err);
            callback(err, null);
        } else if (res.length > 0) {
            console.log("User Model Result:", res);
            callback(null, res);
        } else {
            console.log("User Model Result:11", res);

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
            console.log("User Model Error:", err);
            callback(err, null);
        } else if (res) {
            //console.log("======res======");
            console.log("User Model Result:", res);
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

const createProfile = (userDetails, profileDetails) => {
    return new Promise((resolve, reject) => {

      Users.update({_id: userDetails._id}, profileDetails, { new: true }).then(
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
        if(doc.length !=0){
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

// Define the schema for a journal
const journalSchema = new mongoose.Schema({
  data: { type: String, required: true },
  createdTime: { type: Date, required: true },
  updatedTime: { type: Date, required: true },
  title: { type: String, required: true },
  isObserved: { type: Boolean, required: true },
  observeTime: { type: Date },
  issues: { type: String, required: true },
  isBookmarked: { type: Boolean, required: true },
});

// Define the schema for a user

const userSchema = new mongoose.Schema({
  // other user fields...
  journals: [journalSchema], // a list of journal objects
});
// Create a model for the user collection

const User = mongoose.model('User', userSchema);
module.exports = {
    addUser,
    login,
    findUserAndUpdate,
    findUser,
    createProfile,
    getProfileDetailsById,
    updateProfileDetails,
    findUserEmailPhone,
    logout,
    checktoken,
    User
    // update
};