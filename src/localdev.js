const nconf = require("./wrio_nconf.js").init();
const fs = require('fs');

module.exports.saveFile = (userID,path,file,done) => {
    const savePath = "/hub/"+path;
    fs.writeFile(savePath, file, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
        done();
    });

};
