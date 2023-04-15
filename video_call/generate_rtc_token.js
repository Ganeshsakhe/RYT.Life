const dotenv = require('dotenv');
const {RtcTokenBuilder, RtcRole} = require('agora-access-token');

const generateRTCToken = (req, resp) => {
    // console.log(req.params);
    dotenv.config();
    const APP_ID = process.env.APP_ID;
    const APP_CERTIFICATE = process.env.APP_CERTIFICATE;
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
    let token;
    console.log('\nAPP_ID: ', APP_ID);
    console.log('\nAPP_CERTIFICATE: ', APP_CERTIFICATE);
    console.log('\nchannelName: ', channelName);
    console.log('\nuid: ', uid);
    console.log('\nrole: ', role);
    console.log('\nreq.params.tokentype: ', req.params.tokentype);
    console.log('\nreq.params.tokentype === userAccount: ', req.params.tokentype === 'userAccount');
    console.log('\nreq.params.tokentype === uid: ', req.params.tokentype === 'uid');
    if (req.params.tokentype === 'userAccount') {
      token = RtcTokenBuilder.buildTokenWithAccount(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
    } else if (req.params.tokentype === 'uid') {
      token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
    } else {
      return resp.status(500).json({ 'error': 'token type is invalid' });
    }
    console.log(req.params, token);
    // return the token
    return resp.json({ 'rtcToken': token });
  }

  module.exports = generateRTCToken;