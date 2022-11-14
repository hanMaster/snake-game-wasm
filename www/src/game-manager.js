import {Game, Vector} from 'wasm-snake-game';

import CONFIG from './config';
import {View} from './view'
import {Controller} from './controller';
import Storage from './storage';

export class GameManager {
    constructor() {
        this.restart();
        this.view = new View(
            this.game.width,
            this.game.height,
            this.render.bind(this)
        );
        this.controller = new Controller(
            this.onStop.bind(this)
        );
        this.lastUpdate = undefined;
        this.stopTime = undefined;
    }

    restart() {
        this.game = new Game(
            CONFIG.WIDTH,
            CONFIG.HEIGHT,
            CONFIG.SPEED,
            CONFIG.SNAKE_LENGTH,
            new Vector(
                CONFIG.SNAKE_DIRECTION_X,
                CONFIG.SNAKE_DIRECTION_Y
            )
        );
    }

    render() {
        this.view.render(
            this.game.food,
            this.game.get_snake(),
            this.game.score,
            Storage.getBestScore()
        )
    }

    onStop() {
        const now = Date.now();
        if (this.stopTime) {
            this.stopTime = undefined;
            this.lastUpdate = now - this.lastUpdate;
        } else {
            this.stopTime = now;
        }
    }

    tick() {
        if (!this.stopTime) {
            const lastUpdate = Date.now();
            if (this.lastUpdate) {
                this.game.process(lastUpdate - this.lastUpdate, this.controller.movement);
                if (this.game.is_over()) {
                    if (this.game.score > Storage.getBestScore()) {
                        Storage.setBestScore(this.game.score)
                    }
                    this.restart();
                    return;
                }
            }
            this.lastUpdate = lastUpdate;
            this.render();
        }
    }

    run() {
        setInterval(this.tick.bind(this), 1000 / CONFIG.FPS);
    }
}