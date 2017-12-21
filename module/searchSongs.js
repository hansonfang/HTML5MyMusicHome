const request = require("request");
const requestNetease=require("./netease/searchSong");
const requestQQmusic=require("./qq");
module.exports = {
    searchOnKugou: function (name,callback) {
        let options = {
            url: `http://mobilecdn.kugou.com/api/v3/search/song?format=json&keyword=${encodeURI(name)}&page=1&pagesize=20&showtype=1`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
            }
        };
        request(options, function (err, result, value) {
            if (err) {
                console.log("error" + err);
            } else {
                // apicache.set("search-result-kugou", value);
                callback(value);
                console.log("success to get kugou search result!");
            }

        });
    },
    searchOnNetease:function (name,callback) {
        requestNetease(name,20,1,true,callback)
    },
    searchOnQQmusic:function (name,callback) {
        requestQQmusic.searchSong(name,20,1,true,callback);
    }
};