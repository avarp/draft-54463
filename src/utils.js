export function isObject(x) {
  return x && typeof x == "object";
}

export function isFn(x) {
  return typeof x == "function";
}

export function isPlainObject(x) {
  return isObject(x) && (x.constructor == Object || x.constructor == undefined);
}

export function noop() {
  // Does nothing
}

export function toArray(x) {
  if (Array.isArray(x)) return x;
  if (!x) return [];
  return [x];
}

export const TAG_NAMES =
  "a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript object ol optgroup option output p picture pre progress q rp rt ruby s samp script section select slot small source span strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track u ul var video wbr".split(
    " "
  );
export const SELF_CLOSING_TAGS =
  "area base br col embed hr img input link meta source track wbr".split(" ");

export const ARRAY_MUTATING_METHODS =
  "push pop shift unshift splice sort reverse fill copyWithin".split(" ");
