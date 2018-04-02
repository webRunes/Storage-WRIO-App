const
  fs = require('fs'),
  path = require('path'),
  assert = require('assert'),
  updateHtml = require('../src/utils/comment_id/update_html'),
  commentId = 'New commentID from Pinger after first comment',
  get_comment_id_from_html = require('../src/utils/comment_id/get_comment_id_from_html'),
  html = fs.readFileSync(path.join(__dirname, 'data/article_without_comments.html'), 'utf-8');

describe('Update CommentID in HTML article', () =>
  it('commentId should be updated', () =>
    assert(
      commentId === get_comment_id_from_html(
        updateHtml(html, commentId)
      )
    )
  )
)
