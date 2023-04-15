const nocache = require('./nocache');
// const generateRTEToken = require('./generate_rte_token');
// const generateRTMToken = require('./generate_rtm_token');
const generateRTCToken = require('./generate_rtc_token');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.options('*', cors());
app.get('/rtc/:channel/:role/:tokentype/:uid', nocache , generateRTCToken);
// app.get('/rtm/:uid/', nocache , generateRTMToken);
// app.get('/rte/:channel/:role/:tokentype/:uid', nocache , generateRTEToken);