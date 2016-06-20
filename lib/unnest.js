function unnestTag(comment, tag) {

  if (comment[tag]) {
    var tagFlattened = [];
    comment[tag].forEach(flattenTag);
    comment[tag] = tagFlattened;
  }

  function flattenTag(tag) {
    tagFlattened.push(tag);
    if (tag.properties) {
      tag.properties.forEach(flattenTag);
    }
    tag.properties = undefined;
  }

  return comment;
}

function unnest(comment) {
  return unnestTag(unnestTag(comment, 'params'), 'properties');
}

module.exports = unnest;
