"use strict";

class Player {

    constructor(id, name, color, x, y, dir, size) {
        this.id = id;
        this.name = name;
        this.size = size;
        this.color = color;
        this.dir = dir;
        this.x = x;
        this.y = y;
        this.handX = 0;
        this.handY = 0;
        this.footX = 0;
        this.footY = 0;
        this.hfSize = this.size/2;
        this.speed = 6 - (this.size/35);
        this.tagged = null;
        //this.isDead = false;
    }

    /*setID(id) {
        this.id = id;
    }*/

    handleKeyDown(k) {
        if (k.code === " ") { playing = false; }
        if (k.code === "ArrowUp") { up = true; }
        if (k.code === "ArrowDown") { down = true; }
        if (k.code === "ArrowLeft") { left = true; }
        if (k.code === "ArrowRight") { right = true; }
    }

    handleKeyUp(k) {
        if (k.code === "ArrowUp") { up = false; }
        if (k.code === "ArrowDown") { down = false; }
        if (k.code === "ArrowLeft") { left = false; }
        if (k.code === "ArrowRight") { right = false; }
        if (k.code === "KeyS") { this.size++; }
    }

    handleMouse(e) {
        //console.log("hi");
        this.dir = -1 * Math.atan2((e.offsetY - (this.y + offsetY)), (e.offsetX - (this.x + offsetX)));
    }

    
    update() {
        // moving up
        //checkPossibleMoves();

        if (up && !down) { 
            let move = this.maxMove(this.x, this.y - this.speed);
            if (this.y > (this.speed + this.size)) {
                this.y -= move;
            } // move up unless touching edge or another player
        }
        if (down && !up) { 
            let move = this.maxMove(this.x, this.y + this.speed);
            if (this.y < (mapH - this.speed - this.size)) {
                this.y += move;
            } // move up unless touching edge or another player
        }
        if (left && !right) { 
            let move = this.maxMove(this.x - this.speed, this.y);
            if (this.x > (this.speed + this.size)) {
                this.x -= move;
            } // move up unless touching edge or another player
        }
        if (right && !left) { 
            let move = this.maxMove(this.x + this.speed, this.y);
            if (this.x < (mapW - this.speed - this.size)) {
                this.x += move;
            } // move up unless touching edge or another player
        }

        // current distance the player is being shifted
        offsetX = centerX - this.x;
        offsetY = centerY - this.y;


        /*// moving down
        if (down && !up) { 
            if (this.y < (window.innerHeight - this.speed - this.size) && !this.checkCollision(this.x, this.y + this.speed)) {
                this.y += this.speed;
            }
            //this.y < (window.innerHeight - this.speed - this.size) ? this.y += this.speed : this.y = window.innerHeight - this.size; // move down unless touching edge
        }

        // moving left
        if (left && !right) { 
            if (this.x > (this.speed + this.size) && !this.checkCollision(this.x - this.speed, this.y)) {
                this.x -= this.speed;
            }
            //this.x > (this.speed + this.size) ? this.x -= this.speed : this.x = this.size; // move left unless touching edge
        }
        // moving right
        if (right && !left) { 
            if (this.x < (window.innerWidth - this.speed - this.size) && !this.checkCollision(this.x + this.speed, this.y)) {
                this.x += this.speed;
            }
            //this.x < (window.innerWidth - this.speed - this.size) ? this.x += this.speed : this.x = window.innerWidth - this.size; // move right unless touching edge
        }*/

        //console.log(this.dir);
        /*this.hfSize = this.size/2;

        this.handX = this.x + (Math.cos(this.dir) * (this.size + this.hfSize));
        this.handY = this.y + (-1 * Math.sin(this.dir) * (this.size + this.hfSize));

        this.footX = this.x - (Math.cos(this.dir) * (this.size + this.hfSize));
        this.footY = this.y - (-1 * Math.sin(this.dir) * (this.size + this.hfSize));*/
    }


    maxMove(x, y) {
        for (let id in players) {
            if (id != this.id) {
                //console.log(`futureX: ${x} futureY: ${y} otherX: ${players[id].x} otherY: ${players[id].y}`);
                //console.log(distance(x, y, players[id].x, players[id].y));
                //console.log(this.size + players[id].size);
                let dist = distance(x, y, players[id].x, players[id].y);
                if (dist < this.size + players[id].size) {
                    return this.speed - ((this.size + players[id].size) - dist);
                }
            }
        }
        return this.speed;
    }

    checkTags() {
        for (let id in players) {
            //console.log(`id: ${id}`);
            //console.log(`this: ${this.id}`);
            if (id != this.id) {
                //console.log(`${id} ${this.id}`);
                //console.log(`futureX: ${x} futureY: ${y} otherX: ${players[id].x} otherY: ${players[id].y}`);
                //console.log(distance(x, y, players[id].x, players[id].y));
                //console.log(this.size + players[id].size);
                let dist = distance(this.handX, this.handY, players[id].footX, players[id].footY);
                //console.log(dist);
                if (dist < this.hfSize + players[id].hfSize) {
                    console.log("tag");
                    //players[id].isDead = true;
                    this.tagged = id;
                    //console.log(this.tagged);
                }
            }
        }
    }

    draw() {
        /*let w = window.innerWidth;
        let h = window.innerHeight;

        ctx.canvas.width = w;
        ctx.canvas.height = h;

        ctx.clearRect(0, 0, w, h);

        ctx.fillStyle = 'rgb(40, 200, 70)';
        ctx.fillRect(0, 0, w, h);*/

        this.hfSize = this.size/2;

        this.handX = this.x + (Math.cos(this.dir) * (this.size + this.hfSize));
        this.handY = this.y + (-1 * Math.sin(this.dir) * (this.size + this.hfSize));

        this.footX = this.x - (Math.cos(this.dir) * (this.size + this.hfSize));
        this.footY = this.y - (-1 * Math.sin(this.dir) * (this.size + this.hfSize));

        ctx.beginPath();
        ctx.arc(this.x + offsetX, this.y + offsetY, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(this.handX + offsetX, this.handY + offsetY, this.hfSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgb(255,0,0)';
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.arc(this.footX + offsetX, this.footY + offsetY, this.hfSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgb(0,0,0)';
        ctx.fill();
        ctx.closePath();

        ctx.beginPath();
        ctx.font = `${this.size / 2}pt Arial`;
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.textAlign = 'center'
        ctx.fillText(this.name, this.x + offsetX, this.y + offsetY);
        ctx.closePath();

        //ctx.restore();

    }

    curState() {
        let state = {
            'type'  : 'playerState',
            'id'    : this.id,
            'name'  : this.name,
            'size'  : this.size,
            'color' : this.color,
            'dir'   : this.dir,
            'x'     : this.x,
            'y'     : this.y,
            'tagged': this.tagged
            /*'up'   : this.up,
            'down' : this.down,
            'left' : this.left,
            'right': this.right*/
        }
        //console.log(`tagged: ${state.tagged}`);

        return state;
    }
}