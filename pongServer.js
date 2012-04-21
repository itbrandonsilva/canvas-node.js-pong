// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'pongServer';

// Port where we'll run the websocket server
var webSocketsServerPort = 1337;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
	// Not important for us. We're writing WebSocket server, not HTTP server
});
server.listen(webSocketsServerPort, function() {
	console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

/**
 * WebSocket server
 */
var wsServer = new webSocketServer({
	// WebSocket server is tied to a HTTP server. To be honest I don't understand why.
	httpServer: server
});

var leftY = 150;
var rightY = 150;
var ballX = 300;
var ballY = 200;
var ballXVel = 0;
var ballYVel = 0;
var pSpeed = 2.5;
var bSpeed = 1.5;

var pyMax = 250;
var pyMin = 0;
var byMax = 390;
var byMin = 0;
var bxMax = 590;
var bxMin = 0;

var allowSend = true;
var playerOne = false;
var playerTwo = false;

var json;

// This callback function is called every time someone tries to connect to the WebSocket server
wsServer.on('request', function(request) {
	console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

	var player;
	if (playerOne === false){
		json = {
			type: 'player',
			player: 1
		}
		player = 1;
		playerOne = true;
		if (playerTwo === true){
			var random = Math.floor(Math.random()*2)+1;
			if (random = 1){ ballXVel = -bSpeed; } else { ballXvel = bSpeed; }
			random = Math.floor(Math.random()*2)+1;
			if (random = 1){ ballYVel = -bSpeed; } else { ballYvel = bSpeed; }
		}
	} else if (playerTwo === false) {
		json = {
			type: 'player',
			player: 2
		}
		player = 2;
		playerTwo = true;
		var random = Math.floor(Math.random()*2)+1;
		if (random = 1){ ballXVel = -bSpeed; } else { ballXvel = bSpeed; }
		random = Math.floor(Math.random()*2)+1;
		if (random = 1){ ballYVel = -bSpeed; } else { ballYvel = bSpeed; }		
	}

	var connection = request.accept(null, request.origin);
	connection.sendUTF(JSON.stringify(json));

	console.log((new Date()) + ' Connection accepted. Player: ' + player);

	// user sent some message
	connection.on('message', function(message) {
		console.log("Message received!");
		try {
			json = JSON.parse(message.utf8Data);
			console.log("JSON parsed succesfully!");
		} catch (e) {
			console.log('This doesnt look like a valid JSON: ' + message.utf8Data);
			return;
		}
		if (json.upKey){
			if (player === 1){
				leftY = leftY - pSpeed;
			} else if (player === 2){
				rightY = rightY - pSpeed;
			}
		}
		if (json.downKey){
			if (player === 1){
				leftY = leftY + pSpeed;
			} else if (player === 2){
				rightY = rightY + pSpeed;
			}
		}
		if (leftY > pyMax){ leftY = pyMax; } else if ( leftY < pyMin ){ leftY = pyMin; }
		//leftY = json.sleftY;
			

		console.log(JSON.stringify(json));
		//var jsonMessage = message;
	});

	var sendUpdate = function(){
		ballX = ballX + ballXVel;
		ballY = ballY + ballYVel;
		if (ballY > byMax){ ballY = byMax; ballYVel = -ballYVel; } else if (ballY < byMin){ ballY = byMin; ballYVel = -ballYVel; }
		if (ballX > bxMax){ ballX = bxMax; ballXVel = -ballXVel; } else if (ballX < bxMin){ ballX = bxMin; ballXVel = -ballXVel; }

		json = {
			type: 'update',
			rleftY: leftY,
			rrightY: rightY,
			rballX: ballX,
			rballY: ballY
                };
		
		connection.sendUTF(JSON.stringify(json));
		allowSend = false;
		console.log('AllowSend is now false!');
	};

	// user disconnected
	connection.on('close', function(connection) {
		console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
		if (player === 1){ playerOne = false; } else if (player === 2){ playerTwo = false; }
		ballXVel = 0;
		ballYVel = 0;
		ballX = 300;
		ballY = 200;
	});
	
	var resetAllowSend = function (){
		allowSend = true;
		//console.log('AllowSend is now true!');
	}

	setInterval(sendUpdate, 16);
});