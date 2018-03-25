const
  aws = require('../src/aws'),
  updateListHtml = require('../src/update_list_html'),
  request = require('superagent'),
  html2list = require('../src/utils/html2list');
  wrioID = '101144381240',
  name = 'Untitled',
  link = ['https://wr.io', wrioID, name, 'index.html'].join('/');

describe('List of article links: list.html', () =>
  it('Should not have duplicated article with title "Untitled"', done =>
    updateListHtml(aws, wrioID, link, () =>
      request('GET', 'https://s3.amazonaws.com/wr.io/' + wrioID + '/list.html').end((err, data) =>
        done(
          1 === html2list(data.text).filter(o => o.url === link).length
            ? undefined
            : 'There are duplicated links in list.html'
        )
      )
    )
  )
)
