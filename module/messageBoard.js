const mysql = require("mysql");
const dbconfig = require("./config/database");
let connection;
try {
    connection = mysql.createConnection(dbconfig.connection);
    connection.query(`use ${dbconfig.database}`);
} catch (e) {
    console.error(e)
}

const addMessage = function (body, callback) {
    connection.query(`INSERT INTO remarks (message,messageTime,leaveuserid,leaveusername) VALUE (?,NOW(),?,?)`, [body.message, body.userid, body.username], (err, result) => {
        try {
            if (err) {
                console.log(err);
                callback("fail");
            } else {
                console.log("成功插入留言");
                callback("success");
            }
        } catch (e) {

        }
    })
};
const retriveMessage = function (callback) {
    connection.query(`SELECT * FROM (SELECT * FROM remarks ORDER BY id DESC LIMIT 20) sub`, [], function (err, result, value) {
        if (err) {
            console.log(err);
            throw err;
        }
        callback(result);
    })
};
module.exports = {
    addMessage,
    retriveMessage
};
