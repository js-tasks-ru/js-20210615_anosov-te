/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let sorted = [...arr];
  return sorted.sort(function (a, b) {
    return param === 'desc'
      ? b.localeCompare(a, undefined, {'sensitivity': 'case', caseFirst: 'upper'})
      : a.localeCompare(b, undefined, {'sensitivity': 'case', caseFirst: 'upper'});
  });
}
