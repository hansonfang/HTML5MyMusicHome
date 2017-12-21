/*用于获取首页的音乐信息*/
const request = require("request");
const {createWebAPIRequest} = require('../util/util');
const nodeCache = require("node-cache");
const cache = new nodeCache();
const requestPromise = require("request-promise");
const iconv = require('iconv-lite');

module.exports = {
    cache: cache,
    getKugouNewSongs: function (res, callback) {
        request("http://m.kugou.com/?json=true", function (error, response, body) {
            if (error) {
                callback(false);
                cache.set("new-kugou-music error", error);
            } else {
                callback(true);
                cache.set("new-kugou-music", body);
                console.log("new-kugou-music success");
            }
        });

    },

    getNeteaseNewsongs: function (res, callback) {
        const cookie = '';
        const data = {
            offset: 10,
            total: true,
            limit: 10,
            area: null,
            csrf_token: ''
        };
        createWebAPIRequest(
            'music.163.com',
            '/weapi/v1/discovery/new/songs',
            'POST',
            data,
            cookie,
            music_req => {
                // callback(music_req);
                cache.set("new-netease-music", music_req, function (err, success) {
                    if (!err && success) {
                        console.log("new-netease-music success");
                        callback(true);
                    } else {
                        console.log("new-netease-music error");
                        callback(false);

                    }
                })
            },
            err => {
                // callback(err);
                cache.set("new-netease-music-error", err, function (error, success) {
                    if (!error && success) {
                        console.log(success);
                        callback(true);
                    } else {
                        console.log(error);
                        callback(false);
                    }
                })
            }
        )
    },

    getQQmusicNewsongs: function (res, callback) {
        const HEADERS = {
            'accept': 'application/json',
            'authority': 'c.y.qq.com',
            'origin': 'https://m.y.qq.com',
            'referer': 'https://m.y.qq.com/',
            'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
        };

        async function fetch(url) {
            try {
                console.log("res!!!");
                /*
                res.json(await requestPromise({
                    uri: url,
                    json: true,
                    headers: HEADERS
                }));*/
                cache.set("new-qq-music", await requestPromise({
                    uri: url,
                    json: true,
                    headers: HEADERS
                }), function (err, success) {
                    if (err) {
                        console.log("new-qq-music error");
                    } else {
                        console.log("new-qq-music success");
                        callback(null, true);
                    }
                });
            } catch (e) {
                console.log("error" + e);
                cache.set("new-qq-music-error", {error: e.message});
            }
        }

        const url = `https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg?g_tk=5381&uin=0&format=json&inCharset=utf-8&outCharset=utf-8&notice=0&platform=h5&needNewCode=1&_=${+new Date()}`
        fetch(url);
    }

};

// module.exports.getNeteaseNewsongs();/**/