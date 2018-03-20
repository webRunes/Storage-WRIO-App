const
  aws = require('../src/aws'),
  updateListHtml = require('../src/update_list_html'),
  wrioID = 101144381240,
  link = 'https://wr.io/474365383130/Untitled/index.html';

describe('List of article links: list.html', () =>
  it('Add new link', done =>
    updateListHtml(aws, wrioID, link, () => done())
  )
)
