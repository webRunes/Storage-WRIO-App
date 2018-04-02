const
  aws = require('../src/aws'),
  updateCommentId = require('../src/utils/comment_id/update_comment_id'),
  commentId = 'Test comment id',
  get_comment_id_from_html = require('../src/utils/comment_id/get_comment_id_from_html'),
  url = 'https://wr.io/101144381240/Untitled9/index.html',
  articleName = 'Untitled9',
  wrioID = '101144381240',
  articlePath = [wrioID, articleName, 'index.html'].join('/');

describe('Download article HTML file update commentId and save HTML file', () =>
  it('load & update commentID in HTML & save', done =>
    updateCommentId(url, commentId, () =>
      aws.downloadList(articlePath, (err, res) =>
        done(
          get_comment_id_from_html(res.Body.toString()) === commentId
            ? undefined
            : 'Wrong comment ID after update'
        )
      )
    )
  )
)
