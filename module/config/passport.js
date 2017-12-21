const LocalStrategy = require("passport-local").Strategy;
const mysql = require("mysql");
const bcrypt = require("bcrypt-nodejs");
const dbconfig = require("./database");
let connection;
    try{
     connection = mysql.createConnection(dbconfig.connection);
    connection.query(`use ${dbconfig.database}`);
}catch (e){
    console.error(e)
}

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.id);// user.id is saved in the session and is later used to retrieve the whole object via the deserializeUser function
    });

    passport.deserializeUser(function (id, done) {
        //When requests are received, this ID is used to find the user, which will be restored to req.user.
        connection.query("SELECT * FROM users WHERE id = ? ", [id], function (err, rows) {
            done(err, rows[0]);
        });
    });

    passport.use(
        'local-signup',
        new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField: 'username',
                passwordField: 'password',
                passReqToCallback: true // allows us to pass back the entire request to the callback
            },
            function (req, username, password, done) {
                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                connection.query("SELECT * FROM users WHERE username = ?", [username], function (err, rows) {
                    try {
                        if (err) {
                            console.log("发生错误");
                            return done(err);
                        }
                        if (rows.length) {
                            console.log("已有用户名！");
                            return done(null, false, req.flash('signupMessage', '用户名已存在'));
                        } else {
                            // if there is no user with that username
                            // create the user
                            const newUser = {
                                username: username,
                                password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                            };

                            const insertQuery = "INSERT INTO users ( username, password ) values (?,?)";
                            try {
                                connection.query(insertQuery, [newUser.username, newUser.password], function (err, rows) {
                                    try{
                                        if(err){
                                            console.error("INSERT ERROR"+err);
                                        }
                                        newUser.id = rows.insertId;
                                        console.log("成功注册");
                                        return done(null, newUser);
                                    }catch (e){
                                        console.error(e)
                                    }

                                });
                            }
                            catch (e) {
                                console.error(e);
                            }
                        }
                    } catch (e) {
                        console.error(e);
                    }

                })
                ;
            })
    )

    passport.use(//配置local-login,相当于中间件，并被提供req参数
        'local-login',
        new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField: 'username',
                passwordField: 'password',//与表单的name向呼应，只需设置成表单的name值，为callback提供参数。
                passReqToCallback: true // allows us to pass back the entire request to the callback
            },
            function (req, usernam, passwor, done) {
                // callback with email and password from our form
                // console.log(req);
                connection.query("SELECT * FROM users WHERE username = ?", [usernam], function (err, rows) {
                    try {
                        if (err) {
                            return done(err);//if an exception occurred while verifying the credentials (for example, if the database is not available), done should be invoked with an error, in conventional Node style.
                        }
                        if (!rows.length) {
                            console.log("没找到人");
                            return done(null, false, req.flash('loginMessage', '此用户未注册')); // req.flash is the way to set flashdata using connect-flash
                        }

                        // if the user is found but the password is wrong
                        if (!bcrypt.compareSync(passwor, rows[0].password)) {
                            console.log("密码不对");
                            return done(null, false, req.flash('loginMessage', '密码不正确')); // create the loginMessage and save it to session as flashdata
                        }// *done* should be invoked with *false* instead of a *user* to indicate an authentication failure.


                        // all is well, return successful user
                        // console.log(rows[0]);
                        return done(null, rows[0]);
                    } catch (e) {
                        console.error(e);
                    }
                });
            })
    )
}