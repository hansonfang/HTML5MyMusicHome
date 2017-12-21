/*******************playBar条样式 *****************************/
let $visualizers = $('.visualizer>div');
let $progressBar = $('.progress-bar');
let $progressBarRunner = $progressBar.find('.runner');
let songLength = 0; //in seconds
let percentage = 0
let $time = $('#current');
let $player = $('.player');
let play_button = $('.play-button');
let duration = 0;
let playRunner = null;
let timeIndicator = $(".time-indicator");
timeIndicator.hide();

function go() {
    playRunner = setInterval(function () {
        //visualizers
        $visualizers.each(function () {
            $(this).css('height', Math.random() * 90 + 10 + '%');
        });
        //progress bar
        percentage += 0.15;
        if (percentage > 100) percentage = 0;
        $progressBarRunner.css('width', percentage + '%');
        timeIndicator.css("left", percentage + "%");
        $time.text(calculateTime(songLength, percentage));
    }, 400);
}

play_button.on("click", function () {
    $player.toggleClass('paused').toggleClass('playing');
    $(this).find("i").toggleClass("fa-play");
    timeIndicator.toggle();
    if (playRunner) {
        clearInterval(playRunner);
        playRunner = null;
        $time.text(calculateTime(songLength, 100));
    } else {
        if (percentage === null) {
            percentage = 0;
        }
        go();
    }
    if (audio) {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    }
});
$progressBar.on('click', function (e) {
    var posY = $(this).offset().left;
    var clickY = e.pageX - posY;
    var width = $(this).width();
    console.log(`posY:${posY},clickY:${clickY},width:${width}`);
    audio.currentTime = (clickY / width) * duration;
    percentage = clickY / width * 100;
});

function calculateTime(songLength, percentage) {
    //time
    var currentLength = songLength / 100 * percentage;
    var minutes = Math.floor(currentLength / 60);
    var seconds = Math.floor(currentLength - (minutes * 60));
    if (seconds <= 9) {
        return (minutes + ':0' + seconds);
    } else {
        return (minutes + ':' + seconds);
    }
}

clearInterval(playRunner);

/*******************playBar条样式结束 *****************************/


/*******************获取新歌mp3播放 *****************************/
$.fn.ignore = function (sel) {
    return this.clone().find(sel || ">*").remove().end();
};
//点击歌名播放
let $kugouli = $("#cardkugou").find("li");
let $playbarTitle = $(".wrap .title");
let $playbarSubTitle = $(".wrap .sub-title");
let $timeEndIndicator = $("#duration");

$kugouli.click(function () {
    let hash = $(this).children(".hash").text();
    // let musicURL = `http://www.kugou.com/yy/index.php?r=play/getdata&hash=${hash}`;
    PlayMusic(hash, null, null, this);
});


let $netease = $("#cardnetease").find("li");
$netease.click(function () {
    let id = $(this).children(".id").text();
    PlayMusic(null, id, null, this);
});

let audio = null;

function PlayMusic(kugouHash, neteaseId, qqmusicId, pointer) {
    try {
        $.ajax({
            url: "/getMusicURL",
            type: "POST",
            data: {kugouHash: kugouHash, neteaseId: neteaseId, qqmusicId: qqmusicId},
            dataType: "json",
            success: (data) => {
                if ($player.hasClass("paused")) {
                    play_button.trigger("click");
                }
                if (!audio) {
                    audio = new Audio();
                }
                $playbarTitle.text($(pointer).ignore("span").text());
                if (kugouHash || qqmusicId) {
                    duration = $(pointer).children(".duration").text();
                }
                else if (neteaseId) {
                    duration = Math.floor($(pointer).children(".duration").text()) / 1000;
                }
                songLength = duration;
                let minute = Math.floor(parseInt(duration) / 60);
                let sec = Math.floor(parseInt(duration) % 60);
                if (sec < 10) {
                    sec = "0" + sec;
                }
                $timeEndIndicator.text(minute + ":" + sec);
                // $(".time-indicator .time").text(duration);
                console.log("success to set src!");
                percentage = 0;
                audio.src = data.trueURL;
                audio.autoplay = false;
                audio.loop = true;
                audio.volume = .3;
                audio.play();
                audio.onended = function () {
                    play_button.trigger("click");
                };
            },
            error: (data) => {
                console.log("error" + data);
            }
        })
    } catch (e) {
        console.error("资源不可用！" + e);
    }


}

/*******************获取新歌结束mp3播放 *****************************/


/*********************为QQ音乐获取新歌*********************/
const $qqmusicul = $("#cardqqmusic").children("ul");
$.ajax({
    type: "get",
    async: false,
    url: "http://music.qq.com/musicbox/shop/v3/data/hit/hit_newsong.js",
    dataType: "jsonp",
    jsonp: "callback",
    jsonpCallback: "JsonCallback",
    scriptCharset: 'GBK',//设置编码，否则会乱码
    success: function (data) {
        for (let i = 0; i < 8; i++) {
            $qqmusicul.append(`<li class="list-group-item d-flex justify-content-between align-items-center">${data.songlist[i].singerName} - ${data.songlist[i].songName}
            <span class="text-hide id">${data.songlist[i].id}</span>
            <span class="text-hide duration">${data.songlist[i].playtime}</span>
            <i class='fa fa-heart-o'  data-source="3"></i>
            </li>`)
        }

        //qq音乐播放歌曲
        const qqlist = $qqmusicul.children("li");
        qqlist.click(function () {
            const id = $(this).children(".id").text();
            PlayMusic(null, null, id, this);
        });
        bindAddFavorite();
    },
    error: function (e) {
        $qqmusicul.text("获取歌曲失败！" + e);
    }
});


/*********************为QQ音乐获取新歌结束*********************/


/*******************校验函数结束 *****************************/

/*************登录注册定向**************/
$(".loginBtn").click(function () {
    window.location = "/login";
});
$("#signUpBtn").click(function () {
    window.location = "/signup";
});
/*************登录注册定向End**************/

/*******************Search*****************/
let searchInput = $("#searchSongInput");
let searchBtn = $("#searchBtn");
searchBtn.click(function (e) {
    e.preventDefault();
    $(".loading").removeClass("d-none");
    let searchInputVal = searchInput.val();
    $.ajax({
        url: `/searchkugou?name=${searchInputVal}`,
        type: "GET",
        // dataType:"json"
        success: function (data) {
            window.location = `/searchkugou?name=${searchInputVal}`;
        }
    })
});

/****************Search End********************/

/****************Search page********************/
const kugouSongName = $(".searchKugouSongLink");
kugouSongName.click(function () {
    let hash = $(this).children(".id").text();
    // console.log(hash);
    PlayMusic(hash, null, null, this);
});

const neteaseSongName = $(".searchNeteaseSongLink");
neteaseSongName.click(function () {
    let id = $(this).children(".id").text();
    console.log(id);
    PlayMusic(null, id, null, this);
});

const qqSongName = $(".searchQQSongLink");
qqSongName.click(function () {
    let id = $(this).children(".id").text();
    PlayMusic(null, null, id, this);
})
/****************Search page********************/


/****************添加喜欢的音乐到收藏*****************/
const bindAddFavorite=function () {
    const heart = $(".fa-heart-o");
    heart.click(function (e) {
        e.stopPropagation();
        const songname = $(this).parent().ignore("span").text().trim();
        const self=this;
        $.ajax({
            url: "/addfavorite",
            type: "post",
            data: {
                songname: songname,
                id: $(this).parent().find(".id").text().trim(),
                duration: $(this).parent().find(".duration").text().trim(),
                source:$(this).attr("data-source")
            },
            dataType:"json",
            success:function (data) {
                if(data.result==="notlogin"){
                    $("#notloginModal").modal("show");
                }else if(data.result==="success"){
                    $(self).removeClass("fa-heart-o").addClass("fa-heart");
                    console.log("成功收藏");
                }else if(data.result==="fail"){
                    console.log("失败");
                }
            }
        })
    });
    const solidHeart=$(".fa-heart");
    solidHeart.click(function (e) {
        e.stopPropagation();
    })
};

/****************添加喜欢的音乐到收藏end*****************/