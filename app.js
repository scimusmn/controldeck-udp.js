/**
 * Load the modules that we need
 */
var http = require('http'),
    static = require('node-static'),
    socketio = require("socket.io"),
    dgram = require("dgram"),
    url = require('url');
    fs = require('fs');

/**
 * Create a HTTP web server
 *
 * Port choice (8080) is arbitrary but should be distinct from the UDP
 * listener port
 */
var app = http.createServer(handleRequest);
app.listen(8080);

/**
 * Create a node-static server instance to serve the slide deck presentations
 */
var files = new static.Server('./public');

/**
 * Create a Socket.IO server for communication between devices
 */
var io = socketio.listen(app);

/**
 * Create a UDP network listener
 *
 * Port choice (43278) is arbitrary but should be distinct from the HTTP port
 */
var UDPsocket = dgram.createSocket('udp4');
UDPsocket.bind(43278);

/**
 * Respond to a HTTP requests with the node-static server
 */
function handleRequest(req, res) {

  // Log pathname
  var pathname = url.parse(req.url).pathname;
  console.log('pathname: '+pathname);

  req.addListener('end', function () {
    files.serve(req, res);
  });
}

/**
 * Respond to UDP messages
 *
 * When specific UDP messages are sent, this will pass commands to the
 * slide decks through the Socket.IO server
 */
UDPsocket.on('message', function(content, rinfo) {

    // Log the raw UDP message
    console.log('got message', content, 'from', rinfo.address, rinfo.port);

    // Convert the UDP message to a string and send it along to web
    // application using Socket.IO
    io.sockets.emit('message', content.toString());

});
