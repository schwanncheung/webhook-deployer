'use strict';

module.exports = app => {
  const { router, controller } = app;

  router.post('/:gitType(github|gitlab|gitee)', controller.index.index);
};
