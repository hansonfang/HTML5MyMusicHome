const request=require("request");
const getNeteaseSongs=require("./netease/getSong");

module.exports=function (req,callback) {
    let kugouHash=req.body.kugouHash;
    let neteaseId=req.body.neteaseId;
    let qqmusicId=req.body.qqmusicId;
    if(kugouHash){
        let reqUrl=`http://www.kugou.com/yy/index.php?r=play/getdata&hash=${kugouHash}`;
        request(reqUrl,function (err,res,value) {
            if(value){
                let musicURL=JSON.parse(value).data.play_url;
                callback(musicURL);
            }
        });
    }else if(neteaseId){
       getNeteaseSongs(neteaseId,true,128000,function (value) {
           if(value){
               let musicURL=JSON.parse(value).data[0].url;
               callback(musicURL);
           }
       });
    }else if(qqmusicId){
        callback(`http://ws.stream.qqmusic.qq.com/${qqmusicId}.m4a?fromtag=46`)
    }

};