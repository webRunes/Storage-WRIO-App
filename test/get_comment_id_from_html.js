const
  fs = require('fs'),
  path = require('path'),
  assert = require('assert'),
  commentId = '875721502196465664',
  get_comment_id_from_html = require('../src/utils/comment_id/get_comment_id_from_html'),
  html = fs.readFileSync(path.join(__dirname, 'data/article_without_comments.html'), 'utf-8');

describe('Parse article HTML', () =>
  it('Get comment ID from HTML', () =>
    assert(
      commentId === get_comment_id_from_html(html)
    )
  )
)
