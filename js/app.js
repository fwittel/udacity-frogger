// Base class for any moving agent in the game:
class Agent {
    
    constructor(diameter = 20) {
        this.diameter = diameter;
        this.position = {};
        // this.velocity = {};
        this._sprite = 'images/Heart.png'; // Default sprite
        Resources.load(this._sprite);
    }

    set position({x = 0, y = 0} = {}) {
        this._position = {x, y};
    }

    set velocity({x = 0, y = 0} = {}) {
        this._velocity = {x, y};
    }

    update(dt = 0) {
        for (let key of Object.keys(this._position)) {
            this._position[key] += this._velocity[key] * dt;
        }
    }

    render() {
        ctx.drawImage(Resources.get(this._sprite), this._position.x, this._position.y);
    }

}

class Enemy extends Agent {

    constructor(diameter = 70) {
        super(diameter);
        // The image/sprite for our enemies, this uses
        // a helper we've provided to easily load images
        this._sprite = 'images/enemy-bug.png';
        Resources.load(this._sprite);
        this.randomize();
    }

    randomize() {
        // Enemies need a random start location and velocity:
        this._position.x =  (Math.random() - 1.5) * ctx.canvas.width;
        this._position.y = Math.floor(Math.random() * 3 + 1) * ctx.rowHeight;
        this._velocity = {x: 50 + Math.random() * 200, y: 0};
    }

    update(dt = 0) {
        super.update(dt);
        // Enemies can get off screen. If they do, they should go to a new random location and speed:
        if (this._position.x > (ctx.canvas.width + this.diameter)) {
            this.randomize();
        }
    }

}

class Player extends Agent {

    constructor(diameter = 70) {
        super(diameter);
        this._speed = 300;
        this._sprite = 'images/char-pink-girl.png';
        Resources.load(this._sprite);
        this.init();
    }

    init() {
        // Put player to its starting position:
        // The player moves along the grid so its position is defined that way:
        this._gridPositionTarget = {x: 2, y: 5};
        this._position = {x: this._gridPositionTarget.x * ctx.columnWidth, y: this._gridPositionTarget.y * ctx.rowHeight};
        this._velocity = {x: 0, y: 0};
    }

    handleInput(keyCode) {
        if (keyCode) {
            // Only take input, when player is standing:
            if (Math.abs(this._velocity.x) < 1 && Math.abs(this._velocity.y) < 1) {
                const vectorTable = {
                    left: {x: -1, y: 0},
                    right: {x: 1, y: 0},
                    up: {x: 0, y: -1},
                    down: {x: 0, y: 1}
                }
                const vector = vectorTable[keyCode];
                this._velocity = {x: this._speed * vector.x, y: this._speed * vector.y};
                const gridPositionNewTarget = {
                    x: this._gridPositionTarget.x += vector.x,
                    y: this._gridPositionTarget.y += vector.y
                }
                if (gridPositionNewTarget.x > -1 && gridPositionNewTarget.x < 5 && gridPositionNewTarget.y > -1 && gridPositionNewTarget.y < 6) {
                    this._gridPositionTarget = gridPositionNewTarget;
                }
            }
        }
    }

    update(dt = 0) {
        // If the target is reached fix the position:
        const targetPosition = {x: this._gridPositionTarget.x * ctx.columnWidth, y: this._gridPositionTarget.y * ctx.rowHeight};
        if (this._velocity.x * (targetPosition.x - this._position.x) < 0 || this._velocity.y * (targetPosition.y - this._position.y) < 0) {
            this._position = targetPosition;
            this._velocity = {x: 0, y: 0};
        }
        // Update:
        super.update(dt);
        // The player can hit an enemy. If it does it should be reset:
        for (let e of allEnemies) {
            const dx = this._position.x - e._position.x;
            const dy = this._position.y - e._position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const touchDistance = (this.diameter + e.diameter) * 0.5;
            if (distance < touchDistance) {
                // e._velocity = {x: -1 * this._velocity.x - e._velocity.x, y:  this._velocity.y - e._velocity.y};
                this.init();
            }
        }
    }

}

// // Enemies our player must avoid
// var Enemy = function() {
//     // Variables applied to each of our instances go here,
//     // we've provided one for you to get started

//     // The image/sprite for our enemies, this uses
//     // a helper we've provided to easily load images
//     this._sprite = 'images/enemy-bug.png';
// };

// // Update the enemy's position, required method for game
// // Parameter: dt, a time delta between ticks
// Enemy.prototype.update = function(dt) {
//     // You should multiply any movement by the dt parameter
//     // which will ensure the game runs at the same speed for
//     // all computers.
// };

// // Draw the enemy on the screen, required method for game
// Enemy.prototype.render = function() {
//     ctx.drawImage(Resources.get(this._sprite), this.x, this.y);
// };

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
// TODO


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
let allEnemies = [];
for (i = 0; i < 10; i++) {
    allEnemies.push(new Enemy);
}
let player = new Player ();

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
