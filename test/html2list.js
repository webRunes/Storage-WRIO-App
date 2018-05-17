const
  html2list = require('../src/utils/html2list'),
  emptyHtml = require('../src/models/list.html'),
  assert = require('assert');

describe('html2list: parse HTML & find links & add em to list', () => {
  it('Default empty HTML should convert to empty list', () =>
    assert(
      0 === html2list(emptyHtml).length
    )
  );

  it('one link', () =>
    assert(
      1 === html2list('<html><body><a href="link">AB</a></body></html>').length
    )
  );

  it('one link should have .url property', () =>
    assert(
      'link' === html2list('<html><body><a href="link">AB</a></body></html>').pop().url
    )
  );

  it('two links', () =>
    assert(
      2 === html2list('<html><body><a href="a">A</a><a href="b">B</a></body></html>').length
    )
  );
})
