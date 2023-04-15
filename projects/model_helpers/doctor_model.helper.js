const Model = require('../models/doctors.model').doctorModel;

function findAll(options = {}, callback) {
    console.log("inside findall")
    console.log(options);
    console.log(options.name)
    let query = {}
    query["$or"] = [];
    if(options.search) {
        console.log("inside name")
        query["$or"].push({"name": options.search})
        query["$or"].push({"languages": options.search})
        query["$or"].push({"specialization": options.search})
    } 
    let data = {}
    if (options.sort === "price low to high") {
        data["consultation_fee"] = 1;
    } else if(options.sort === "price high to low") {
        data["consultation_fee"] = -1;
    } else if(options.sort === "earliest availabality") {
        data["availability"] = 1;
    }
    console.log('query',query);
    console.log('data', data);
    if (!options.search) {
        Model.find({blocked: false, hidden: false})
            .sort(data)
            .exec(callback);
    } else {
        console.log("inside else doctormodel");
        Model.find(
            {$and:[query,{blocked: false, hidden: false}]}
        )
             .sort(data)
            .exec(callback)
    }
}

function find(options, callback) {
    console.log('inside find doctormodelhelper');
    console.log(options);
    if (options.byId) {
        console.log('inside if')
        // options.query._id = id;
        Model.findById(options._id, options.select || {})
            .populate(options.populateQuery || '')
            .exec(callback)
    } else {
        console.log('inside else');
        Model.find(options.query || {}, options.select || {})
            .exec(callback)
    }
}

function findEmailPhone(options = {}, callback) {
    console.log("inside findEmailPhone modelhelper");
    console.log(options);
    Model.find(options)
            .exec(callback);
}

function  update(options, callback) {
    console.log("======4======");
    console.log(options);
    if (options.update) {
        console.log("update")
        console.log(options.query.id);
        if (options.query.id) {
            console.log("======if optionbyId======");
            Model.findByIdAndUpdate(options.query.id, options.update, options.options, callback);
        } else {
            console.log("========else option by id========");
            Model.findOneAndUpdate(options.query, options.update, options.options, callback);
            console.log(callback);
        }
    } else {
        //console.log("=========else=======");
        callback(null, null);
    }
}

module.exports = {
    findAll,
    find,
    findEmailPhone,
    update
}