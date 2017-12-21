const request=require("request");
const querystring = require('querystring')
const S=require("string");
require('es6-promise').polyfill()
require('isomorphic-fetch')

const searchSong = (key, limit, page, raw,cb) => {
    const url = 'http://c.y.qq.com/soso/fcgi-bin/search_cp?'
    const query = {
        p: page,
        n: limit,
        w: key,
        aggr: 1,
        lossless: 1,
        cr: 1,
    }
    return new Promise((resolve, reject) => {
        fetch(`${url}${querystring.stringify(query)}`)
            .then(res => res.text())
            .then(text => {
                if (text.substr(0, 8) === 'callback') {
                    const json = JSON.parse(
                        text
                            .replace('callback(', '')
                            .substr(0, text.replace('callback(', '').length - 1)
                    )
                    if (!raw) {
                        const songList = json.data.song.list.map(item => ({
                            album: {
                                id: item.albummid,
                                cover: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${item.albummid}.jpg`,
                                coverBig: `https://y.gtimg.cn/music/photo_new/T002R500x500M000${item.albummid}.jpg`,
                                coverSmall: `https://y.gtimg.cn/music/photo_new/T002R150x150M000${item.albummid}.jpg`,
                                name: item.albumname,
                            },
                            artists: item.singer.map(i => ({ id: i.mid, name: i.name })),
                            name: item.songname,
                            id: item.songmid,
                            needPay: item.pay.payplay > 0,
                        }))
                        const obj = {
                            success: true,
                            total: json.data.song.totalnum,
                            songList,
                        }
                        resolve(obj)
                    } else {
                        resolve(json);
                        cb(json);
                    }
                }
            })
            .catch(err =>
                reject({
                    success: false,
                    message: err,
                })
            )
    })
};
module.exports = {
  searchSong
};
