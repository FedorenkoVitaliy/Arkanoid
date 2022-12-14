import background from '../img/background.png'
import ballImg from '../img/ball.png'
import blockImg from '../img/block.png'
import platformImg from '../img/platform.png'
import bumpSong from '../sounds/bump.mp3'
import winSong from '../sounds/win.wav'
import overSong from '../sounds/over.wav'

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
        this.frame = 0;
    }

    animate = () => {
        setInterval(() => {
            ++this.frame;
            if(this.frame>3) {
                this.frame = 0;
            }
        }, 100)
    }

    start = () => {
        this.dy = -this.velocity;
        this.dx = randomNumber(-this.velocity, this.velocity);
        this.animate();
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

    collideWorldBounds = (onCollide, gameOver) => {
        const nextX = this.x + this.dx;
        const nextY = this.y + this.dy;

        const ballPosition = {
            left: nextX,
            top: nextY,
            right: nextX + this.width,
            bottom: nextY + this.height,
        }

        const worldPosition = {
            left: 0,
            top: 0,
            right: 640,
            bottom: 360,
        }

        if (ballPosition.left <= worldPosition.left){
            this.x = worldPosition.left;
            this.dx *= -1;
            onCollide();
        }

        if(ballPosition.right >= worldPosition.right){
            this.x = worldPosition.right - this.width;
            this.dx *= -1;
            onCollide();
        }

        if (ballPosition.top <= worldPosition.top){
            this.y = worldPosition.top;
            this.dy *= -1;
            onCollide();
        }

        if (ballPosition.bottom > worldPosition.bottom){
            gameOver();
        }
    }

    bumpBlock = (block) => {
        this.dy *= -1;

        block.active = false
    }

    bumpPlatform = (platform) => {
        if(platform.dx){
            this.x += platform.dx;
        }
        if(this.dy > 0) {
            let touchX = this.x + this.width / 2;
            this.dy = -this.velocity;
            this.dx = this.velocity * platform.getTouchOffset(touchX);
        }
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

    collideWorldBounds = () => {
        const nextX = this.x + this.dx;

        const platformPosition = {
            left: nextX,
            right: nextX + this.width,
        }

        const worldPosition = {
            left: 0,
            top: 0,
            right: 640,
            bottom: 360,
        }

        if (platformPosition.left < worldPosition.left || platformPosition.right > worldPosition.right){
            this.dx = 0;
        }
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
        this.sounds = {
            bump: null,
            win: null,
            over: null,
        }
        this.blocks = [];
        this.rows = 4;
        this.cols = 8;
        this.score = 0;
        this.width = 640;
        this.height = 360;
        this.ball = new Ball();
        this.platform = new Platform(this.ball);
        this.inProgress = false;
    }

    setEvents = () => {
        window.addEventListener("keydown", (e) => {
            if(e.keyCode === KEYS.SPACE){
                this.platform.fire();
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

    init = (canvasId) => {
        this.ctx = document.getElementById(canvasId).getContext('2d');
        this.setTextStyle();
        this.setEvents();
    }

    setTextStyle = () => {
        this.ctx.font = '20px Arial';
        this.ctx.fillStyle = '#FFFFFF';
    }

    imageLoader = (name, img) => {
        return new Promise((resolve, reject) => {
            this.sprite[name] = new Image();
            this.sprite[name].src = img;
            this.sprite[name].onload = () => resolve()
            this.sprite[name].onerror = reject
        })
    }

    soundLoader = (name, sound) => {
        return new Promise((resolve, reject) => {
            this.sounds[name] = new Audio(sound);

            this.sounds[name].addEventListener(
                'canplaythrough',
                () => resolve(this.sounds),
                { once: true }
            );
            this.sounds[name].onerror = reject
        })
    }

    playSong = (name) => {
       this.sounds[name].currentTime = 0;
       this.sounds[name].play();
    }

    preload = async (callBack) => {
        await this.imageLoader('background', background);
        await this.imageLoader('platform', platformImg);
        await this.imageLoader('ball', ballImg);
        await this.imageLoader('block', blockImg);
        await this.soundLoader('bump', bumpSong);
        await this.soundLoader('win', winSong);
        await this.soundLoader('over', overSong);

        await callBack();
    }

    createBlocks = () => {
        for(let row = 0; row < this.rows; row++ ) {
            for(let col = 0; col < this.cols; col++ ) {
                this.blocks.push({
                    x: 64 * col + 65,
                    y: 24 * row + 35,
                    width: 40,
                    height: 20,
                    active: true
                })
            }
        }
    }

    increaseScore = () => {
        this.score++;

        if(this.score >= this.blocks.length){
            this.end('Game win', 'win');
        }
    }

    collideBlocks = () => {
        this.blocks.forEach(block => {
            if(block.active && this.ball.collide(block)){
                this.ball.bumpBlock(block)
                this.increaseScore()
                this.playSong('bump')
            }
        })
    }

    collidePlatform = () => {
        if(this.ball.collide(this.platform)){
            this.ball.bumpPlatform(this.platform);
            this.playSong('bump')
        }
    }

    update = () => {
        this.platform.move();
        this.ball.move();
        this.collideBlocks();
        this.collidePlatform();
        this.ball.collideWorldBounds(
            () => this.playSong('bump'),
            () => this.end('Game over', 'over'));
        this.platform.collideWorldBounds();
    }

    run = () => {
       window.requestAnimationFrame(() => {
           this.update();
           this.render();
           if(this.inProgress){
               this.run();
           }
       })
    }

    render = () => {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.ctx.drawImage(this.sprite.background, 0, 0);
        this.ctx.drawImage(this.sprite.ball, this.ball.frame * this.ball.width, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        this.ctx.drawImage(this.sprite.platform, this.platform.x, this.platform.y);
        this.blocks.forEach((block) => {
            if(block.active){
                this.ctx.drawImage(this.sprite.block, block.x, block.y);
            }
        })

        this.ctx.fillText(`Score: ${this.score}`, 15, 340);
    }

    start = (canvasId) => {
        this.inProgress = true;
        this.init(canvasId);
        this.preload(() => {
            this.createBlocks();
            this.run();
        });
    }

    end = (message, sound) => {
        this.playSong(sound)
        this.inProgress = false;
        alert(message);
        window.location.reload();
    }

}

const service = new FortuneWheelService();

export default service;
