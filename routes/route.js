const express = require("express");
const path = require("path");
const router = express.Router();
const indexReq = require("../module/IndexRequest");
const async = require("async");
const getMusicURL = require("../module/getMusicurl");
const searchSongs = require("../module/searchSongs");
const addfavorite = require("../module/addfavorite");
const message = require("../module/messageBoard");
const mymusic=require("../module/mymusic");

module.exports = function (app, passport) {
    app.use("/", router);
    router.get("/", function (req, res) {
        let kugoudata = {};
        let neteasedata = {};
        let redirect = false;
        indexReq.cache.get("new-kugou-music", function (err, value) {
            if (err || value === undefined) {
                console.log("get new-kugou-music error!");
            } else {
                kugoudata = JSON.parse(value);
                redirect = true;
            }
        });

        indexReq.cache.get("new-netease-music", function (err, value) {
            if (err || value === undefined) {
                console.log("get new-netease-music error!");
            } else {
                neteasedata = JSON.parse(value);
                redirect = true;
            }
        });
        // console.log(neteasedata);
        indexReq.cache.get("new-qq-music", function (err, value) {
            if (err || value === undefined) {
                console.log("get new-qq-music error!");
            } else {
                qqmusicdata = value;
                redirect = true;
            }
        });

        if (!redirect) {
            res.redirect("/update");
            return;
        }
        let data = {
            kugou: [],
            netease: [],
            qqmusic: [
                {"filename": qqmusicdata.data.topList[0].songList[0].songname + " - " + qqmusicdata.data.topList[0].songList[0].singername},
                {"filename": qqmusicdata.data.topList[0].songList[1].songname + " - " + qqmusicdata.data.topList[0].songList[1].singername},
                {"filename": qqmusicdata.data.topList[0].songList[2].songname + " - " + qqmusicdata.data.topList[0].songList[2].singername},
                {"filename": qqmusicdata.data.topList[1].songList[0].songname + " - " + qqmusicdata.data.topList[1].songList[0].singername},
                {"filename": qqmusicdata.data.topList[1].songList[1].songname + " - " + qqmusicdata.data.topList[1].songList[1].singername},
                {"filename": qqmusicdata.data.topList[1].songList[2].songname + " - " + qqmusicdata.data.topList[1].songList[2].singername},
                {"filename": qqmusicdata.data.topList[2].songList[0].songname + " - " + qqmusicdata.data.topList[2].songList[0].singername},
                {"filename": qqmusicdata.data.topList[2].songList[1].songname + " - " + qqmusicdata.data.topList[2].songList[1].singername},
            ],
            user: false
        };

        for (let i = 0; i < 8; i++) {
            data.kugou.push({
                "filename": kugoudata.data[i].filename,
                "hash": kugoudata.data[i].hash,
                "duration": kugoudata.data[i].duration
            });
            data.netease.push({
                "filename": neteasedata.data[i].artists[0].name + " - " + neteasedata.data[i].name,
                "id": neteasedata.data[i].id,
                "duration": neteasedata.data[i].duration
            });
        }
        if (req.user) {
            data.user = req.user;
        }
        res.render("index", {dataAll: data});
    });

    router.get("/api/:vendor", (req, res) => {
        switch (req.params.vendor) {
            case "netease": {
                indexReq.cache.get("new-netease-music", function (err, value) {
                    res.send(value);
                });
                break;
            }
            case "qq": {
                indexReq.cache.get("new-qq-music", function (err, value) {
                    res.send(value);
                });
                break;
            }
            case "kugou": {

                break;
            }
            case "searchkugou": {
                searchSongs.searchOnKugou("小背篓", function (value) {
                    res.send(value);
                })
                break;
            }
            case "searchqq": {
                searchSongs.searchOnQQmusic("好日子", function (value) {
                    res.send(value);
                });
                break;
            }
            default: {
                res.end("重输一遍");
            }
        }


    });

// type ALL, ZH,EA,KR,JP
    router.get('/update', (req, res) => {
        async.parallel([
            function (calbak) {
                indexReq.getNeteaseNewsongs(res, calbak);
            },
            function (calbak) {
                indexReq.getKugouNewSongs(res, calbak);
            },
            function (calbak) {
                indexReq.getQQmusicNewsongs(res, calbak);
            }
        ], function (err, result) {
            console.log(result);
            res.end("<html><head><meta charset='utf-8'></head><body>cache updated!<br><a href='/'>Back</a></body></html>");
        })
    });


    //用户留言
    router.get("/messageboard", (req, res) => {
        message.retriveMessage(function (value) {
            res.render("messageBoard", {user: req.user ? req.user :false, messages: value});
        });

    });
    router.post("/message", (req, res) => {
        let userid = null;
        if (req.user) {
            userid = req.user.id;
        } else
            userid = -1;
        message.addMessage({
            message: req.body.message,
            userid: userid,
            username: userid === -1 ? "NULL" : req.user.username
        }, function (info) {
            let date = new Date();
            let options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
            options.timeZone = 'UTC';
            options.timeZoneName = 'short';
            res.json({
                result: info,
                message: {
                    userid: userid,
                    username: userid === -1 ? "匿名" : req.user.username,
                    message: req.body.message,
                    sendTime: date.toLocaleDateString('cn-CN', options)
                }
            });
        })
    });


//用户添加收藏
    router.post("/addfavorite", (req, res) => {
        if (req.user) {
            addfavorite(req, function (result) {
                if (result === "success") {
                    res.json({result: "success"})
                } else if (result === "err") {
                    res.json({result: "fail"})
                }
            });
        } else {
            res.json({result: "notlogin"});
        }

    });


//route /login
    router.get("/login", (req, res) => {
        res.render("login")
    });
    router.post("/login", passport.authenticate("local-login", {
        // successRedirect : '/mymusic', // redirect to the secure profile section
        failureRedirect: '/failurelogin', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }), (req, res) => {
        if (req.body.checked) {
            req.session.cookie.maxAge = 1000 * 60 * 60 * 3;
        } else
            req.session.cookie.expires = false;
        res.json({result: "success"});
    });
    router.get("/failurelogin", (req, res) => {
        res.json({result: "fail", info: req.flash("loginMessage")})
    });


//route /signup
    router.get("/signup", (req, res) => {
        // console.log(req.flash("signupMessage"));
        res.render("signup");
    });
    router.post("/signup", passport.authenticate("local-signup", {
        successRedirect: "/successsignup",
        failureRedirect: "/failuresignup",
        failureFlash: true
    }));
    router.get("/failuresignup", (req, res) => {
        const failureInfo = req.flash("signupMessage");
        res.json({result: "fail", info: failureInfo});
    });
    router.get("/successsignup", (req, res) => {
        res.json({result: "success"})
    });


    router.get("/mymusic", isLoggedIn, function (req, res) {
        res.render("mymusic", {
            user: req.user
        })
    });
    router.post("/mymusic",isLoggedIn,function (req,res) {
        mymusic.renderFavorite(req,function (data) {
            if(data==="fail"){
                res.json({info:"fail"})
            }else{
                res.json({info:"success",result:data});
            }

        })
    })
    //验证旧密码
    router.post("/validateOldPw",(req,res)=>{
        mymusic.validateOldPw(req,function (info) {
            res.json({info:info});
        })
    });
    //修改密码
    router.post("/modifyPassword",(req,res)=>{
        mymusic.modifyPassword(req,function (info) {
            if(info){
                req.logout();
                res.json({info:"success"});
            }else
                res.json({info:"fail"});
        });
    })

//route /search
    router.get("/searchkugou", (req, res) => {
        searchSongs.searchOnKugou(req.query.name, function (value) {
            let data = JSON.parse(value);
            res.render("searchKugou", {data: data, title: decodeURI(req.query.name)});
        });

        // res.end();
    });
    router.get("/searchnetease", (req, res) => {
        searchSongs.searchOnNetease(req.query.name, function (value) {
            let data = JSON.parse(value);
            res.render("searchNetease", {data: data, title: decodeURI(req.query.name)});
        })
    });
    router.get("/searchqq", (req, res) => {
        searchSongs.searchOnQQmusic(req.query.name, function (value) {
            let data = value;
            res.render("searchqqmusic", {data, data, title: req.query.name});
        });
    })
    router.post("/getMusicURL", (req, res) => {
        getMusicURL(req, function (musicURL) {
            console.log("response music url success!");
            res.json({trueURL: musicURL});
            res.end();
        });
    });

    router.get("/contact",(req,res)=>{
        res.render("contactus",{user:req.user});
    })
};

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/login');
}
