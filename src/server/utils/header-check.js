'use strict';

var url = require('url');

module.exports = function(whitelist) {
  return function(req, res, next) {
    var method = req.method;

    // We are only interested in conducting header checks on requests using
    // the POST method, so let request with other methods pass to next middleware.
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return next();
    }

    var origin = getBaseUrl(req.headers.origin);
    var referer = getBaseUrl(req.headers.referer);
    var errMsg;

    // Let requests that don't specify origin or referer headers go through the
    // next middleware. The reason for this is that mobile clients won't provide
    // these headers; they [these headers] are only provided from browsers, so if
    // we have a mobile client accessing our API, we want to let those requests
    // go through our next middleware).
    // Note that this step is design-dependent, so one must choose whether to
    // let these type of clients perform requests to our API.
    if (!origin && !referer) { return next(); }

    if (origin && whitelist.indexOf(origin) < 0) {
      errMsg = 'Invalid origin header ' + origin;
    } else if (referer && whitelist.indexOf(referer) < 0) {
      errMsg = 'Invalid referer header ' + referer;
    } else {
      console.log('Origin and referer headers were not present');
      errMsg = undefined;
    }

    if (errMsg) {
      res.statusCode(403);
      return next(new Error(errMsg));
    } else { return next(); }

  };

  function getBaseUrl(fullUrl) {
    var parseUrl = url.parse(fullUrl);
    return parseUrl.protocol + '//' + parseUrl.host;
  }

};
