'use strict';

module.exports = () => {
  const config = exports = {};

  // 关闭前置代理
  config.proxy = false;

  config.logger = {
    level: 'DEBUG',
    consoleLevel: 'DEBUG',
  };

  return config;
};
