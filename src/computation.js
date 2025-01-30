import { Reactive } from "./reactive.js";

export class Computation {
  constructor(fn, opts) {
    this.deps = new Set();
    this.fn = fn;
    this.timeout = null;
    this.collect = (_, ptr) => this.deps.add(ptr);
    this.rerun = (_, ptr) => {
      if (this.deps.has(ptr)) {
        if (opts.async) {
          if (this.timeout) clearTimeout(this.timeout);
          this.timeout = setTimeout(() => this.run());
        } else {
          this.run();
        }
      }
    };
    if (opts.immediate) this.run();
  }

  run() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    this.deps.clear();
    Reactive.sub(this.collect, Reactive.GET);
    this.fn();
    Reactive.unsub(this.collect);
    Reactive.sub(this.rerun, Reactive.ALL - Reactive.GET);
  }

  stop() {
    Reactive.unsub(this.rerun);
    if (this.timeout) clearTimeout(this.timeout);
  }
}
