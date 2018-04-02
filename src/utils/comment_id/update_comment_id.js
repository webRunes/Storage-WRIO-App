const
  aws = require('../../aws'),
  updateHtml = require('./update_html');

module.exports = (url, commentId, cb) => {
  const
    splitedUrl = url.split('/'),
    fileName = splitedUrl.pop(),
    folderName = splitedUrl.pop(),
    wrioID = splitedUrl.pop(),
    awsPath = [wrioID, folderName, fileName].join('/');

  aws.downloadList(awsPath, (err, html) =>
    aws.saveFile(
      wrioID,
      [folderName, fileName].join('/'),
      typeof html === 'object' && html.Body && html.Body.toString
        ? updateHtml(html.Body.toString(), commentId)
        : '',
      cb
    )
  );
};
