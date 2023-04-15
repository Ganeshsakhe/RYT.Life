const bcrypt = require('bcryptjs');
const CompanyModel = require("../company/company.model");
const validators = require("../../helpers/validators");
const EmailTemplate = require("../projects/model_helpers/email_template");
const companyModel = require('../projects/models/company.model');


function addCompany(data, callback) {
    console.log(data);
    data["remaining_sessions"] = data["company_session_limit"];
    CompanyModel.addCompany(data, (err, res) => {
        if (err) {
            callback(null, null);
        } else if (res) {
            console.log(res);
            callback(null, res);
        } else {
            callback(null, null);
        }
    })
}

function getAllCompanies(callback) {
    CompanyModel.getAllCompanies((err, res) => {
        if (err) {
            callback(null, null);
        } else if (res) {
            callback(null, res);
        } else {
            callback(null, null);
        }
    })
}

function updateCompany(query, data, callback) {
    CompanyModel.findCompanyAndUpdate(query, data, (err, docs) => {
        if (err) {
            callback(null, null);
        } else if (docs) {
            callback(null, docs);
        } else {
            callback(null, null);
        }
    })
}

function getCompanyById(query, callback) {
    CompanyModel.getCompaniesById(query, (err, res) => {
        if (err) {
            callback(null, null);
        } else if (res) {
            callback(null, res);
        } else {
            callback(null, null);
        }
    });
}


 



module.exports = {
    addCompany,
    getAllCompanies,
    updateCompany,
    getCompanyById
}