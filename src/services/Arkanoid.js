import background from '../img/background.png'
import ballImg from '../img/ball.png'
import blockImg from '../img/block.png'
import platformImg from '../img/platform.png'

const KEYS = {
    LEFT: 37,
    RIGHT: 39,
    SPACE: 32,
    ESC: 27,
}

export const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

class Ball {
    constructor() {
        this.x = 320;
        this.y = 280;
        this.width = 20;
        this.height = 20;
        this.velocity = 2;
        this.dx = 0;
        this.dy = 0;
    }

    start = () => {
        this.dy = -this.velocity;
        this.dx = randomNumber(-this.velocity, this.velocity);
    }

    collide = (element) => {
        let nextX = this.x + this.dx;
        let nextY = this.y + this.dy;

        return (
            nextX + this.width > element.x &&
            nextX < element.x + element.width &&
            nextY + this.height > element.y &&
            nextY < element.y + element.height
        );
    }

    bumpBlock = () => {
        this.dy *= -1;
    }
    bumpPlatform = (platform) => {
        let touchX = this.x + this.width / 2;
        this.dy *= -1;
        this.dx = this.velocity * platform.getTouchOffset(touchX);
    }

    move = () => {
        if(this.dy){
            this.y += this.dy;
        }
        if(this.dx){
            this.x += this.dx;
        }
    }
 }

class Platform {
    constructor(ball) {
        this.x = 280;
        this.y = 300;
        this.width = 100;
        this.height = 14;
        this.velocity = 6;
        this.dx = 0;
        this.ball = ball;
    }

    start = (keyCode) => {
        if(keyCode === KEYS.LEFT){
            this.dx = -this.velocity
        }
        if(keyCode === KEYS.RIGHT){
            this.dx = this.velocity
        }
    }

    stop = () => this.dx = 0;

    fire = () => {
        this.ball.start();
        this.ball = null;
    }

    getTouchOffset = (x) => {
        let diff = (this.x + this.width) - x;
        let offset = this.width - diff;
        let result = 2 * offset / this.width;

        return result - 1;
    }

    move = () => {
        if(this.dx){
            this.x += this.dx;

            if(this.ball){
                this.ball.x += this.dx;
            }
        }
    }
}

class FortuneWheelService {
    constructor() {
        this.ctx = null;
        this.sprite = {
            background: null,
            ball: null,
            block: null,
            platform: null,
        };
        this.blocks = [];
        this.rows = 4;
        this.cols = 8;
        this.width = 640;
        this.height = 360;
        this.ball = new Ball();
        this.platform = new Platform(this.ball);
    }

    setEvents = () => {
        window.addEventListener("keydown", (e) => {
            if(e.keyCode === KEYS.SPACE){
                this.platform.fire();
            }
            if(e.keyCode === KEYS.ESC){
                this.reset();
            }
            else if(e.keyCode === KEYS.LEFT || e.keyCode === KEYS.RIGHT){
                this.platform.start(e.keyCode);
            }

        })
        window.addEventListener("keyup", (e) => {
            if (e.keyCode === KEYS.LEFT || e.keyCode === KEYS.RIGHT) {
                this.platform.stop();
            }
        })
    }

    reset = () => {
        this.ball.dy = 0;
        this.ball.y = 280;
        this.ball.x = 320;
        this.platform.dx = 0;
        this.platform.x = 280;
    }

    init = (canvasId) => {
        this.ctx = document.getElementById(canvasId).getContext('2d');
        this.setEvents();
    }

    imageLoader = (name, img) => {
        return new Promise((resolve, reject) => {
            this.sprite[name] = new Image();
            this.sprite[name].src = img;
            this.sprite[name].onload = () => resolve()
            this.sprite[name].onerror = reject
        })
    }

    preload = async (callBack) => {
        await this.imageLoader('background', background);
        await this.imageLoader('platform', platformImg);
        await this.imageLoader('ball', ballImg);
        await this.imageLoader('block', blockImg);

        await callBack();
    }

    create = () => {
        for(let row = 0; row < this.rows; row++ ) {
            for(let col = 0; col < this.cols; col++ ) {
                this.blocks.push({
                    x: 64 * col + 65,
                    y: 24 * row + 35,
                    width: 40,
                    height: 20,
                })
            }
        }
    }

    collideBlocks = () => {
        this.blocks.forEach(block => {
            if(this.ball.collide(block)){
                this.ball.bumpBlock()
            }
        })
    }

    collidePlatform = () => {
        if(this.ball.collide(this.platform)){
            this.ball.bumpPlatform(this.platform);
        }
    }

    update = () => {
        this.platform.move();
        this.ball.move();
        this.collideBlocks();
        this.collidePlatform();
    }

    run = () => {
        window.requestAnimationFrame(() => {
            this.update();
            this.render();
            this.run(); // I think not good solution
        })
    }

    render = () => {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.drawImage(this.sprite.background, 0, 0);
        this.ctx.drawImage(this.sprite.ball, 0, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        this.ctx.drawImage(this.sprite.platform, this.platform.x, this.platform.y);
        this.blocks.forEach((block) => {
            this.ctx.drawImage(this.sprite.block, block.x, block.y);
        })
    }

    start = (canvasId) => {
        this.init(canvasId);
        this.preload(() => {
            this.create();
            window.addEventListener('load', () => {
                this.run();
            });
        });
    }
}

const service = new FortuneWheelService();

export default service;
