const t = require('@babel/types');
const flowDoctrine = require('./flow_doctrine');
const tsDoctrine = require('./ts_doctrine');

function typeAnnotation(type) {
  if (t.isTSTypeAnnotation(type)) {
    return tsDoctrine(type.typeAnnotation);
  }
  
  if (t.isTypeAnnotation(type)) {
    type = type.typeAnnotation;
  }

  return flowDoctrine(type);
}

module.exports = typeAnnotation;
