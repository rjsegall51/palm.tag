const http = require('http');
const ws = require('ws');

const wss = new ws.Server({noServer: true});

let players = {};

console.log("Going");

function accept(req, res) {
  // console.log("accept"); console.log(req);
  // all incoming requests must be websockets
  if (!req.headers.upgrade || req.headers.upgrade.toLowerCase() != 'websocket') {
    res.end();
    return;
  }

  // can be Connection: keep-alive, Upgrade
  if (!req.headers.connection.match(/\bupgrade\b/i)) {
    res.end();
    return;
  }

  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), onConnect);
}

function onConnect(ws) {
  console.log("connect");
  
  ws.on('message', function (message) {
    //console.log(message);
    message = JSON.parse(message.toString());

    //console.log(message.name);

    //console.log("received " + message);   // DEBUG
    //let obj = JSON.parse(message); // parse the message as JSON

    // add new player
    if (message.type === "join") {
      // gen unique ID
      let id = Math.random() * 1000;

      //console.log(message);

      message.name = message.name.match(/[a-zA-Z0-9]+/) || "Guest";

      //console.log(message.name);

      players[id] = { 
        'id'   : id,
        'name' : message.name,
        'color': message.color, 
        'x'    : message.x,
        'y'    : message.y,
        'dir'  : 0,
        'size' : 20 
      };

      let response = {
        'type'  : 'welcome',
        'player': players[id]
      };

      //console.log(JSON.stringify(players));

      ws.send(JSON.stringify(response)); 
    }

    // update player and send back game state
    if (message.type === "playerState") {

      //console.log(message);

      let id = message.id;
      let response;

      // if player has been tagged set response to game over
      if (!(id in players)) {
        response = {
          'type': 'gameOver'
        }
      } else {

        // create updated player object
        players[id] = { 
          'id'   : id,
          'name' : message.name,
          'color': message.color, 
          'x'    : message.x,
          'y'    : message.y,
          'dir'  : message.dir,
          'size' : message.size
          /*'up'   : message.up,
          'down' : message.down,
          'left' : message.left,
          'right': message.right*/
        };

        //console.log(message.tagged);
        // remove tagged player
        if (message.tagged in players) {
          //console.log(`tagged: ${message.tagged}`);
          //console.log(players);
          delete players[message.tagged];
          players[id].size += 5;
        }

        response = {
          'type'   : 'gameState',
          'players': players
        };

        //console.log(players);

        //console.log(response);
      }
      //console.log(JSON.stringify(response));

      ws.send(JSON.stringify(response)); 
    }
    
    //ws.send(`Hello from server, ${name}!`);

    // close the connection after 5 seconds
    // setTimeout(() => ws.close(1000, "Bye!"), 5000);

    if (message.type === "leave") {
      delete players[message.id];
    }

  });

}

if (!module.parent) {
  http.createServer(accept).listen(8080);
} else {
  exports.accept = accept;
}


/*

Client -> Server

  { 'type': 'join',   'name' : 'ryan' }

  { 'type' : 'update-client',  }





Server -> Client

{ 'type' : 'welcome', 'name' : 'ryan' , 'color' : [ 0, 3, 5] }

{ 'type' : 'update-all',  game : { .... } }






*/