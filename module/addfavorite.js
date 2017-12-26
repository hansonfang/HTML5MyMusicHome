const mysql = require("mysql");
const dbconfig = require("./config/database");
let connection;
try{
   connection = mysql.createConnection(dbconfig.connection);
    connection.query(`use ${dbconfig.database}`);
}catch (e){
    console.error(e)
}

setInterval(function () {
    connection.query(`use ${dbconfig.database}`);
}, 10000);
module.exports = function (req, callback) {
    connection.query("INSERT INTO userandsongs (userid,songid) VALUES (?,?)", [req.user.id, req.body.id], function (err, result, field) {
        if (err) {
            callback(`err`);
            console.log("error to insert userandsongs " + err);
            throw err;
        }
        connection.query("INSERT INTO songs VALUES (?,?,?,?)", [req.body.id, req.body.songname, req.body.duration,req.body.source], function (err, result) {
            try {
                if (err) {
                    callback(`err`);
                    console.log("error to insert userandsongs " + err);
                }
                callback(`success`);
            }
            catch (e) {
                console.log(e)
            }
        });

    });

};