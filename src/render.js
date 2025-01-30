import { Computation } from "./computation.js";
import { SELF_CLOSING_TAGS, TAG_NAMES, toArray } from "./utils.js";

const renderStack = [];
renderStack.top = function () {
  return this[this.length - 1];
};

function isChild(x) {
  return (
    ["string", "number", "function"].includes(typeof x) ||
    x instanceof Node ||
    x instanceof Component
  );
}

export function createElement(tagName, attributes = {}, ...children) {
  // Function called as createElement(tagName, ...children);
  if (isChild(attributes)) {
    children.unshift(attributes);
    attributes = {};
  }
  const el = document.createElement(tagName);
  for (const attrName in attributes) {
    const attrValue = attributes[attrName];
    if (typeof attrValue == "function") {
      if (attrName.startsWith("on")) {
        el.addEventListener(attrName.substring(2), attrValue);
      } else {
        renderStack.top().computations.add(
          new Computation(
            () => {
              const v = attrValue();
              if (typeof v == "boolean" || v == null) {
                if (v) {
                  el.setAttribute(attrName, "true");
                } else {
                  el.removeAttribute(attrName);
                }
              } else {
                el.setAttribute(attrName, v);
              }
            },
            { async: true, immediate: true }
          )
        );
      }
    } else {
      el.setAttribute(attrName, attrValue);
    }
  }
  if (SELF_CLOSING_TAGS.includes(tagName)) return el;
  for (const child of children.flat()) {
    if (child instanceof Component) {
      const pivotNode = document.createComment("");
      el.appendChild(pivotNode);
      renderStack.top().components.set(pivotNode, child);
      child.mount(pivotNode);
    } else if (child instanceof Node) {
      el.appendChild(child);
    } else {
      el.appendChild(createTextNode(child));
    }
  }
  return el;
}

export function fillTags(obj) {
  for (let t of TAG_NAMES) obj[t] = createElement.bind(null, t);
}

export function createTextNode(content) {
  if (typeof content == "function") {
    let textNode = document.createTextNode("");
    renderStack.top().computations.add(
      new Computation(() => (textNode.textContent = String(content())), {
        async: true,
        immediate: true,
      })
    );
    return textNode;
  } else {
    return document.createTextNode(String(content));
  }
}

export function createDom(renderFunction, ...args) {
  let components = new Map(),
    computations = new Set();
  renderStack.push({ components, computations });
  try {
    return { domNodes: renderFunction(...args), components, computations };
  } finally {
    renderStack.pop();
  }
}

export function removeNodes(nodes) {
  toArray(nodes).forEach(
    (node) => node.parentNode == null || node.parentNode.removeChild(node)
  );
}

export function putNodes(nodes, pivotNode) {
  toArray(nodes).forEach(
    (node) =>
      pivotNode.parentNode != null &&
      node.parentNode == null &&
      pivotNode.parentNode.insertBefore(node, pivotNode)
  );
}

export class Component {
  constructor(renderFn) {
    if (!renderFn) return;
    this.renderFn = renderFn.bind(this);
    this.mounted = false;
  }

  mount(pivotNode) {
    if (!this.renderFn || this.mounted) return;
    Object.assign(this, createDom(this.renderFn));
    putNodes(this.domNodes, pivotNode);
    this.mounted = true;
  }

  mountTo(parentNode) {
    this.mount(parentNode.appendChild(document.createComment("")));
  }

  unmount() {
    if (!this.renderFn || !this.mounted) return;
    this.components.forEach((c) => c.unmount());
    this.computations.forEach((c) => c.stop());
    removeNodes(this.domNodes);
    this.mounted = false;
  }
}
