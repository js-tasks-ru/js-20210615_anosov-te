/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === 0) {
    return "";
  }

  let arr = string.split("");

  let previous = arr[0];
  let newArr = [];
  for (let i = 0; i < arr.length; i++) {
    newArr.push(arr[i]);
    if (previous === arr[i]
      && newArr.length >= size + 1
      && new Set(newArr.slice((-1) * (size + 1))).size === 1) {
      newArr.pop();
    }
    previous = arr[i];
  }

  return newArr.join("");
}
