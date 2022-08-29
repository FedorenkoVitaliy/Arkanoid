import background from '../img/background.png'
import ball from '../img/ball.png'
import block from '../img/block.png'
import platform from '../img/platform.png'

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
        this.ball = {
            x: 320,
            y: 280,
            width: 20,
            height: 20
        };
        this.platform = {
            x: 280,
            y: 300,
            velocity: 6,
            dx: 0,
        };
    }

    setEvents = () => {
        window.addEventListener("keydown", (e) => {
            if(e.keyCode === 37){
                this.platform.dx = -this.platform.velocity
            }

            if(e.keyCode === 39){
                this.platform.dx = this.platform.velocity
            }
            //this.run();
        })
        window.addEventListener("keyup", (e) => {
            if (e.keyCode === 37 || e.keyCode === 39){
                this.platform.dx = 0
            }
            //this.run();
        })
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
        await this.imageLoader('platform', platform);
        await this.imageLoader('ball', ball);
        await this.imageLoader('block', block);

        await callBack();
    }

    create = () => {
        for(let row = 0; row < this.rows; row++ ) {
            for(let col = 0; col < this.cols; col++ ) {
                this.blocks.push({
                    x: 64 * col + 65,
                    y: 24 * row + 35,
                })
            }
        }
    }

    update = () => {
        if(this.platform.dx){
            this.platform.x += this.platform.dx
        }
    }

    run = () => {
        window.requestAnimationFrame(() => {
            this.update();
            this.render();
            this.run(); // I think not good solution
        })
    }

    render = () => {
        this.ctx.drawImage(this.sprite.background, 0, 0);
        this.ctx.drawImage(this.sprite.ball, 0, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        this.ctx.drawImage(this.sprite.platform, this.platform.x, this.platform.y);
        this.blocks.forEach((block) => {
            this.ctx.drawImage(this.sprite.block, block.x, block.y);
        })
        console.log('render')
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
