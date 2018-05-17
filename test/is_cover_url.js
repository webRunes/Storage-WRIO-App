const
  assert = require('assert'),
  isCoverUrl = require('../src/utils/is_cover_url');

describe('cover.html should not be added at list.html', () => {
  it('it is cover url', () =>
    assert(
      isCoverUrl('https://s3.amazonaws.com/wr.io/101144381240/ArticleName/cover/cover.html')
    )
  )

  it('it is not cover url', () =>
    assert(
      !isCoverUrl('https://s3.amazonaws.com/wr.io/101144381240/ArticleName/index.html')
    )
  )
})
