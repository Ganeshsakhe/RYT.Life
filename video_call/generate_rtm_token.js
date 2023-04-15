const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { RtmTokenBuilder, RtmRole} = require('agora-access-token');

const generateRTMToken = (req, resp) => {
    dotenv.config();
    const APP_ID = process.env.APP_ID;
    const APP_CERTIFICATE = process.env.APP_CERTIFICATE;
    // set response header
    resp.header('Access-Control-Allow-Origin', '*');
  
    // get uid
    let uid = req.params.uid;
    if(!uid || uid === '') {
      return resp.status(500).json({ 'error': 'uid is required' });
    }
    // get role
    let role = RtmRole.Rtm_User;
     // get the expire time
    let expireTime = req.query.expiry;
    if (!expireTime || expireTime === '') {
      expireTime = 3600;
    } else {
      expireTime = parseInt(expireTime, 10);
    }
    // calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;
    // build the token
    console.log(APP_ID, APP_CERTIFICATE, uid, role, privilegeExpireTime)
    const token = RtmTokenBuilder.buildToken(APP_ID, APP_CERTIFICATE, uid, role, privilegeExpireTime);
    // return the token
    return resp.json({ 'rtmToken': token });
  }