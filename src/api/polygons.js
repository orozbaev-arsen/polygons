// system libraries
const express = require('express');

// project modules
const Polygons = require('./polygons');

module.exports = (Server) => {
  const router = new express.Router();

  Server.middleware('auth', router);


  return router;
};
