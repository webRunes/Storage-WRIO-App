const
  nameFromLink = link => {
    const
      splited = link.split('/');

    return splited[splited.length - 2];
  };

module.exports = (html, link) => {
  const
    head = html.substring(0, 12),
    tail = html.substring(12),
    name = nameFromLink(link),
    a = '<a href="' + link + '">' + name + '</a>';

  return [head, a, tail].join('');
}
