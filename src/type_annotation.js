const t = require('@babel/types');
const flowDoctrine = require('./flow_doctrine');
const tsDoctrine = require('./ts_doctrine');

function typeAnnotation(type) {
  if (t.isFlow(type)) {
    if (t.isTypeAnnotation(type)) {
      type = type.typeAnnotation;
    }

    return flowDoctrine(type);
  }

  if (t.isTSTypeAnnotation(type)) {
    type = type.typeAnnotation;
  }

  return tsDoctrine(type);
}

module.exports = typeAnnotation;
