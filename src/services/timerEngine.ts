/**
 * Background-resilient timer engine for mobile web applications.
 * Uses an inline Web Worker if available to prevent foreground DOM throttling,
 * with graceful fallback to window.setInterval.
 */

export type TickCallback = (remainingSeconds: number, isFireTick: boolean) => void;

export class ResilientTimer {
  private worker: Worker | null = null;
  private fallbackIntervalId: number | null = null;
  private intervalSeconds: number;
  private remainingSeconds: number;
  private isRunning: boolean = false;
  private onTick: TickCallback;
  private onFire: () => void;
  private lastFiredTimestamp: number = 0;

  constructor(
    intervalSeconds: number,
    onFire: () => void,
    onTick: TickCallback
  ) {
    this.intervalSeconds = intervalSeconds;
    this.remainingSeconds = intervalSeconds;
    this.onFire = onFire;
    this.onTick = onTick;
    this.initWorker();
  }

  private initWorker() {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      return;
    }

    try {
      // Inline Web Worker script as a Blob
      const workerCode = `
        let timer = null;
        self.onmessage = function(e) {
          if (e.data === 'START') {
            if (timer) clearInterval(timer);
            timer = setInterval(function() {
              self.postMessage('TICK');
            }, 1000);
          } else if (e.data === 'STOP') {
            if (timer) clearInterval(timer);
            timer = null;
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      this.worker = new Worker(workerUrl);

      this.worker.onmessage = (e) => {
        if (e.data === 'TICK' && this.isRunning) {
          this.handleTick();
        }
      };
    } catch (err) {
      console.warn('Worker creation failed, falling back to window timers:', err);
      this.worker = null;
    }
  }

  public setIntervalSeconds(newSeconds: number) {
    this.intervalSeconds = newSeconds;
    if (this.remainingSeconds > newSeconds) {
      this.remainingSeconds = newSeconds;
    }
  }

  public start() {
    if (this.isRunning) return; // Prevent duplicate timers

    this.isRunning = true;
    this.remainingSeconds = this.intervalSeconds;
    this.lastFiredTimestamp = Date.now();

    // Trigger initial status tick
    this.onTick(this.remainingSeconds, false);

    if (this.worker) {
      this.worker.postMessage('START');
    } else {
      this.startFallbackTimer();
    }
  }

  private startFallbackTimer() {
    if (this.fallbackIntervalId) {
      clearInterval(this.fallbackIntervalId);
    }
    this.fallbackIntervalId = window.setInterval(() => {
      this.handleTick();
    }, 1000);
  }

  private handleTick() {
    if (!this.isRunning) return;

    this.remainingSeconds -= 1;

    if (this.remainingSeconds <= 0) {
      this.remainingSeconds = this.intervalSeconds;
      this.lastFiredTimestamp = Date.now();
      this.onFire();
      this.onTick(this.remainingSeconds, true);
    } else {
      this.onTick(this.remainingSeconds, false);
    }
  }

  public stop() {
    this.isRunning = false;
    this.remainingSeconds = this.intervalSeconds;

    if (this.worker) {
      this.worker.postMessage('STOP');
    }

    if (this.fallbackIntervalId) {
      clearInterval(this.fallbackIntervalId);
      this.fallbackIntervalId = null;
    }

    this.onTick(this.intervalSeconds, false);
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getRemainingSeconds(): number {
    return this.remainingSeconds;
  }

  public destroy() {
    this.stop();
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
