import { isFn, isObject } from "./utils.js";

Object.assign(Reactive, {
  GET: 1,
  SET: 2,
  DEF: 4,
  DEL: 8,
  CALL: 16,
  ALL: 31,
  OPS: [1, 2, 4, 8, 16],
  /**
   * Subscribe
   * @param {Function} fn callback that will receive operation, path and payload
   * @param {object|number} operations
   */
  sub(fn, operations = Reactive.ALL) {
    subs.add(fn, operations);
  },
  /**
   * Unsubscribe
   * @param {Function} fn
   */
  unsub(fn) {
    subs.delete(fn);
  },
});

const subs = new (class {
  constructor() {
    Reactive.OPS.map((op) => (this[op] = new Set()));
  }
  /**
   * Add handler.
   * @param {VoidFunction} fn the handler
   * @param {number} ops bitmask of values in Reactive.OPS
   * @void
   */
  add(fn, ops) {
    Reactive.OPS.forEach((op) => ops & op && this[op].add(fn));
  }
  /**
   * Delete handler.
   * @param {VoidFunction} fn the handler
   * @void
   */
  delete(fn) {
    Reactive.OPS.forEach((op) => this[op].delete(fn));
  }
  /**
   * Run subscribed handlers.
   * @param {number} op one of values in Reactive.OPS
   * @param {string} ptr global JSON pointer
   * @param {any} payload data specific for the operation
   */
  run(op, ptr, payload) {
    this[op].forEach((fn) => fn(op, ptr, payload));
  }
})();

/**
 * Special properties
 */
const IS_PROXY = Symbol(),
  JSON_PTR = Symbol();

/**
 * JSON pointer implementation
 * @see https://datatracker.ietf.org/doc/html/rfc6901
 */
export const jsonPtr = {
  unescape(x) {
    return x.replaceAll("~1", "/").replaceAll("~0", "~");
  },
  escape(x) {
    return x.replaceAll("~", "~0").replaceAll("/", "~1");
  },
  /**
   * Append a key name to the JSON pointer
   * @param {string} ptr
   * @param {string} key
   * @return {string}
   */
  append(ptr, key) {
    return ptr + "/" + jsonPtr.escape(key);
  },
  /**
   * Get the name of property pointer points to
   * @param {string} ptr
   * @return {string}
   */
  propName(ptr) {
    return jsonPtr.unescape(ptr.split("/").pop());
  },
  /**
   * Get JSON pointer of the object or method
   * @param {object|function} obj
   * @return {string?}
   */
  of(obj) {
    if (!isObject(obj) && !isFn(obj)) return;
    if (!obj[IS_PROXY]) return;
    return obj[JSON_PTR];
  },
};

function proxyTraps(path) {
  return {
    get: (object, key) => {
      if (key == IS_PROXY) return true;
      if (key == JSON_PTR) return path;
      const ptr = jsonPtr.append(path, key);
      subs.run(Reactive.GET, ptr);
      if (isObject(object[key]) && !object[key][IS_PROXY]) {
        object[key] = new Proxy(object[key], proxyTraps(ptr));
      }
      if (isFn(object[key]) && !object[key][IS_PROXY]) {
        object[key] = new Proxy(object[key], {
          get: (fn, key) => {
            if (key == IS_PROXY) return true;
            if (key == JSON_PTR) return ptr;
            return fn[key];
          },
          apply(fn, $this, args) {
            subs.run(Reactive.CALL, ptr, args);
            return fn.apply($this, args);
          },
        });
      }
      return object[key];
    },
    set: (object, key, value) => {
      if (object[key] !== value) {
        subs.run(Reactive.SET, jsonPtr.append(path, key), value);
        object[key] = value;
      }
      return true;
    },
    defineProperty: (object, key, attrs) => {
      subs.run(Reactive.DEF, jsonPtr.append(path, key), attrs);
      Object.defineProperty(object, key, attrs);
      return true;
    },
    deleteProperty: (object, key) => {
      subs.run(Reactive.DEL, jsonPtr.append(path, key));
      delete object[key];
      return true;
    },
  };
}

/**
 * The reactive object
 */
let nextId = 0;
export function Reactive(value, name = "") {
  return new Proxy(
    isObject(value) ? value : { value },
    proxyTraps("/$" + name + (nextId++).toString(36))
  );
}
