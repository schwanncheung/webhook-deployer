'use strict';

module.exports = function() {
  return async function(ctx, next) {
    const source = ctx.get('user-agent') || '';
    const match = [ /spider/i ].some(ua => ua.test(source));

    if (match) {
      ctx.status = 404;
      ctx.body = 'not found';
    } else {
      await next();
    }
  };
};
