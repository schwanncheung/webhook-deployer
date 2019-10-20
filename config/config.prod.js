'use strict';

const fs = require('fs');
const path = require('path');
const extend = require('extend');
const confFile = path.join(__dirname, '../conf/config.json');

module.exports = appInfo => {
  const config = exports = {};

  config.logger = {
    dir: `/data/logs/${appInfo.name}`,
  };

  if (fs.existsSync(confFile)) {
    const conf = JSON.parse(fs.readFileSync(confFile, 'utf-8'));
    extend(true, config, conf);
  }

  return config;
};
