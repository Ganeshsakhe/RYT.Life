// Environment Variables
require('babel-register');
require('dotenv').config({ path:'.env' });
// require('dotenv').config({ path: '/.env' });
const Razorpay = require('razorpay');
const session = require('express-session');
const express = require('express');
var moment1 = require("moment-timezone");
let path = require('path');
// Helmet is required for securing the request response headers
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const port = process.env.PORT || 3000;
let cookieParser = require('cookie-parser');
const middleware = require('./app/config/middleware')
const bookslotsmodel = require('./app/modules/appointment/appointment.model')
const emailTemplate = require('./app/modules/projects/model_helpers/email_template')
var moment = require('moment');
const doctorModel = require("./app/modules/doctor/doctor.model")
// const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN)
const nocache = require('./app/modules/video_call/nocache');
// const generateRTEToken = require('./generate_rte_token');
// const generateRTMToken = require('./generate_rtm_token');
const generateRTCToken = require('./app/modules/video_call/generate_rtc_token');
// const CSRoutes = require('./CS.routes');
// Initializing Express
const app = express();
// var admin = require('firebase-admin');
// admin.initializautoemaileApp();
const server = require('http').Server(app);
// const io = require('socket.io')(server);



app.use(express.json())

app.use(bodyParser.urlencoded({ extended: true }));

// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
// }));
// app.use('/cs', csRoute);




app.get('/v1/rtc/:channel/:role/:tokentype/:uid', nocache, generateRTCToken);

//TODO:: test sms notification to partner on the appointment 
// app.get('/v1/abc', function (req, res) {
//   bookslotsmodel.getAllBooking({ payment_transaction_id: 'pay_L5dAA4YNWO5YHG' }, (err, docs) => {
//     if (err) {
//       console.log(err)
//     } else if (docs.length > 0) {
//       console.log("docs", docs)
//       for (const item of docs) {
//         let compare_date1 = new Date();
//         let compare_date2 = compare_date1.setMinutes(compare_date1.getMinutes() + 330);
//         console.log(compare_date2);
//         let compare_date = new Date(compare_date2);
//         console.log("compare_date", compare_date);
//         const bookedDate = item.bookedSlotsTime;
//         const bookedDate2 = item.bookedSlotsTime;
//         const bookedDate3 = item.bookedSlotsTime
//         const bookedDate4 = item.bookedSlotsTime
//         // console.log(bookedDate4);
//         console.log("booked", bookedDate);
//         let compare_booked = bookedDate.setMinutes(bookedDate.getMinutes() + 0);
//         let compare_booked_date = new Date(compare_booked);
//         console.log("booked+0", compare_booked_date);
//         let compare_booked2 = bookedDate2.setMinutes(bookedDate2.getMinutes() + 60);
//         let compare_booked_date2 = new Date(compare_booked2);
//         console.log("booked+60", compare_booked_date2);
//         let compare_booked3 = bookedDate3.setMinutes(bookedDate3.getMinutes() + 5);
//         let compare_booked_date3 = new Date(compare_booked3);
//         console.log("booked+5.30", compare_booked_date3);
//         console.log('item::', item);
//         emailTemplate.doctorRemainderEmail(item, (err, res) => {
//           console.log('testing 123 abhi');
//           if (err) {
//             console.log(err)
//           } else if (res) {
//             console.log(res)
//             res.end(JSON.stringify('sucess'));
//           } else {
//             console.log("null")
//             res.end(JSON.stringify('faild'));

//           }
//         })
//       }
//       // }
//     } else {
//       console.log("null")
//       res.end(JSON.stringify('sucess'));

//     }
//     // res.end(JSON.stringify('sucess>>>'));
//   })
// });

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Credentials', true);
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});



//Body Parser Middleware


app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "app/views"));
app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.raw({ limit: '50mb', extended: true }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// configuration constants
let config =
{
  localConfig: {
    mongodb: {
      //stage nd dev env
      url: process.env.DB_URL

      //production env
      // url: process.env.DB_URL_LOCALHOST

      //new production env
      // url: process.env.NEW_PROD_DB_URL
    }
  }
};



//app configuration usage
let appConfig = {};
console.log('environment variables passed', process.env.deployment);
switch (process.env.deployment) {
  case 'local':
  default:
    console.log('loading local environment');
    appConfig = config.localConfig
}

//db configuration here
let mongoose = require('mongoose');
mongoose.connect(appConfig.mongodb.url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, function (err, result) {
  if (err) {
    console.log('Error while connecting to DB:', err);
  } else {
    console.log('The DB Connected');
  }
});


// Middleware is enabled to use helmet default options
app.use(helmet());

//CORS Middleware
app.use(cors());

//Logging Format
morgan.format('combined', '(:date[clf]) -> ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms');
app.use(morgan('combined'));


//Initializing Passport
app.use(passport.initialize());
app.use(passport.session());
require('./app/config/passport')(passport);

// Configuration and middlewares Ends Here
// let mailer = require('./app/mails/mailautomator/mailautomator');
const Auth = require('./app/modules/authentication/authentication.routes');
const User = require('./app/modules/user/user.routes');

//let mailer = require('./app/modules/mails/mailautomator/mailautomator');
const AuthGoogle = require('./app/modules/authentication/auth-google.user.routes');

const AuthFacebook = require('./app/modules/authentication/auth-facebook.user.routes');

const doctor = require('./app/modules/doctor/doctor.routes');
const therapist = require('./app/modules/therapist/therapist.routes');
const payment = require('./app/modules/payment/payment.routes');
const appointment = require('./app/modules/appointment/appointment.routes');
const admin = require('./app/modules/admin/admin.routes');
const company = require('./app/modules/company/company.routes');
const Employee = require('./app/modules/company_employee/employee.routes');
// Open routes
app.get('/', (req, res) => res.json({ message: 'Welcome to rytLife' }));


app.use('/v1/auth-google/oauth/usergoogle', passport.authenticate('userGoogleToken', { session: false }), AuthGoogle);

app.use('/v1/auth-facebook/oauth/userfacebook', passport.authenticate('userFacebookToken', { session: false }), AuthFacebook);

app.use('/v1/authenticate', Auth);
app.options('/v1/authenticate/login', cors(), Auth);
app.use('/v1/appointment', appointment);
//protected routes
//app.use('/v1/mailer', mailer);
app.use('/v1/payment', payment);
app.use('/v1/user/', passport.authenticate('userjwt',{ session: false }), middleware, User);
app.use('/v1/doctor', passport.authenticate('doctorjwt',{ session: false }), middleware, doctor);
app.use('/v1/therapist', passport.authenticate('therapistjwt',{ session: false }), middleware, therapist);
app.use('/v1/admin', passport.authenticate('adminjwt',{ session: false }), admin);
app.use('/v1/employee', passport.authenticate('employeejwt',{ session: false }), middleware, Employee);
app.use('/v1/company', company);
app.get("/v1", (req, res) => 
{
  res.send("Welcome!!!");
});

//routes to be configured here
// app.use('/v1/mailer',mailer);
// catch 404 and forward to error handler
app.use(function (req, res, next)
{
  console.log('error found', req.query);
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) 
{
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json(err);
});



module.exports = {
  app: app,
  server: server
};

const cron = require('node-cron');

cron.schedule('* * * * *', function () {
  console.log('running a task every minute');

  bookslotsmodel.getAllBooking({ status: 'appointment confirmed' }, (err, docs) => {
    if (err) {
      console.log(err)
    } else if (docs.length > 0) {
      console.log("docs", docs)
      // const current_date = new Date();
      // console.log("general-format",current_date);
      // console.log("current_date", moment(current_date).format("DD/MM/YYYY, h:mm:ss a")) //IST
      // var new_date = current_date.setMinutes( current_date.getMinutes() + 60 );
      // var compare_date = new Date(new_date)
      // console.log("compare_date", moment(compare_date).format("DD/MM/YYYY, h:mm:ss a"))

      // const current_date2 = new Date();
      // var logout_new_date = current_date2.setMinutes( current_date2.getMinutes() + 335 );
      // var logout_compare_date = new Date(logout_new_date)
      // console.log("logout_compare_date", moment(logout_compare_date).format("DD/MM/YYYY, h:mm:ss a"))


      // const current_date3 = new Date();
      // var remainder = current_date3.setMinutes( current_date3.getMinutes() - 120 );
      // var remainder_date = new Date(remainder)
      // console.log("remainder_date", moment(remainder_date).format("DD/MM/YYYY, h:mm:ss a"))

      // const current_date4 = new Date();
      // var tbd_new_date = current_date4.setMinutes( current_date4.getMinutes() + 20 );
      // var tbd_compare_date = new Date(tbd_new_date)
      // console.log("tbd_compare_date", moment(tbd_compare_date).format("DD/MM/YYYY, h:mm:ss a"))

      for (const item of docs) {
        let compare_date1 = new Date();
        let compare_date2 = compare_date1.setMinutes(compare_date1.getMinutes() + 330);
        console.log(compare_date2);
        let compare_date = new Date(compare_date2);

        console.log("compare_date", compare_date);


        const bookedDate = item.bookedSlotsTime;
        const bookedDate2 = item.bookedSlotsTime;
        const bookedDate3 = item.bookedSlotsTime
        const bookedDate4 = item.bookedSlotsTime
        // console.log(bookedDate4);
        console.log("booked", bookedDate);
        let compare_booked = bookedDate.setMinutes(bookedDate.getMinutes() + 0);
        let compare_booked_date = new Date(compare_booked);
        console.log("booked+0", compare_booked_date);


        // console.log(bookedDate2);
        // console.log(item.bookedSlotsTime);
        let compare_booked2 = bookedDate2.setMinutes(bookedDate2.getMinutes() + 60);
        let compare_booked_date2 = new Date(compare_booked2);
        console.log("booked+60", compare_booked_date2);
        // console.log("missed",compare_booked_date2);

        //appointment closed
        if (compare_date > compare_booked_date2 && !item.user_login_time && !item.doctor_login_time) {
          bookslotsmodel.updateBooking({ _id: item._id }, { status: "appointment TBD" }, (err, res) => {
            if (err) {
              console.log(err)
            } else if (res) {
              console.log(res)
              emailTemplate.missedAppointmentEmail(res, (err, res) => {
                if (err) {
                  console.log(err)
                } else if (res) {
                  console.log(res)
                } else {
                  console.log("appointment missed")
                }
              })
            } else {
              console.log("appointment TBD")
            }
          })
        }




        // doctor missed appointment
        if (compare_date > compare_booked_date2 && !item.doctor_login_time && item.user_login_time) {
          bookslotsmodel.updateBooking({ _id: item._id }, { status: "appointment TBD" }, (err, res) => {
            if (err) {
              console.log(err)
            } else if (res) {
              console.log(res);
              emailTemplate.missedAppointmentEmailDoctor(res, (err, res) => {
                if (err) {
                  console.log(err)
                } else if (res) {
                  console.log(res)
                } else {
                  console.log("appointment missed2")
                }
              })
            } else {
              console.log("appointment missed22")
            }
          })
        }



        let compare_booked3 = bookedDate3.setMinutes(bookedDate3.getMinutes() + 5);
        let compare_booked_date3 = new Date(compare_booked3);
        console.log("booked+5.30", compare_booked_date3);
        // console.log("appointment tbd",compare_booked_date3);

        //user appointment missed
        if (compare_date > compare_booked_date2 && !item.user_login_time && item.doctor_login_time) {
          bookslotsmodel.updateBooking({ _id: item._id }, { status: "appointment closed" }, (err, res) => {
            if (err) {
              console.log(err)
            } else if (res) {
              console.log(res)
              emailTemplate.missedAppointmentEmail(res, (err, res) => {
                if (err) {
                  console.log(err)
                } else if (res) {
                  console.log(res)
                } else {
                  console.log("appointment missed")
                }
              })
            } else {
              console.log("appointment missed1")
            }
          })
        }

        if (compare_date > compare_booked_date2 && !item.doctor_logout_time && item.doctor_login_time) {
          bookslotsmodel.updateBooking({ _id: item._id }, { status: "appointment closed" }, (err, res) => {
            if (err) {
              console.log(err)
            } else if (res) {
              console.log(res)
              // emailTemplate.missedAppointmentEmail(res, (err, res) => {
              //   if (err) {
              //     console.log(err)
              //   } else if(res) {
              //     console.log(res)
              //   } else {
              //     console.log("appointment missed")
              //   }
              // })
            } else {
              console.log("appointment missed1")
            }
          })
        }



        let compare_booked4 = bookedDate4.setMinutes(bookedDate4.getMinutes() - 185);
        let compare_booked_date4 = new Date(compare_booked4);
        let x = moment(compare_booked_date4).format('YYYY-MM-DD[T00:00:00]');
        x = new Date(x);
        console.log("X", x);
        console.log("booked-2", compare_booked_date4);
        // console.log("remainder",compare_booked_date4);



        // user remainder email
        if (compare_date.toString() === compare_booked_date4.toString()) {
          emailTemplate.userRemainderEmail(item, (err, res) => {
            if (err) {
              console.log(err)
            } else if (res) {
              console.log(res)
            } else {
              console.log("null")
            }
          })
        }


        //doctor remainder email
        if (compare_date.toString() === compare_booked_date4.toString()) {
          emailTemplate.doctorRemainderEmail(item, (err, res) => {
            if (err) {
              console.log(err)
            } else if (res) {
              console.log(res)
            } else {
              console.log("null")
            }
          })
        }
      }
    } else {
      console.log("null")
    }
  })


  //Employee Booking Cronjob

  bookslotsmodel.getAllEmployeeBooking({ status: 'appointment confirmed' }, (err, docs) => {
    if (err) 
    {
      console.log(err)
    } else if (docs.length > 0) 
    {
      console.log("employeebooking\n", docs)
      // const current_date = new Date();
      // console.log("general-format",current_date);
      // console.log("current_date", moment(current_date).format("DD/MM/YYYY, h:mm:ss a")) //IST
      // var new_date = current_date.setMinutes( current_date.getMinutes() + 60 );
      // var compare_date = new Date(new_date)
      // console.log("compare_date", moment(compare_date).format("DD/MM/YYYY, h:mm:ss a"))

      // const current_date2 = new Date();
      // var logout_new_date = current_date2.setMinutes( current_date2.getMinutes() + 335 );
      // var logout_compare_date = new Date(logout_new_date)
      // console.log("logout_compare_date", moment(logout_compare_date).format("DD/MM/YYYY, h:mm:ss a"))


      // const current_date3 = new Date();
      // var remainder = current_date3.setMinutes( current_date3.getMinutes() - 120 );
      // var remainder_date = new Date(remainder)
      // console.log("remainder_date", moment(remainder_date).format("DD/MM/YYYY, h:mm:ss a"))

      // const current_date4 = new Date();
      // var tbd_new_date = current_date4.setMinutes( current_date4.getMinutes() + 20 );
      // var tbd_compare_date = new Date(tbd_new_date)
      // console.log("tbd_compare_date", moment(tbd_compare_date).format("DD/MM/YYYY, h:mm:ss a"))

      for (const item of docs) {
        let compare_date1 = new Date();
        let compare_date2 = compare_date1.setMinutes(compare_date1.getMinutes() + 330);
        // console.log(compare_date2);
        let compare_date = new Date(compare_date2);

        // console.log("compare_date", compare_date);


        const bookedDate = item.bookedSlotsTime;
        const bookedDate2 = item.bookedSlotsTime;
        const bookedDate3 = item.bookedSlotsTime
        const bookedDate4 = item.bookedSlotsTime
        // console.log(bookedDate4);
        // console.log("booked", bookedDate);
        let compare_booked = bookedDate.setMinutes(bookedDate.getMinutes() + 0);
        let compare_booked_date = new Date(compare_booked);
        // console.log("booked+0", compare_booked_date);


        // console.log(bookedDate2);
        // console.log(item.bookedSlotsTime);
        let compare_booked2 = bookedDate2.setMinutes(bookedDate2.getMinutes() + 60);
        let compare_booked_date2 = new Date(compare_booked2);
        // console.log("booked+60", compare_booked_date2);
        // console.log("missed",compare_booked_date2);

        //appointment closed
        if (compare_date > compare_booked_date2 && !item.user_login_time && !item.doctor_login_time) {
          bookslotsmodel.updateEmployeeBooking({ _id: item._id }, { status: "appointment TBD" }, (err, res) => {
            if (err) {
              console.log(err)
            } else if (res) {
              console.log(res)
              emailTemplate.employeemissedAppointmentEmail(res, (err, res) => {
                if (err) {
                  console.log(err)
                } else if (res) {
                  console.log(res)
                } else {
                  console.log("appointment missed")
                }
              })
            } else {
              console.log("appointment TBD")
            }
          })
        }


        // doctor missed appointment
        if (compare_date > compare_booked_date2 && !item.doctor_login_time && item.user_login_time) {
          bookslotsmodel.updateEmployeeBooking({ _id: item._id }, { status: "appointment TBD" }, (err, res) => {
            if (err) {
              console.log(err)
            } else if (res) {
              console.log(res);
              emailTemplate.employeemissedAppointmentEmailDoctor(res, (err, res) => {
                if (err) {
                  console.log(err)
                } else if (res) {
                  console.log(res)
                } else {
                  console.log("appointment missed2")
                }
              })
            } else {
              console.log("appointment missed22")
            }
          })
        }



        let compare_booked3 = bookedDate3.setMinutes(bookedDate3.getMinutes() + 5);
        let compare_booked_date3 = new Date(compare_booked3);
        console.log("booked+5.30", compare_booked_date3);
        // console.log("appointment tbd",compare_booked_date3);

        //user appointment missed
        if (compare_date > compare_booked_date2 && !item.user_login_time && item.doctor_login_time) {
          bookslotsmodel.updateEmployeeBooking({ _id: item._id }, { status: "appointment closed" }, (err, res) => {
            if (err) {
              console.log(err)
            } else if (res) {
              console.log(res)
              emailTemplate.employeemissedAppointmentEmail(res, (err, res) => {
                if (err) {
                  console.log(err)
                } else if (res) {
                  console.log(res)
                } else {
                  console.log("appointment missed")
                }
              })
            } else {
              console.log("appointment missed1")
            }
          })
        }

        if (compare_date > compare_booked_date2 && !item.doctor_logout_time && item.doctor_login_time) {
          bookslotsmodel.updateEmployeeBooking({ _id: item._id }, { status: "appointment closed" }, (err, res) => {
            if (err) {
              console.log(err)
            } else if (res) {
              console.log(res)
              emailTemplate.employeemissedAppointmentEmail(res, (err, res) => {
                if (err) {
                  console.log(err)
                } else if (res) {
                  console.log(res)
                } else {
                  console.log("appointment missed")
                }
              })
            } else {
              console.log("appointment missed1")
            }
          })
        }



        let compare_booked4 = bookedDate4.setMinutes(bookedDate4.getMinutes() - 185);
        let compare_booked_date4 = new Date(compare_booked4);
        let x = moment(compare_booked_date4).format('YYYY-MM-DD[T00:00:00]');
        x = new Date(x);
        // console.log("X", x);
        // console.log("booked-2", compare_booked_date4);
        // console.log("remainder",compare_booked_date4);



        // user remainder email
        if (compare_date.toString() === compare_booked_date4.toString()) {
          emailTemplate.userRemainderEmail_employee(item, (err, res) => {
            if (err) {
              console.log(err)
            } else if (res) {
              console.log(res)
            } else {
              console.log("null")
            }
          })
        }


        //doctor remainder email
        if (compare_date.toString() === compare_booked_date4.toString()) {
          emailTemplate.doctorRemainderEmail_employee(item, (err, res) => {
            if (err) {
              console.log(err)
            } else if (res) {
              console.log(res)
            } else {
              console.log("null")
            }
          })
        }
      }
    } else {
      console.log("null")
    }
  })

});
app.listen(port, () => 
 {
   console.log(`Server is running on Port: ${port}`);
 });