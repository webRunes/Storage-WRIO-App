const p5 = require('parse5');

module.exports = text => {
  const doc = p5.parse(text);
  const html = doc.childNodes[1];
  const head = html.childNodes[0];
  const script = head.childNodes[15];
  const json = script.childNodes[0].value;

  let jsonld = null;

  try {
    jsonld = JSON.parse(json);
  } catch(e) {
    console.log('Can not parse JSON: ' + json + '. Error: ' + e);
    jsonld = null;
  }

  return jsonld && jsonld.comment;
};
