const mysql=require("mysql");
let config={
    'connection': {
        'host': 'xxxxxxxx',
        'user': 'root',
        'password': 'xxxxxxxx'
    },
    'database': 'cloudprint',
    'users_table': 'users'
};
let db;
function handleError (err) {
    if (err) {
        // 如果是连接断开，自动重新连接
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            connect();
        } else {
            console.error(err.stack || err);
        }
    }
}

// 连接数据库
function connect () {
    db = mysql.createConnection(config.connection);
    db.connect(handleError);
    db.on('error', handleError);
    return db;
}

module.exports ={
    config,
    connect
};
