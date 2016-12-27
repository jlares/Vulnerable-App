/*jshint node:true*/
'use strict';

var express = require('express');
var app = express();
app.disable('x-powered-by');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var logger = require('morgan');
var port = process.env.PORT || 8001;
var four0four = require('./utils/404')();
// This module is used to establish a Content Security Policy.
var lusca = require('lusca');

var environment = process.env.NODE_ENV;


// Use  the Lusca Module's CSP method.
app.use(lusca.csp({
  policy: {
    'default-src': '\'self\'',
    'style-src': '\'self\'',
    'img-src': '\'self\' data:'
  }
}));

app.use(favicon(__dirname + '/favicon.ico'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(logger('dev'));

app.use('/api', require('./routes'));

console.log('About to crank up node');
console.log('PORT=' + port);
console.log('NODE_ENV=' + environment);

switch (environment){
    case 'build':
        console.log('** BUILD **');
        app.use(express.static('./build/'));
        // Any invalid calls for templateUrls are under app/* and should return 404
        app.use('/app/*', function(req, res, next) {
            four0four.send404(req, res);
        });
        // Any deep link calls should return index.html
        app.use('/*', express.static('./build/index.html'));
        break;
    default:
        console.log('** DEV **');
        app.use(express.static('./src/client/'));
        app.use(express.static('./'));
        app.use(express.static('./tmp'));
        // Any invalid calls for templateUrls are under app/* and should return 404
        app.use('/app/*', function(req, res, next) {
            four0four.send404(req, res);
        });
        // Any deep link calls should return index.html
        app.use('/*', express.static('./src/client/index.html'));
        break;
}

// Start server and listen via HTTPS.

var https = require('https');
var fs = require('fs');

// This variable specifies the values for the key and certificate (dev only)
var options = {
  key: fs.readFileSync('./vulnapp-key.pem'),
  cert: fs.readFileSync('./vulnapp-cert.pem')
};

// Start the server and pass options variable so that our app uses the key and
// certificate. Note that this certificate is self-signed and therefore should
// be only used for development (never in production).
https.createServer(options, app).listen(port, function() {
  console.log('Express server listening on port ' + port);
  console.log('env = ' + app.get('env') +
          '\n__dirname = ' + __dirname  +
          '\nprocess.cwd = ' + process.cwd());
})

// Start server and listen via HTTP.
// app.listen(port, function() {
//     console.log('Express server listening on port ' + port);
//     console.log('env = ' + app.get('env') +
//         '\n__dirname = ' + __dirname  +
//         '\nprocess.cwd = ' + process.cwd());
// });
