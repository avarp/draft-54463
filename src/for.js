import { Component } from "./render";

export class For extends Component {
  constructor(iterable, iteration, otherwise) {
    super();
    this.pivotNode = null;
  }

  renderList() {
    // Initial render
  }

  mount(pivotNode) {
    if (this.pivotNode) return;
    this.pivotNode = pivotNode;
    this.renderList();
  }

  unmount() {
    if (!this.pivotNode) return;
    this.pivotNode = null;
  }
}
