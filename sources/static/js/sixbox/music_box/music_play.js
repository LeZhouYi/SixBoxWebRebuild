var nowMusicPlayer = null; //底边栏播放器

function bindClickMusicItem(element, musicData, setData){
    /*绑定点击元素Item*/
    element.addEventListener("click", function(event){
        localStorage.setItem("nowPlayData", JSON.stringify(musicData));
        localStorage.setItem("nowPlaySetData", JSON.stringify(setData));
        playMusic();
    });
}

function playMusic(){
    /*播放音乐*/
    let nowPlaySetData = parseLocalJson("nowPlaySetData");
    if (!nowPlaySetData || nowPlaySetData.contents.length < 1){
        return;
    }
    let nowPlayData = parseLocalJson("nowPlayData");
    if (!nowPlayData || !isInSet(nowPlaySetData, nowPlayData)){
        return;
    }
    if (nowMusicPlayer !== null){
        nowMusicPlayer.unload();
    }
    let accessToken = localStorage.getItem("accessToken");
    let nowPlayVolume = localStorage.getItem("nowPlayVolume");
    let volume = parseInt(nowPlayVolume, 10)/10.0;
    nowMusicPlayer = new Howl({
        src: [`api/v1/files/${nowPlayData.fileId}/download?token=${accessToken}`],
        format: ["mp3"],
        volume: volume,
        onload: onPlayMusic
    });
}

function isInSet(setData, nowPlayData){
    /*判断歌曲是否在合集内*/
    let musicId = nowPlayData.id;
    for (const musicData of setData.contents){
        if (musicId === musicData.id){
            return true;
        }
    }
    return false;
}

function onPlayMusic(){
    /*点击播放事件*/
    let nowPlayData = parseLocalJson("nowPlayData");
    if (!nowMusicPlayer || !nowPlayData){
        return;
    }
    nowMusicPlayer.play();
    callElement("music_bar_play_button", element=>{
        element.src = "/static/icons/pause.png"
    });
    callElement("music_bar_play_name", element=>{
        element.textContent = nowPlayData.name;
    });
    callElement("music_bar_play_singer", element=>{
        element.textContent = nowPlayData.singer;
    });
    stopMusicBarInterval();
    startMusicBarInterval();
}

callElement("music_bar_play_button", element=>{
    /*点击播放暂停按钮事件*/
    element.addEventListener("click", async function(event){
        if (!nowMusicPlayer){
            let nowPlaySetData = parseLocalJson("nowPlaySetData");
            if (!nowPlaySetData){
                try{
                    let nowMscSetId = localStorage.getItem("nowMscSetId");
                    let data = await getJsonWithAuth(`/musicSets/${nowMscSetId}?_page=0&_limit=999`);
                    localStorage.setItem("nowPlaySetData", JSON.stringify(data));
                    let musicData = randListItem(data.contents);
                    localStorage.setItem("nowPlayData", JSON.stringify(musicData));
                }catch(error){
                    displayError(error);
                }
            }
            playMusic();
        }else if(nowMusicPlayer.playing()){
            nowMusicPlayer.pause();
            stopMusicBarInterval();
            callElement("music_bar_play_button", element=>{
                element.src = "/static/icons/next_page_trans.png"
            });
        }else{
            onPlayMusic();
        }
    });
});

callElement("music_bar_volume", element=>{
    /*调整音量*/
    element.addEventListener("change", function(event){
        if(nowMusicPlayer){
            let value = event.target.value;
            let volume = parseInt(value)/10.0;
            localStorage.setItem("nowPlayVolume", value);
            nowMusicPlayer.volume(volume);
        }
    });
});

var musicBarProcessInterval; //定时器引用
var isDragging = false; //拖动条状态

function startMusicBarInterval(){
    /*执行定时器*/
    let firstDuration = nowMusicPlayer.duration()||1;
    callElement("music_bar_end_text", element=>{
        element.textContent = formatSeconds(firstDuration);
    });
    musicBarProcessInterval = setInterval(function(){
        let currentTime = nowMusicPlayer.seek()||0;
        let duration = nowMusicPlayer.duration()||1;
        let progressPercent = (currentTime/duration) * 100;
        callElement("music_bar_start_text", element=>{
            element.textContent = formatSeconds(currentTime);
        });
        if(!isDragging){
            callElement("music_bar_play_progress", element=>{
                element.value = progressPercent;
            });
        }
    }, 1000);
}

function stopMusicBarInterval() {
    /*终止定时器*/
    clearInterval(musicBarProcessInterval);
}

callElement("music_bar_play_progress", element=>{
    element.addEventListener("mousedown", function(){
        isDragging = true;
    });
    element.addEventListener("mouseup", function(){
        if(nowMusicPlayer){
            let value = element.value;
            let progressPercent = value/100.0;
            let duration = nowMusicPlayer.duration();
            let currentTime = duration*progressPercent;
            nowMusicPlayer.seek(currentTime);
            callElement("music_bar_start_text", element=>{
                element.textContent = formatSeconds(currentTime);
            });
            if(!nowMusicPlayer.playing()){
                onPlayMusic();
            }
        }
        isDragging = false;
    });
});