const mysql=require("mysql");
const dbconfig = require("./config/database");
const bcrypt=require("bcrypt-nodejs");
let connection;
try{
    connection = mysql.createConnection(dbconfig.connection);
    connection.query(`use ${dbconfig.database}`);
}catch (e){
    console.error(e)
}

const modifyPassword=function (req,callback) {
    connection.query(`UPDATE users SET password=? WHERE id=?`,[bcrypt.hashSync(req.body.password,null,null),req.user.id],function (err,result) {
        try {
            if(err){
                console.log("修改密码出错!"+err);
            }else
                callback("success");
        }catch (err){
            console.error(err);
        }
    })
};
const validateOldPw=function (req,callback) {
    connection.query(`SELECT (password) FROM users WHERE id = ?`,[req.user.id],function (err,result) {
        try {
            if(err){
                callback("fail");
            }else{
                // console.log("here"+result[0]);
                if(bcrypt.compareSync(req.body.password,result[0].password)){
                    callback("success");
                }else{
                    callback("wrong");
                }
            }
        }
        catch (err){
            console.error("验证密码出错!"+err);
        }
    })
};
const renderFavorite=function (req,callback) {
    connection.query(`SELECT * FROM songs INNER JOIN userandsongs ON songs.id=userandsongs.songid WHERE userandsongs.userid=?`,[req.user.id],function (err,result) {
        try {
            if(err){
                console.error(err);
                callback("fail");
            }else{
                callback(result)
            }
        }catch (e){
            console.error(e)
            callback("fail");
        }

    })
}
module.exports={
    modifyPassword,
    validateOldPw,
    renderFavorite
}