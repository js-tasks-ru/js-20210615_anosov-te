/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  let names = path.split(".");
  return function foo(obj) {
    let innerObj = Object.assign({}, obj);
    for (name of names) {
      if (!innerObj.hasOwnProperty(name)) {
        return undefined;
      }
      innerObj = getObjByName(innerObj, name);

      function getObjByName(obj, name) {
        innerObj = innerObj[name];
        return innerObj;
      }
    }
    return innerObj;
  };
}
