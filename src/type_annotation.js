import t from '@babel/types';
import flowDoctrine from './flow_doctrine.js';
import tsDoctrine from './ts_doctrine.js';

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

export default typeAnnotation;
