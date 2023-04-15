const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timeSlotsSchema = new Schema(
    {
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'doctors'
        },
        fromDate: {
            type: Date
        },
        toDate: {
            type: Date
        },
        slots: {
            type:
                {
                    Monday: {
                        type: [
                            {
                                from: "",
                                to: ""
                            }
                        ]
                    },
                    Tuesday: {
                        type: [
                            {
                                from: "",
                                to: ""
                            }
                        ]
                    },
                    Wednesday: {
                        type: [
                            {
                                from: "",
                                to: ""
                            }
                        ]
                    },
                    Thursday: {
                        type: [
                            {
                                from: "",
                                to: ""
                            }
                        ]
                    },
                    Friday: {
                        type: [
                            {
                                from: "",
                                to: ""
                            }
                        ]
                    },
                    Saturday: {
                        type: [
                            {
                                from: "",
                                to: ""
                            }
                        ]
                    },
                    Sunday: {
                        type: [
                            {
                                from: "",
                                to: ""
                            }
                        ]
                    }
                }
        },
        slot_timestamp: {
            type: [
                {
                    date: Date
                }
            ]
        }

    },
    { timestamps: true }
);

// const timeSlotsSchema = new Schema(
//     {
//         doctorId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'doctors'
//         },
//         fromDate: {
//             type: Date
//         },
//         toDate: {
//             type: Date
//         },
//         slots: {
//             type:
//                 {
//                     Monday: {
//                         type: [
//                             {
//                                 from: "",
//                                 to: ""
//                             }
//                         ]
//                     },
//                     Tuesday: {
//                         type: [
//                             {
//                                 from: "",
//                                 to: ""
//                             }
//                         ]
//                     },
//                     Wednesday: {
//                         type: [
//                             {
//                                 from: "",
//                                 to: ""
//                             }
//                         ]
//                     },
//                     Thursday: {
//                         type: [
//                             {
//                                 from: "",
//                                 to: ""
//                             }
//                         ]
//                     },
//                     Friday: {
//                         type: [
//                             {
//                                 from: "",
//                                 to: ""
//                             }
//                         ]
//                     },
//                     Saturday: {
//                         type: [
//                             {
//                                 from: "",
//                                 to: ""
//                             }
//                         ]
//                     },
//                     Sunday: {
//                         type: [
//                             {
//                                 from: "",
//                                 to: ""
//                             }
//                         ]
//                     }
//                 }
//         },
//         cancelSlots: [
//             {
//                 date: {type:String},
//                 day: {type:String},
//                 slots: [{from:{type:String},to:{type:String}}]
//             } 
//         ]
//     },
//     { timestamps: true }
// );

const TimeSlots = mongoose.model('timeslots', timeSlotsSchema);

module.exports = {
    timeSlotsModel: TimeSlots,
    timeSlotsSchema: timeSlotsSchema
}