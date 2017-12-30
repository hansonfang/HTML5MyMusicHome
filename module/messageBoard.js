// const mysql = require("mysql");
const dbconnect = require("./config/database").connect;
const dbconfig=require("./config/database").config;

let connection;
try {
    connection = dbconnect();
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
    try {
        connection.query(`SELECT * FROM (SELECT * FROM remarks ORDER BY id DESC LIMIT 20) sub`, [], function (err, result, value) {
            if (err) {
                console.log(err);
            }else
                callback(result);
        })
    }catch (e){
        console.error(e)
    }

};
module.exports = {
    addMessage,
    retriveMessage
};
