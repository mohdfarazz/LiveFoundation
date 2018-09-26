var game = new Phaser.Game(500, 500, Phaser.AUTO, 'gameDiv');

var majorState = {

    preload: function () {
        game.stage.backgroundColor = '#808080';

        if (!game.device.desktop) {
            game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            game.scale.setMinMax(250, 250, 500, 500);
        }

        game.scale.pageAlignHorizontally = true;

        game.load.audio('coin', ['assets/coin.wav', 'assets/coin.mp3']);
        game.load.audio('move', ['assets/move.wav', 'assets/move.mp3']);
        game.load.audio('hit', ['assets/hit.wav', 'assets/hit.mp3']);

        game.load.image('square', 'assets/square.png');
        game.load.image('coin', 'assets/coin.png');
        game.load.image('particle', 'assets/particle.png');
        game.load.image('particle2', 'assets/particle2.png');
        game.load.image('enemy', 'assets/enemy.png');
        game.load.image('secondenemy', 'assets/enemy2.png');
        game.load.image('map', 'assets/map2.png');
    },

    create: function () {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.forceSingleUpdate = true;
        game.renderer.renderSession.roundPixels = true;

        this.cursor = game.input.keyboard.createCursorKeys();

        if (!game.device.desktop) {
            this.onDown = { x: 0, y: 0 };
            game.input.onDown.add(this.clickDown, this);
        }

        this.score = 0;
        this.bestScore = 0;
        this.count = 0;
        this.speed = 100;
        this.nextEnemy = game.time.now;
        this.menuScene = true;
        this.isMoving = false;
        this.coinTaking = false;
        this.movedDown = false;
        this.movedUp = false;
        this.movedLeft = false;
        this.movedRight = false;
        this.mobileMoving = false;

        this.loadLabels();
        this.loadLevel();
        this.loadSounds();
        this.loadParticles();
    },

    update: function () {
        game.physics.arcade.overlap(this.square, this.coin, this.takeCoin, null, this);
        game.physics.arcade.overlap(this.square, this.enemies, this.squareHit, null, this);
        game.physics.arcade.overlap(this.square, this.secondenemies, this.squareHit2, null, this);
        game.physics.arcade.overlap(this.square, this.coins, this.takeCoinMy, null, this);

        this.movePlayer();
        this.spawnEnemies();
        this.mobileInputs();
    },

    spawnEnemies: function () {

        if (game.time.now < this.nextEnemy || this.menuScene)
            return;

        if (game.device.desktop) {
            var start = 1300, end = 500, score = 40;
            var delay = Math.max(start - (start - end) * this.score / score, end);
            this.nextEnemy = game.time.now + delay + 200;
        }
        else {
            var start = 1500, end = 700, score = 40;
            var delay = Math.max(start - (start - end) * this.score / score, end);
            this.nextEnemy = game.time.now + delay;
        }

        var patterns = [];

        patterns[0] = [
            [{ i: -1, j: -1, ver: true, speed: 1 }], [{ i: -1, j: 0, ver: true, speed: 1 }], [{ i: -1, j: 1, ver: true, speed: 1 }],
            [{ i: 1, j: -1, ver: true, speed: 1 }], [{ i: 1, j: 0, ver: true, speed: 1 }], [{ i: 1, j: 1, ver: true, speed: 1 }],
            [{ i: -1, j: -1, ver: false, speed: 1 }], [{ i: 0, j: -1, ver: false, speed: 1 }], [{ i: 1, j: -1, ver: false, speed: 1 }]
        ];
        var e = patterns[0][game.rnd.integerInRange(0, patterns[0].length - 1)];


        patterns[1] = [
           [{ i: 1, j: -1, ver: true, speed: 1 }], [{ i: 1, j: 0, ver: true, speed: 1 }], [{ i: 1, j: 1, ver: true, speed: 1 }],
           [{ i: -1, j: -1, ver: true, speed: 1 }], [{ i: -1, j: 0, ver: true, speed: 1 }], [{ i: -1, j: 1, ver: true, speed: 1 }],
           [{ i: -1, j: -1, ver: false, speed: 1 }], [{ i: 0, j: -1, ver: false, speed: 1 }], [{ i: 1, j: -1, ver: false, speed: 1 }]
        ];
        var e2 = patterns[1][game.rnd.integerInRange(0, patterns[1].length - 1)];


        patterns[2] = [
              [{ i: -1, j: -1, ver: false, speed: 1 }], [{ i: 0, j: -1, ver: false, speed: 1 }], [{ i: 1, j: -1, ver: false, speed: 1 }],
          [{ i: 1, j: -1, ver: true, speed: 1 }], [{ i: 1, j: 0, ver: true, speed: 1 }], [{ i: 1, j: 1, ver: true, speed: 1 }],
          [{ i: -1, j: -1, ver: true, speed: 1 }], [{ i: -1, j: 0, ver: true, speed: 1 }], [{ i: -1, j: 1, ver: true, speed: 1 }],

        ];

        var e3 = patterns[2][game.rnd.integerInRange(0, patterns[2].length - 1)];

        //minimum object patterns 
        patterns[3] = [
             [{ i: -1, j: -1, ver: false, speed: 1 }], [{ i: 0, j: -1, ver: false, speed: 1 }], [{ i: 1, j: -1, ver: false, speed: 1 }],
         [{ i: 1, j: -1, ver: true, speed: 1 }], [{ i: 1, j: 0, ver: true, speed: 1 }],
        ];
        var e4 = patterns[3][game.rnd.integerInRange(0, patterns[3].length - 1)];

        if (this.score < 0) {
            this.gameOver();
        }

        for (var i = 0; i < e.length; i++) {
            this.addEnemy(e[i].i, e[i].j, e[i].ver, e[i].speed * 1);
            this.addEnemy2(e2[i].i, e2[i].j, e2[i].ver, e2[i].speed * 1);
            this.addCoin(e3[i].i, e3[i].j, e3[i].ver, e3[i].speed * 1);
        }

        if (this.score > 11)
            for (var i = 0; i < e.length; i++) {
                this.addEnemy(e4[i].i, e4[i].j, e4[i].ver, e4[i].speed * 1);              
            }


    },

    addEnemy: function (i, j, ver, speed) {

        var enemy = this.enemies.getFirstDead();

        if (!enemy)
            return;
        var tmpX, tmpY;
        if (ver) {
            enemy.reset(game.width / 2 + i * 8 * 8 + i * 190, game.height / 2 + j * 8 * 8);
            enemy.body.velocity.x = -100 * i * speed;
        }
        else {
            enemy.reset(game.width / 2 + i * 8 * 8, game.height / 2 + j * 8 * 8 + j * 190);
            enemy.body.velocity.y = -100 * j * speed;
        }

        enemy.anchor.setTo(0.5);
        enemy.checkWorldBounds = true;
        enemy.outOfBoundsKill = true;
    },
    addEnemy2: function (i, j, ver, speed) {

        var secondenemy = this.secondenemies.getFirstDead();

        if (!secondenemy)
            return;

        var tmpX, tmpY;
        if (ver) {
            secondenemy.reset(game.width / 2 + i * 8 * 8 + i * 190, game.height / 2 + j * 8 * 8);
            secondenemy.body.velocity.x = -100 * i * speed;
        }
        else {
            secondenemy.reset(game.width / 2 + i * 8 * 8, game.height / 2 + j * 8 * 8 + j * 190);
            secondenemy.body.velocity.y = -100 * j * speed;
        }

        secondenemy.anchor.setTo(0.5);
        secondenemy.checkWorldBounds = true;
        secondenemy.outOfBoundsKill = true;
    },

    clickDown: function () {
        this.onDown = { x: game.input.x, y: game.input.y };
    },

    clickDown: function () {
        this.onDown = { x: game.input.x, y: game.input.y };
    },
    squareHit: function (s, e) {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.labelBest.text = "best: " + this.bestScore;
        }

        this.emitter2.x = e.x;
        this.emitter2.y = e.y;
        this.emitter2.start(true, 800, null, 20);

        e.kill();
        this.hitSound.play();
        this.updateScore(-5);

        game.add.tween(this.map.scale).to({ x: 1.1, y: 1.1 }, 50).to({ x: 1, y: 1 }, 100).start();
    },
    squareHit2: function (s, e) {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.labelBest.text = "best: " + this.bestScore;
        }

        this.emitter2.x = e.x;
        this.emitter2.y = e.y;
        this.emitter2.start(true, 800, null, 20);

        e.kill();
        this.hitSound.play();

        var hsc = parseInt(Math.sqrt(this.score).toFixed(0));
        this.updateSquareScore(hsc);
        game.add.tween(this.map.scale).to({ x: 1.1, y: 1.1 }, 50).to({ x: 1, y: 1 }, 100).start();
    },
    takeCoinMy: function (s, e) {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.labelBest.text = "best: " + this.bestScore;
        }

        this.emitter2.x = e.x;
        this.emitter2.y = e.y;
        this.emitter2.start(true, 800, null, 20);

        e.kill();
        this.hitSound.play();
       
        this.updateScore(5);

        game.add.tween(this.map.scale).to({ x: 1.1, y: 1.1 }, 50).to({ x: 1, y: 1 }, 100).start();
    },
    takeCoin: function () {
        if (this.coinTaking)
            return;

        this.coinTaking = true;
        this.menuScene = false;

        this.emitter.x = this.coin.x;
        this.emitter.y = this.coin.y;
        this.emitter.start(true, 800, null, 20);

        this.coinSound.play();
        this.updateScore(5);

        var t = game.add.tween(this.coin.scale).to({ x: 0, y: 0 }, 100).start();
        game.time.events.add(500, this.addCoin, this);
    },

    updateScore: function (sc) {
        this.score = this.score + sc;
        this.labelScore.text = this.score;
    
    },
    updateSquareScore: function (sc) {
        if (isNaN(sc))
            sc = 1;
        this.score = sc;
        this.labelScore.text = this.score;

    },

    addCoin: function (i, j, ver, speed) { 
        var coin = this.coins.getFirstDead();

        if (!coin)
            return;

        var tmpX, tmpY;
        if (ver) {
            coin.reset(game.width / 2 + i * 8 * 8 + i * 190, game.height / 2 + j * 8 * 8);
            coin.body.velocity.x = -100 * i * speed;
        }
        else {
            coin.reset(game.width / 2 + i * 8 * 8, game.height / 2 + j * 8 * 8 + j * 190);
            coin.body.velocity.y = -100 * j * speed;
        }

        coin.anchor.setTo(0.5);
        coin.checkWorldBounds = true;
        coin.outOfBoundsKill = true;
 
    },

    moveDown: function () {
        var t, newPos;

        if (this.square.y < game.height / 2 + 8 * 8) {
            newPos = this.square.y + this.square.height + 12;
            t = game.add.tween(this.square).to({ y: newPos }, this.speed).start();
        }
        else {
            newPos = this.square.y + this.square.height / 3;
            t = game.add.tween(this.square).to({ y: newPos }, this.speed / 2).to({ y: this.square.y }, this.speed / 2).start();
        }

        this.moveSound.play();
        this.isMoving = true;
        t.onComplete.add(this.moveOver, this);
    },

    moveUp: function () {
        var t, newPos;

        if (this.square.y > game.height / 2 - 8 * 8) {
            newPos = this.square.y - this.square.height - 12;
            var t = game.add.tween(this.square).to({ y: newPos }, this.speed).start();
        }
        else {
            newPos = this.square.y - this.square.height / 3;
            var t = game.add.tween(this.square).to({ y: newPos }, this.speed / 2).to({ y: this.square.y }, this.speed / 2).start();
        }

        this.moveSound.play();
        this.isMoving = true;
        t.onComplete.add(this.moveOver, this);
    },

    moveRight: function () {
        var t, newPos;

        if (this.square.x < game.width / 2 + 8 * 8) {
            newPos = this.square.x + this.square.width + 12;
            var t = game.add.tween(this.square).to({ x: newPos }, this.speed).start();
        }
        else {
            newPos = this.square.x + this.square.width / 3;
            var t = game.add.tween(this.square).to({ x: newPos }, this.speed / 2).to({ x: this.square.x }, this.speed / 2).start();
        }

        this.moveSound.play();
        this.isMoving = true;
        t.onComplete.add(this.moveOver, this);
    },

    moveLeft: function () {
        var t, newPos;

        if (this.square.x > game.width / 2 - 8 * 8) {
            newPos = this.square.x - this.square.width - 12;
            var t = game.add.tween(this.square).to({ x: newPos }, this.speed).start();
        }
        else {
            newPos = this.square.x - this.square.width / 3;
            var t = game.add.tween(this.square).to({ x: newPos }, this.speed / 2).to({ x: this.square.x }, this.speed / 2).start();
        }

        this.moveSound.play();
        this.isMoving = true;
        t.onComplete.add(this.moveOver, this);
    },

    movePlayer: function () {
        var speed = 150;
        var t;

        if (this.isMoving)
            return;

        if (this.cursor.down.isDown && !this.movedDown) {
            this.movedDown = true;
            this.moveDown(speed);
            return;
        }
        else if (this.cursor.down.isUp) {
            this.movedDown = false;
        }

        if (this.cursor.up.isDown && !this.movedUp) {
            this.movedUp = true;
            this.moveUp();
            return;
        }
        else if (this.cursor.up.isUp) {
            this.movedUp = false;
        }

        if (this.cursor.left.isDown && !this.movedLeft) {
            this.movedLeft = true;
            this.moveLeft();
            return;
        }
        else if (this.cursor.left.isUp) {
            this.movedLeft = false;
        }

        if (this.cursor.right.isDown && !this.movedRight) {
            this.movedRight = true;
            this.moveRight();
            return;
        }
        else if (this.cursor.right.isUp) {
            this.movedRight = false;
        }
    },

    moveOver: function () {
        this.isMoving = false;
    },

    loadSounds: function () {
        this.coinSound = game.add.audio('coin');
        this.coinSound.volume = 0.5;
        this.moveSound = game.add.audio('move');
        this.moveSound.volume = 0.2;
        this.hitSound = game.add.audio('hit');
        this.music = game.add.audio('music');
        this.music.loop = true;
        this.music.sound = 0.8;
        this.music.play();
    },

    loadParticles: function () {
        this.emitter = game.add.emitter(0, 0);
        this.emitter.makeParticles('particle');
        this.emitter.setXSpeed(-150, 150);
        this.emitter.setYSpeed(-150, 150);
        this.emitter.setScale(2, 0, 2, 0, 800);
        this.emitter2 = game.add.emitter(0, 0);
        this.emitter2.makeParticles('particle2');
        this.emitter2.setXSpeed(-150, 150);
        this.emitter2.setYSpeed(-150, 150);
        this.emitter2.setScale(2, 0, 2, 0, 800);
    },

    loadLevel: function () {
        this.coin = game.add.sprite(game.width / 2 + 2 * 2, game.height / 2 - 2 * 2, 'coin');
        this.coin.anchor.setTo(0.5);
        game.physics.arcade.enable(this.coin);

        this.map = game.add.sprite(game.width / 2, game.height / 2, 'map');
        this.map.anchor.setTo(0.5);

        this.square = game.add.sprite(game.width / 2 - 8 * 8, game.height / 2 + 8 * 8, 'square');
        this.square.anchor.setTo(0.5);
        game.physics.arcade.enable(this.square);

        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        this.enemies.createMultiple(12, 'enemy');

        this.secondenemies = game.add.group();
        this.secondenemies.enableBody = true;
        this.secondenemies.createMultiple(12, 'secondenemy');

        this.coins = game.add.group();
        this.coins.enableBody = true;
        this.coins.createMultiple(12, 'coin');
    },

    loadLabels: function () {
        var text;
        if (game.device.desktop)
            text = "use arrow keys to start the game";
        else
            text = "swipe on the screen to take the coin";

        this.labelName = game.add.text(game.width / 2, (game.height - 200) / 4, "THE HIT", { font: "25px Arial", fill: "#ffffff" });
        this.labelName.anchor.setTo(0.5);

        this.labelTuto = game.add.text(game.width / 2, game.height - (game.height - 200) / 4, text, { font: "25px Arial", fill: "#ffffff" });
        this.labelTuto.anchor.setTo(0.5);

        this.labelBest = game.add.text(game.width / 2, game.height - (game.height - 200) / 4, "best: 0", { font: "25px Arial", fill: "#ffffff" });
        this.labelBest.anchor.setTo(0.5);
        this.labelBest.alpha = 0;

        this.labelScore = game.add.text(game.width / 2, game.height / 2 + 5, "", { font: "100px Arial", fill: "#ffffff" });
        this.labelScore.anchor.setTo(0.5);
        this.labelScore.alpha = 0.2;
    },

    mobileInputs: function () {
        if (this.score == 3 && this.labelTuto.alpha == 1) {
            game.add.tween(this.labelTuto).to({ alpha: 0 }, 1000).start();
            var t = game.add.tween(this.labelName).to({ alpha: 0 }, 1000).start();
            t.onComplete.add(function () {
                game.add.tween(this.labelBest).to({ alpha: 1 }, 1000).start();
            }, this);
        }

        if (game.input.activePointer.isDown && !this.mobileMoving && !game.device.desktop) {
            var distX = Math.abs(game.input.x - this.onDown.x);
            var distY = Math.abs(game.input.y - this.onDown.y);

            if (distX > distY && distX > 40 && !this.isMoving) {
                this.mobileMoving = true;
                if (this.onDown.x > game.input.x)
                    this.moveLeft();
                else
                    this.moveRight();
            }
            else if (distX < distY && distY > 40 && !this.isMoving) {
                this.mobileMoving = true;
                if (this.onDown.y > game.input.y)
                    this.moveUp();
                else
                    this.moveDown();
            }
        }
        else if (!game.input.activePointer.isDown)
            this.mobileMoving = false;
    },
    gameOver: function () {
        // stop the game (update() function no longer called)
        game.destroy();    
    }
};

game.state.add('major', majorState);
game.state.start('major');