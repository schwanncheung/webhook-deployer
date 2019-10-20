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

      if (data.repository) {
        ctx.logger.info(`repository '${data.repository.name}' received '${event}' event.`);
      }

      config.event = config.event || 'push';
      if (config.event === event) {
        runCmd('sh', [ config.cmdFile ], function(log) {
          ctx.logger.info(log);
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
