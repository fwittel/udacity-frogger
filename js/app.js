// Base class for any moving agent in the game:
class Agent {
    
    // Every agent needs a diameter for collision detection:
    constructor(diameter = 20) {
        this.diameter = diameter;
        this.position = {};
        // Have some default sprite:
        this._sprite = 'images/Heart.png';
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
        try {
            ctx.drawImage(Resources.get(this._sprite), this._position.x, this._position.y);
        }
        catch {}
    }

}

class Enemy extends Agent {

    constructor(diameter = 60) {
        // Relate to the base class:
        super(diameter);
        // Only add custom sprite and initialize enemy paramters:
        this._sprite = 'images/enemy-bug.png';
        Resources.load(this._sprite);
        this.randomize();
    }

    randomize() {
        // Enemies need a random start location and velocity:
        this._position.x =  -1 * Math.random() * ctx.canvas.width - this.diameter;
        this._position.y = ctx.rowHeight * Math.floor(1 + Math.random() * 3);
        this._velocity = {x: 50 + Math.random() * 250, y: 0};
    }

    update(dt = 0) {
        super.update(dt);
        // Enemies can get off screen. If they do, they should go to a new random location and speed:
        if (this._position.x > ctx.canvas.width || this._position.x < (ctx.canvas.width * -1 - this.diameter)) {
            this.randomize();
        }
    }

}

class Player extends Agent {

    constructor(diameter = 50) {
        // Relate to the base class:
        super(diameter);
        // Only add speed (velocity vector length), custom sprite and initialize:
        this._speed = 500;
        this._sprite = 'images/char-pink-girl.png';
        Resources.load(this._sprite);
        this.init();
    }

    init() {
        // Put player to its starting position:
        this._gridPositionTarget = {x: 2, y: 5};
        // The player moves along the grid so we need its current grid target position as well:
        this._position = {x: this._gridPositionTarget.x * ctx.columnWidth, y: this._gridPositionTarget.y * ctx.rowHeight};
        // Starting velocity is 0:
        this._velocity = {x: 0, y: 0};
    }

    win() {
        // When the player wins, it switches appearance:
        const playerShapes = ["images/char-boy.png", "images/char-cat-girl.png", "images/char-horn-girl.png", "images/char-pink-girl.png", "images/char-princess-girl.png"];
        this._sprite = playerShapes[(playerShapes.findIndex(e => e === this._sprite) + 1) % playerShapes.length]
        Resources.load(this._sprite);
        for (let enemy of allEnemies) {
            enemy._velocity.x *= 20;
            enemy._velocity.y *= 20;
        }
        this.init();
    }

    handleInput(keyCode) {
        if (keyCode) {
            // Only take input, when player is not moving:
            if (Math.abs(this._velocity.x) < 1 && Math.abs(this._velocity.y) < 1) {
                const vectorTable = {
                    left: {x: -1, y: 0},
                    right: {x: 1, y: 0},
                    up: {x: 0, y: -1},
                    down: {x: 0, y: 1}
                }
                const vector = vectorTable[keyCode];
                // Set velocity vector to have player already try and move a bit:
                this._velocity = {x: this._speed * vector.x, y: this._speed * vector.y};
                // Calculate new target:
                const gridPositionNewTarget = {
                    x: this._gridPositionTarget.x + vector.x,
                    y: this._gridPositionTarget.y + vector.y
                }
                // But accept it only if it's allowed (in the grid):
                if (gridPositionNewTarget.x > -1 && gridPositionNewTarget.x < 5 && gridPositionNewTarget.y > -1 && gridPositionNewTarget.y < 6) {
                    this._gridPositionTarget = gridPositionNewTarget;
                }
            }
        }
    }

    update(dt = 0) {
        // The player moves to its current target position - stop the movement when the target is reached:
        const targetPosition = {x: this._gridPositionTarget.x * ctx.columnWidth, y: this._gridPositionTarget.y * ctx.rowHeight};
        // (Check whether the current velocity drove the player over the target. Safest way to check as tick might change.)
        if (this._velocity.x * (targetPosition.x - this._position.x) < 0 || this._velocity.y * (targetPosition.y - this._position.y) < 0) {
            this._position = targetPosition;
            this._velocity = {x: 0, y: 0};
        }
        // The player can hit an enemy. If it does the player should be reset:
        for (let e of allEnemies) {
            const dx = this._position.x - e._position.x;
            const dy = this._position.y - e._position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const touchDistance = (this.diameter + e.diameter) * 0.5;
            if (distance < touchDistance) {
                // e._velocity = {x: -800, y: 0};
                this.init();
            }
        }
        // The player can win. If it does, make it jump:
        if (this._position.y < ctx.rowHeight * 0.1) {
            this.win();
        }
        // Update:
        super.update(dt);
    }

}

// Instantiate objects:
// Place all enemy objects in an array called allEnemies
let allEnemies = [];
for (i = 0; i < 10; i++) {
    allEnemies.push(new Enemy);
}
// Place the player object in a variable called player
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
