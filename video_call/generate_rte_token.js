const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const {RtcTokenBuilder, RtcRole, RtmTokenBuilder} = require('agora-access-token');

const generateRTEToken = (req, resp) => {
    dotenv.config();
    const APP_ID = process.env.APP_ID;
    const APP_CERTIFICATE = '6c7ba7625e224ff1aa54e0d7d5c09cd3';
    // set response header
    resp.header('Access-Control-Allow-Origin', '*');
    // get channel name
    const channelName = req.params.channel;
    if (!channelName) {
      return resp.status(500).json({ 'error': 'channel is required' });
    }
    // get uid
    let uid = req.params.uid;
    if(!uid || uid === '') {
      return resp.status(500).json({ 'error': 'uid is required' });
    }
    // get role
    let role;
    if (req.params.role === 'publisher') {
      role = RtcRole.PUBLISHER;
    } else if (req.params.role === 'audience') {
      role = RtcRole.SUBSCRIBER
    } else {
      return resp.status(500).json({ 'error': 'role is incorrect' });
    }
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
    const rtcToken = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
    const rtmToken = RtmTokenBuilder.buildToken(APP_ID, APP_CERTIFICATE, uid, role, privilegeExpireTime);
    // return the token
    return resp.json({ 'rtcToken': rtcToken, 'rtmToken': rtmToken });
  }
  