// const mysql = require("mysql");
const dbconnect = require("./config/database").connect;
const dbconfig=require("./config/database").config;
let connection;
try{
   connection = dbconnect();
    connection.query(`use ${dbconfig.database}`);
}catch (e){
    console.error(e)
}

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