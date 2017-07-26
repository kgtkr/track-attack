phina.globalize();

var W = 480;
var H = 640;
var ASSETS = {
    image: {
        back: "back.png",
        blood: "blood.png",
        char: "char.png",
        track: "track.png",
        enemy: "enemy.png",
    }
};
var SPEED = 5;

//ゲームシーン
phina.define("MainScene", {
    superClass: "CanvasScene",
    init: function () {
        this.superInit();
        let self=this;

        this.back = Sprite("back").addChildTo(this);
        this.back.origin.set(0, 0);
        this.back.update = function (app) {
            this.y+=SPEED;
            if (this.y > H) {
                this.y = 0;
            }
        }

        this.back2 = Sprite("back").addChildTo(this);
        this.back2.origin.set(0, 0);
        this.back2.y = -H;
        this.back2.update = function (app) {
            this.y+=SPEED;
            if (this.y > 0) {
                this.y = -H;
            }
        }

        this.track = Sprite("track", 50, 100).addChildTo(this);
        this.track.x = W / 2;
        this.track.y = H - 100;
        this.track.life = 5;
        this.track.update = function (app) {
            var p = app.pointer;
            var vx = p.x - this.x;
            if (Math.abs(vx) > 50) {//50以上離れている
                if (vx > 0) {
                    this.x += 2;
                } else {
                    this.x -= 2;
                }
            }
        }

        this.char = CanvasElement().addChildTo(this);
        this.enemy = CanvasElement().addChildTo(this);
        this.enemyB = CanvasElement().addChildTo(this);

        this.score = 0;

        this.scoreL = Label().addChildTo(this);
        this.scoreL.top = 10;
        this.scoreL.fill = "green";
        this.scoreL.update = function (app) {
            this.text = "Score:" + self.score;
            this.left = 100;
        };

        this.lifeL = Label().addChildTo(this);
        this.lifeL.top = 50;
        this.lifeL.fill = "green";
        this.lifeL.update = function (app) {
            this.text = "Life:" + self.track.life;
            this.left = 100;
        };

    },

    update: function (app) {
        //人出現
        if (Math.randint(0, 9) == 0) {
            let char = Sprite("char", 10, 20).addChildTo(this.char);
            char.moveX = Math.randfloat(-1, 1);
            char.moveY = Math.randfloat(-1, 1);
            char.x = Math.randfloat(0, W);
            char.alive = true;
            char.update = function (app) {
                if (this.alive) {
                    this.x += this.moveX;
                    this.y += this.moveY;
                }
                this.y += SPEED;
                if (this.y > H) {
                    this.remove();
                }
            }

            char.die = function () {
                this.image = "blood";
                this.alive = false;
            }
        }

        //敵出現
        if (Math.randint(0, 120) == 0) {
            let enemy = Sprite("enemy").addChildTo(this.enemy);
            enemy.x = Math.randbool() ? 0 + 10 : W - 10;
            let self = this;
            enemy.update = function (app) {
                //真横から撃たれると絶対避けられないので、上3/1にいるときのみ撃つ
                if (this.y < H / 3 && Math.randint(0, 29) == 0) {
                    //発射
                    let b = CircleShape({ x: this.x, y: this.y, radius: 5, fill: "yellow" }).addChildTo(self.enemyB);
                    let v = new Vector2(self.track.x - b.x, self.track.y - b.y);
                    v.fromAngle(v.toAngle()+Math.randfloat(-0.3,0.3), 8)
                    b.vec=v;

                    b.update = function (app) {
                        this.x += this.vec.x;
                        this.y += this.vec.y;
                    };
                }
                this.y += SPEED;
            }
        }

        //当たり判定
        for(let c of this.char.children) {
            if (c.hitTestElement(this.track)) {
                if (c.alive) {
                    c.die();
                    this.score++;
                }
            }
        }

        for(let b of this.enemyB.children) {
            if (b.hitTestElement(this.track)) {
                b.remove();
                this.track.life--;
                if (this.track.life == 0) {
                    this.exit("result", { score: this.score });
                }
            }
        }
    }
});

// メイン処理
phina.main(function () {
    var app = GameApp({
        width: W,
        height: H,
        fps: 60,
        title: "TrackAttack",
        assets: ASSETS,
        fit:false
    });
    app.run();
});
