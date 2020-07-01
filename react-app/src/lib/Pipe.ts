const SCHEDULE_WAIT = 100;

export interface Tap {
    faucet: (payload: any) => void;
}

export default class Pipe {
    pipe: Array<any>;
    taps: Array<Tap>;
    constructor() {
        this.pipe = [];
        this.taps = [];
    }

    tap(tap: Tap) {
        this.taps.push(tap);
    }

    start() {
        this.processPipe();
    }

    schedule() {
        window.setTimeout(() => {
            this.processPipe();
        }, SCHEDULE_WAIT);
    }

    processPipe() {
        if (this.pipe.length === 0) {
            return;
        }
        const pipe = this.pipe;
        this.pipe = [];
        pipe.forEach((item) => {
            this.taps.forEach((tap) => {
                try {
                    tap.faucet(item);
                } catch (ex) {
                    console.error('Error processing tap: ' + ex.message, ex, tap, item);
                }
            });
        });
    }

    // notify() {
    //     if (this.pipe.length === 0) {
    //         return;
    //     }

    //     this.callbacks.forEach((callback) => {
    //         try {
    //             callback(this);
    //         } catch (ex) {
    //             console.error('Error processing DataPipe callback: ' + ex.message, ex);
    //         }
    //     });
    // }

    available() {
        return this.pipe.length > 0;
    }

    put(payload: any) {
        this.pipe.push(payload);
        this.schedule();
    }

    // take(count = 1) {
    //     const taken = this.pipe.slice(0, count);
    //     this.pipe = this.pipe.slice(taken.length);
    //     // if (taken.length < count) {
    //     //     this.pipe = [];
    //     // } else {
    //     //     this.pipe = this.pipe.slice(taken.length);
    //     // }
    //     return taken;
    // }
}

