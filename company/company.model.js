const Company = require('../projects/models/company.model').CompanyModel;
const UserModelHelper = require('../projects/model_helpers/user_model.helper');
const doctorModel = require('../projects/models/doctors.model').doctorModel;
const BookSlots = require('../projects/models/employee-booking.model').employeeBookingSlotsModel;

const addCompany = (company, callback) => {
    console.log("ADD Company MODEL ")
    console.log(company);
    Company.create(company, (err, res) => {
        console.log("COMPANY MODEL RESPONSE");
        console.log(res);
        console.log("THE COMPANY MODEL ERR:",err);
        if (err) {
            console.log("Company Model Error: ", err)
            callback(err, null);
        } else if (res) {
            console.log("inside else if", res);
            let resp = JSON.parse(JSON.stringify(res));
            console.log('resp',resp);
            // if (delete resp.password) {
            //     console.log("User Model Result:", resp);
            //     callback(null, resp);
            // } else {
            //     callback(null, null);
            // }
            callback(null, resp);
        } else {
            callback(null, null);
        }
    });
}

function getAllCompanies(callback){
    Company.find((err, res) => {
        if (err) {
          console.log("Companies Model Error:", err);
          callback(err, null);
        } else if (res.length>0) {
          console.log("Comapnies profile Result:", { profile: res});
          callback(null, { profile: res});
        } else {
          callback(null, null);
        }
      });
}


const findCompanyAndUpdate = (query, data, callback) => {
  console.log('==========3==========');
  console.log(data);
  console.log('-----------------------------------');
  console.log(query);
  UserModelHelper.companyUpdate({ query: query, update: data, options: { new: true } }, (err, res) => {
      //console.log("========5========");
      if (err) {
          // console.log("======err======");
          console.log("Doctor Model Error:", err);
          callback(err, null);
      } else if (res) {
          //console.log("======res======");
          console.log("Doctor Model Result:", res);
          callback(null, res);
      } else {
          //console.log("=====else null=====");
          callback(null, null);
      }
  });
}

const getCompaniesById = (query, callback) => {
  console.log("////",query)
  Company.find(query,(err, res) => {
    if (err) {
      callback(err, null);
    } else if (res.length>0) {
      console.log("CompaniesById profile Result:", { profile: res});
      callback(null, { profile: res});
    } else {
      callback(null, null);
    }
  })
}




module.exports = {
    addCompany,
    getAllCompanies,
    findCompanyAndUpdate,
    getCompaniesById
}