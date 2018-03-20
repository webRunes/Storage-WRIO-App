const
  updateCurrentList = require('./utils/update_current_list'),
  empty = require('./models/list.html');


module.exports = (aws, wrioID, link, cb) => {
  const
    listName = 'list.html',
    listPath = [wrioID, listName].join('/');

  aws.downloadList(listPath, (err, listHtml) =>
    aws.saveFile(
      wrioID,
      listName,
      updateCurrentList(
        err
          ? empty
          : typeof listHtml === 'object' && listHtml.Body && listHtml.Body.toString
            ? listHtml.Body.toString() || empty
            : empty,
        link
      ),
      cb
    )
  );
}
