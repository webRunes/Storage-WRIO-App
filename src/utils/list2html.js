const
  joinListReducer = (acc, o) =>
    [
      acc,
      ['<a href="', o.url, '">', o.name, '</a>'].join(''),
    ].join('');

module.exports = list =>
  list.reduce(joinListReducer, '')
