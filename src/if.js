import { Computation } from "./computation.js";
import { Component } from "./render.js";

export class If extends Component {
  constructor(condition, then, otherwise) {
    super();
    this.pivotNode = null;
    this.then = new Component(then);
    this.otherwise = new Component(otherwise);
    this.computation = new Computation(
      () => {
        if (condition()) {
          this.otherwise.unmount();
          this.then.mount(this.pivotNode);
        } else {
          this.then.unmount();
          this.otherwise.mount(this.pivotNode);
        }
      },
      {
        async: true,
      }
    );
  }

  mount(pivotNode) {
    if (this.pivotNode) return;
    this.pivotNode = pivotNode;
    this.computation.run();
  }

  unmount() {
    if (!this.pivotNode) return;
    this.pivotNode = null;
    this.computation.stop();
    this.then.unmount();
    this.otherwise.unmount();
  }
}
