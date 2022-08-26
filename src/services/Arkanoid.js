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
        this.platform = {
            x: 280,
            y: 300
        }
        this.ball = {
            x: 320,
            y: 280,
            width: 20,
            height: 20
        }
    }

    init = (canvasId) => {
        this.ctx = document.getElementById(canvasId).getContext('2d');
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
        await this.imageLoader('ball', ball);
        await this.imageLoader('block', block);
        await this.imageLoader('platform', platform);
        await callBack();
    }

    run = () => {
        window.addEventListener('load', () => {
            window.requestAnimationFrame(() => {
                this.ctx.drawImage(this.sprite.background, 0, 0);
                this.ctx.drawImage(this.sprite.ball, 0, 0, this.ball.width, this.ball.height, this.ball.x, this.ball.y, this.ball.width, this.ball.height);
                this.ctx.drawImage(this.sprite.block, 0, 0);
                this.ctx.drawImage(this.sprite.platform, this.platform.x, this.platform.y);
            });
        })
    }

    start = (canvasId) => {
        this.init(canvasId);
        this.preload(this.run);
    }
}

const service = new FortuneWheelService();

export default service;
