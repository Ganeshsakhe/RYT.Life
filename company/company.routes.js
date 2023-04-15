const express = require('express');
const router = express.Router();
const resp = require("../../helpers/responseHelpers");
const misc = require('../../helpers/misc');
module.exports = router;
var excelToJson = require('convert-excel-to-json');

var fs = require('fs'),
    http = require('http'),
    https = require('https');

var Stream = require('stream').Transform;

const companyCtrl = require("./company.controller");
const doctorController = require("../doctor/doctor.controller");
const appointmentController = require("../appointment/appointment.controller");

router.get("/allCompanies", (req, res) => {             
    companyCtrl.getAllCompanies((err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While getting doctor');
        } else if (docs) {
            console.log(docs)
            resp.successGetResponse(res, docs, 'All Companies');
        }
        else {
            resp.noRecordsFound(res, 'Unable to get all doctors');
        }
    })
})

// for download excel sheet from the firebasestorage url
var downloadurl = (url, filename, callback) => {

    var client = http;
    if (url.toString().indexOf("https") === 0) {
        client = https;
    }
    client.request(url, function (response) {
        var data = new Stream();

        response.on('data', function (chunk) {
            data.push(chunk);
        });

        response.on('end', function () {
            fs.writeFileSync(filename, data.read());
            if (fs.existsSync(filename)) {
                // console.log("yaa data is there");
                const excelData = excelToJson({
                    sourceFile: filename,
                    sheets: [{
                        // Excel Sheet Name
                        name: 'Sheet1',

                        // Header Row -> be skipped and will not be present at our result object.
                        header: {
                            rows: 1
                        },

                        // Mapping columns to keys
                        columnToKey: {
                            A: 'email',
                        }
                    }]
                });
                callback(excelData);
            } else {
                console.log("file not present");
            }
        });
    }

    ).end();
};

router.put("/updateComp", (req, res) => {
    const dataToBeUpdated = req.body;
    const query = {};
    query["id"] = req.body.id;
    if (dataToBeUpdated.hasOwnProperty('personalEmails_sheet')) {
        var today = Date.now();
        var myFileName = "rytlife" + today + ".xlsx";
  
        // downloadurl(req.body.personalEmails, myFileName);
        downloadurl(req.body.personalEmails_sheet, myFileName, function (data) {
            dataToBeUpdated.personalEmails = data.Sheet1;

            console.log("data",data);
            companyCtrl.updateCompany(query, dataToBeUpdated, (err, docs) => {
                if (err) {
                    resp.errorResponse(res, err, 501, 'Error While getting doctor');
                } else if (docs) {
                    // deleted the excel sheet file from the root folder if it was success
                    fs.unlinkSync(myFileName);
                    resp.successGetResponse(res, docs, 'All Companies');
                }
                else {
                    resp.noRecordsFound(res, 'Unable to get update Company');
                }
            })
        });

    } else {
        companyCtrl.updateCompany(query, dataToBeUpdated, (err, docs) => {
            if (err) {
                resp.errorResponse(res, err, 501, 'Error While getting doctor');
            } else if (docs) {
                console.log(docs)
                resp.successGetResponse(res, docs, 'All Companies');
            }
            else {
                resp.noRecordsFound(res, 'Unable to get update Company');
            }
        })
    }
})


router.post("/createCompany", (req, res) => {
    let domain = req.body['company_domain'].split('.');
    const dataToBeInserted = req.body;
    if (req.body && domain[0] !== '@gmail' && domain[0] !== '@outlook' && domain[0] !== '@yahoo') {
        if (dataToBeInserted.hasOwnProperty('personalEmails_sheet')) {
            var today = Date.now();
            var myFileName = "rytlife" + today + ".xlsx";
            // downloadurl(req.body.personalEmails, 'rytlife.xlsx');
            downloadurl(req.body.personalEmails_sheet, myFileName, function (data) {
                dataToBeInserted.personalEmails = data.Sheet1;

                companyCtrl.addCompany(dataToBeInserted, (err, docs) => {
                    if (err) {
                        resp.errorResponse(res, err, 501, 'Error While getting Registering Company');
                        // console.log(err);
                    } else if (docs) {
                        // deleted the excel sheet file from the root folder if it was success
                        fs.unlinkSync(myFileName);
                        resp.successPostResponse(res, docs, "Successfully Company Registered");
                    }
                })
            });
        } else {
            companyCtrl.addCompany(dataToBeInserted, (err, docs) => {
                if (err) {
                    resp.errorResponse(res, err, 501, 'Error While getting Registering Company');
                } else if (docs) {
                    resp.successPostResponse(res, docs, "Successfully Company Registered");
                }
            })
        }
    } else {
        resp.errorResponse(res, "Please Check the domain you entered", 501, 'Invalid Domain');
    }
})

router.get('/getCompanyById', (req, res) => {
    let query = {};
    query['_id'] = req.query.companyId;
    companyCtrl.getCompanyById(query, (err, docs) => {
        if (err) {
            resp.errorResponse(res, err, 501, 'Error While getting companyById');
        } else if (docs) {
            console.log(docs)
            resp.successGetResponse(res, docs, 'Company Details');
        }
        else {
            resp.noRecordsFound(res, 'Unable to get companyById');
        }
    })
})


module.exports = router;