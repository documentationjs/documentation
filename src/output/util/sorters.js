module.exports.alphabetizeBy = key => (a, b) => {
  if (a[key] < b[key]) {
    return -1;
  }
  if (a[key] > b[key]) {
    return 1;
  }

  // must be equal
  return 0;
};
