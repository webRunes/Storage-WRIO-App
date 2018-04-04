const
  html2list = require('../src/utils/html2list'),
  emptyHtml = require('../src/models/list.html'),
  assert = require('assert');

describe('html2list: parse HTML & find links & add em to list', () =>
  it('Default empty HTML should convert to empty list', () =>
    assert(
      0 === html2list(emptyHtml).length
    )
  )
)
