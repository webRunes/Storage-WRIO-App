const p5 = require('parse5');

module.exports = (text, commentId) => {
  let
    jsonld,
    doc;

  try {

    doc = p5.parse(text);

    const
      html = doc.childNodes[1],
      head = html.childNodes[0],
      script = head.childNodes[15],
      json = script.childNodes[0];

    jsonld = JSON.parse(json.value);

    jsonld.comment = commentId;
    json.value = JSON.stringify(jsonld);
  } catch(e) {
    console.log('Can not parse JSON: ' + json + '. Error: ' + e);
    jsonld = null;
  }

  return jsonld
    ? p5.serialize(doc)
    : text;
};
