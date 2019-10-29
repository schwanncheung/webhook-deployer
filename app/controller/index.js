'use strict';

const Controller = require('egg').Controller;
const { signData, verifyToken, runCmd } = require('../utils');

class IndexController extends Controller {

  async index() {
    const { ctx, app } = this;
    try {
      const { gitType } = ctx.params;
      const { key } = ctx.request.query;
      const data = ctx.request.body;
      const token = ctx.get(`x-${gitType}-token`);
      const event = ctx.get(`x-${gitType}-event`);

      if (!key || !token || !data) {
        ctx.status = 500;
        ctx.body = 'invalid request';
        return;
      }

      const config = app.config[gitType][key];

      if (!config) {
        ctx.logger.error(`invalid key: ${key}`);
        ctx.status = 500;
        ctx.body = 'invalid key';
        return;
      }

      const secretToken = config.secret || app.config.secretToken;
      let tokenValid = false;

      if (gitType === 'github') {
        if (verifyToken(token, signData(secretToken, data))) {
          tokenValid = true;
        }
      } else {
        if (token === secretToken) {
          tokenValid = true;
        }
      }

      if (!tokenValid) {
        ctx.logger.error(`invalid token: ${token}`);
        ctx.status = 500;
        ctx.body = 'invalid token';
        return;
      }

      ctx.logger.info(`[${gitType}]repository '${data.repository.name}' received '${event}' event.`);

      config.event = config.event || (gitType === 'github' ? 'push' : 'push hook');
      config.args = config.args || [];

      if (config.event.toLowerCase() === event.toLowerCase()) {
        if (app.config.dingtalkRobot.enable) {
          app.dingtalkRobot.sendText(app.config.dingtalkRobot.startTemplate.replace('#REPONSITORY_NAME#', data.repository.name));
        }

        runCmd('sh', [ config.cmdFile, ...config.args ], function(log) {
          ctx.logger.info(log);

          if (app.config.dingtalkRobot.enable) {
            app.dingtalkRobot.sendText(app.config.dingtalkRobot.endTemplate.replace('#REPONSITORY_NAME#', data.repository.name));
          }
        });

        ctx.body = 'done';
      } else {
        ctx.status = 500;
        ctx.body = 'ignore event';
      }
    } catch (error) {
      ctx.logger.error(error);
      ctx.status = 500;
      ctx.body = 'service error';
    }
  }

}

module.exports = IndexController;
