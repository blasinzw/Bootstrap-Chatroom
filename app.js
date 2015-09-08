(function() {
    'use-strict';

    var express = require('express');
    var app = express();
    var port = 8080;

    var numOfUsers = 0;

    //routing
    app.get('/', function(req, res) {
        res.sendFile(__dirname + '/public/views/index.html');
    });

    app.get('/public/scripts/client.js', function(req, res) {
        res.sendFile(__dirname + '/public/scripts/client.js');
    });

    app.get('/public/scripts/bootstrap.min.js', function(req, res) {
        res.sendFile(__dirname + '/public/scripts/bootstrap.min.js');
    });

    app.get('/public/styles/bootstrap.min.css', function(req, res) {
        res.sendFile(__dirname + '/public/styles/bootstrap.min.css');
    });

    app.get('/public/styles/style.css', function(req, res) {
        res.sendFile(__dirname + '/public/styles/style.css');
    });

    //app.post method here
    var io = require('socket.io').listen(app.listen(port, function() {
        console.log('Server is listening on port: ' + port);
    }));

    io.on('connection', function(socket) {
        socket.on('init', function(data) {
            socket.username = data;
            socket.isAlreadyTyping = false;
        });

        socket.on('isTyping', function(isTyping) {
            if (isTyping) {
                socket.isAlreadyTyping = true;
                io.sockets.emit('alertMsg', {
                    username: socket.username,
                    message: socket.username + ' is typing.',
                    admin: true,
                    priority: 0
                });
            }else {
                socket.isAlreadyTyping = false;
                io.sockets.emit('removeMsg', {
                    username: socket.username,
                    message: socket.username + ' is typing.',
                    admin: true,
                    priority: 0
                });
            }
        });

        socket.on('msg', function(data) {
            console.log(data.username + ': ' +  data.message);
            io.sockets.emit('msg', data);
        });

        socket.on('disconnect', function(data) {
            if (socket.username !== undefined) {
                console.log(socket.username + ' has disconnected.');
                io.sockets.emit('msg', {
                    username: null,
                    message: socket.username + ' has disconnected.',
                    admin: true,
                    priority: 1
                });
            }
        });
    });
}).call(this);
