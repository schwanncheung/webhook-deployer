'use strict';

const fs = require('fs');
const path = require('path');
const extend = require('extend');
const confFile = path.join(__dirname, '../conf/config.json');

module.exports = appInfo => {
  const config = exports = {};

  config.keys = appInfo.name + '_1571498333429';

  // 全局 Secret Token
  config.secretToken = '';

  // github
  config.github = {};
  // gitlab
  config.gitlab = {};
  // 码云
  config.gitee = {};

  // 开启前置代理
  config.proxy = true;

  config.logger = {
    level: 'INFO',
    consoleLevel: 'NONE',
  };

  config.siteFile = {
    '/favicon.ico': fs.readFileSync(path.join(appInfo.baseDir, '/assets/favicon.png')),
  };

  config.middleware = [
    'robot',
  ];

  config.security = {
    csrf: false,
  };

  if (fs.existsSync(confFile)) {
    const conf = JSON.parse(fs.readFileSync(confFile, 'utf-8'));
    extend(true, config, conf);
  }

  return config;
};
