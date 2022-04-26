"use strict";

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext('2d');
//let miniCanvas = document.getElementById("miniCanvas");
//let miniCtx = miniCanvas.getContext('2d');

let playing = false;
let myId;
let connection;
let players = {};

let up = false;
let down = false;
let left = false;
let right = false;

let canMoveUp = true;
let canMoveDown = true;
let canMoveLeft = true;
let canMoveRight = true;

// updated in drawCanvas function
let centerX;
let centerY;

// updated in Player.update function
let offsetX = 0;
let offsetY = 0;

let mapW = 3000;
let mapH = 3000;


window.onload = function() {
    let button = document.getElementById("submit");
    button.addEventListener("click", startGame);
};

function startGame() {
    let lobbyDiv = document.getElementById("lobbyDiv");
    lobbyDiv.classList.add("hidden");

    let canvasDiv = document.getElementById("canvasDiv");
    canvasDiv.classList.remove("hidden");

    let name = document.getElementById("ign").value;

    //console.log(name);

    connection = openSocket(name);

    //players[id] = new Player(name, window.innerWidth/2, window.innerHeight/2);

    /*let w = window.innerWidth;
    let h = window.innerHeight;

    ctx.canvas.width  = w;
    ctx.canvas.height = h;

    ctx.fillStyle = 'rgb(40, 200, 70)';
    ctx.fillRect(0, 0, w, h);*/

    /*window.addEventListener("mousemove", (event) => { p.handleMouse(event); });
    window.addEventListener("keydown", (event) => { p.handleKeyDown(event); });
    window.addEventListener("keyup", (event) => { p.handleKeyUp(event); });*/

    playing = true;

    /*endTime = Date.now();
    if (endTime - startTime > interval) {
        startTime = Date.now();
        tick(p);
    }*/

    window.requestAnimationFrame(tick);
}

function tick() {

    drawCanvas();

    if (myId) {
        //console.log(players[myId].up);
        players[myId].update();
        //console.log(players[myId].curState());
        //console.log(players[myId].curState());

        //console.log(players);

        for (let id in players) {
            //console.log(`id: ${id}`);
            players[id].draw();
        }

        drawMiniMap();

        players[myId].checkTags();

        connection.send(JSON.stringify(players[myId].curState()));

    }

    if (playing) {
        window.requestAnimationFrame(tick);
    }
}

function openSocket(name) {
    let socket = new WebSocket("ws://10.16.4.84:8080");

    //console.log(name);

    socket.onopen = function(e) {
        console.log("[open] Connection established");
        console.log("Sending to server");
        let message = {
            'type' : 'join',
            'name' : name,
            'color': `rgb(${Math.random() * 255},${Math.random() * 100},${Math.random() * 255})`,
            'x'    : Math.random() * mapW,
            'y'    : Math.random() * mapH
        };

        //console.log(message.name);
        socket.send(JSON.stringify(message));
    };

    socket.onmessage = function(event) {
        //console.log(`[message] Data recieved from server: ${event.data}`);

        let message = JSON.parse(event.data);

        if (message.type === "welcome") {
            myId = message.player.id;
            players[myId] = new Player(myId, message.player.name, message.player.color, message.player.x, message.player.y, message.player.dir, message.player.size /*false, false, false, false*/);

            //console.log(players[myId]);

            window.addEventListener("mousemove", (event) => { players[myId].handleMouse(event); });
            window.addEventListener("keydown", (event) => { players[myId].handleKeyDown(event); });
            window.addEventListener("keyup", (event) => { players[myId].handleKeyUp(event); });
            window.addEventListener("beforeunload", function() {
                let message = {
                    'type': 'leave',
                    'id'  : myId
                };
                socket.send(JSON.stringify(message));
            });
        }

        if (message.type === "gameState") {

            players = {};

            for (let id in message.players) {
                let player = message.players[id];
                players[id] = new Player(id, player.name, player.color, player.x, player.y, player.dir, player.size /*player.up, player.down, player.left, player.right*/);
            }

            //console.log(players);

            //players[id] = new Player(message.name, message.color, message.x, message.y, message.dir, message.size);
        }

        if (message.type === "gameOver") {
            socket.close();
            initVars();
            lobbyDiv.classList.remove("hidden");
            canvasDiv.classList.add("hidden");
        }
    };

    socket.onclose = function(event) {
        if (event.wasClean) {
            console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            console.log('[close] Connection died');
        }
    };

    socket.onerror = function(error) {
        console.log(`[error] ${error.message}`);
    }; 

    return socket;
}

function initVars() {
    playing = false;
    myId = null;
    up = false;
    down = false;
    left = false;
    right = false;
}

function drawCanvas() {
    let w = window.innerWidth;
    let h = window.innerHeight;

    centerX = w/2;
    centerY = h/2;

    ctx.canvas.width = w;
    ctx.canvas.height = h;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgb(20, 150, 40)';
    ctx.fillRect(0, 0, w, h);

    for (let i = offsetX % 200; i < w; i += 200) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgb(20, 130, 40)'
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.closePath();
        ctx.stroke();
    }
    for (let i = offsetY % 200; i < h; i += 200) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgb(20, 130, 40)'
        ctx.moveTo(0, i);
        ctx.lineTo(w, i);
        ctx.closePath();
        ctx.stroke();
    }


}


function drawMiniMap() {
    let w = window.innerWidth;
    let h = window.innerHeight;

    let mw = 150;
    let mh = 150;

    let mx = w - mw - 10;
    let my = h - mh - 10;

    ctx.beginPath();
    ctx.fillStyle = 'rgb(10, 120, 20)';
    ctx.fillRect(mx, my, mw, mh);
    ctx.closePath();

    for (let id in players) {
        let scaleX = (players[id].x / mapW);
        let scaleY = (players[id].y / mapH);

        //console.log(`px: ${players[id].x} w: ${w}`);
        //console.log(`x: ${scaleX} y: ${scaleY}`);

        ctx.beginPath();
        (id == myId) ? ctx.fillStyle = 'rgb(255, 255, 255)' : ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(mx + (mw * scaleX) - 2, my + (mh * scaleY) - 2, 5, 5);
        ctx.closePath();
    }
}


function distance(x1,y1,x2,y2) {
    //console.log(`x1: ${x1} y1: ${y1} x2: ${x2} y2: ${y2}`);
    let a = x2-x1;
    let b = y2-y1;
    let result = Math.sqrt(a*a + b*b);
    //console.log(result);
    return result;
}

/*function drawPlayer(ctx, x, y, scale, rotation) {

    ctx.beginPath();
    ctx.arc(x, y, scale, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x + 20, y - 12, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'white';

    ctx.arc(w/2 + 20, h/2 + 12, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.fillRect(w/2 + 25,h/2 - 2,25,4);

    let hand = new Image();
    hand.src = "assets/hand.png";
    drawImage(ctx, hand, x + 40, y, scale, rotation + (Math.PI / 90));
}

function drawImage(ctx, image, x, y, scale, rotation){
    ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
    ctx.rotate(rotation);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
} */



    /*ctx.beginPath();
    ctx.arc(w/2, h/2, 30, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(w/2 + 20, h/2 - 12, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'white';

    ctx.arc(w/2 + 20, h/2 + 12, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'black';
    ctx.fillRect(w/2 + 25,h/2 - 2,25,4);


    let hand = new Image();
    hand.src = "assets/hand.png";
    hand.onload = function() {
        ctx.drawImage(hand, w/2 + 40, h/2 - (hand.height/2) - 2);
    }*/