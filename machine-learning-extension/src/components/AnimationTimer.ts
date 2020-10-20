import { Range1d } from "@bentley/geometry-core";
import { Viewport } from "@bentley/imodeljs-frontend";
import { BeEvent } from "@bentley/bentleyjs-core";

export class AnimationTimer {
  // public onAnimationTick = new BeEvent<(vp: Viewport) => void>();
  public onAnimationTick = new BeEvent<(time: number) => void>();
  public isPlaying = false;
  private _totalMillis: number = 0;
  private _elapsedMillis = 0;
  private _lastMillis = Date.now();
  private _timelineDuration: Range1d = Range1d.createXX(0,0);

  constructor(private readonly _vp: Viewport, durationInSeconds: number = 10) {
    this.setDuration(durationInSeconds);
  }

  public setDuration(durationInSeconds: number) {
    this._totalMillis = durationInSeconds * 1000;
  }

  public updateDuration(timeInSeconds: number): void {
    const fraction = Math.min(1, this._elapsedMillis / this._totalMillis);
    this._totalMillis = timeInSeconds * 1000;
    this._elapsedMillis = fraction * this._totalMillis;
    this._lastMillis = Date.now();

    this.update();
  }

  public start() {
    if (this.isPlaying)
      return;
    const script = this._vp.displayStyle.scheduleScript;
    if (undefined === script)
      return;
    this._timelineDuration = script.computeDuration();
    this.isPlaying = true;
    this._lastMillis = Date.now();
    this.queueAnimationFrame();
  }

  public pause(): void {
    if (!this.isPlaying)
      return;

    this.isPlaying = false;
    this._lastMillis = Date.now();
    this.update();
    this.queueAnimationFrame();
  }

  private update() {
    const fraction = Math.min(1, this._elapsedMillis / this._totalMillis);
    // this._slider.value = (fraction * 1000).toString();
    
    const point = this._timelineDuration.fractionToPoint(fraction);
    this._vp.timePoint = point;
    this.onAnimationTick.raiseEvent(this._vp.timePoint);
  }

  public setTime(time: number) {
    this._elapsedMillis = time - this._timelineDuration.low;
    this._lastMillis = Date.now();
    this.update();
  }

  private onAnimationFrame(): void {
    if (!this.isPlaying)
      return;

    const now = Date.now();
    const elapsed = now - this._lastMillis;
    this._lastMillis = now;
    this._elapsedMillis += elapsed;

    this.update();

    if (this._elapsedMillis >= this._totalMillis)
      this._elapsedMillis = 0;
    
    this.queueAnimationFrame();
  }

  private queueAnimationFrame(): void {
    requestAnimationFrame(() => this.onAnimationFrame());
  }
}
