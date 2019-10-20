'use strict';

const crypto = require('crypto');
const process = require('child_process');

module.exports = {

  signData(secret, data) {
    return `sha1=${crypto.createHmac('sha1', secret).update(data).digest('hex')}`;
  },

  verifyToken(token, signedData) {
    const tokenSign = Buffer.from(token);
    const dataSign = Buffer.from(signedData);

    if (tokenSign.length !== dataSign.length) {
      return false;
    }

    return crypto.timingSafeEqual(tokenSign, dataSign);
  },

  runCmd(cmd, args, callback) {
    const child = process.spawn(cmd, args);
    let resp = '';

    child.stdout.on('data', function(buffer) { resp += buffer.toString(); });
    child.stdout.on('end', function() { callback(resp); });
  },

};
