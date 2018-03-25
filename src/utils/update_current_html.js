const
  html2list = require('./html2list'),
  list2html = require('./list2html'),
  nameFromLink = link => {
    const
      splited = link.split('/');

    return splited[splited.length - 2];
  },
  createItemList = link =>
    Object({
      url: link,
      name: nameFromLink(link)
    });

module.exports = (html, link) => {
  const
    list = html2list(html),
    alradyExist = Boolean(list.find(o => o.url === link));

  return alradyExist
    ?
      html
    :
      [
        '<html><body>',
        list2html([createItemList(link)].concat(list)),
        '</body></html>'
      ].join('')
}
