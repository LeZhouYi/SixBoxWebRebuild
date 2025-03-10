var nowMusicPlayer = null; //底边栏播放器

function bindClickMusicItem(element, musicData, setData){
    /*绑定点击元素Item*/
    element.addEventListener("click", function(event){
        sessionStorage.setItem("nowPlayData", JSON.stringify(musicData));
        sessionStorage.setItem("nowPlaySetData", JSON.stringify(setData));
        playMusic();
    });
}

function playMusic(){
    /*播放音乐*/
    let nowPlaySetData = parseSessionJson("nowPlaySetData");
    if (!nowPlaySetData || nowPlaySetData.contents.length < 1){
        return;
    }
    let nowPlayData = parseSessionJson("nowPlayData");
    if (!nowPlayData || !isInSet(nowPlaySetData.contents, nowPlayData)){
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
        onload: onPlayMusic,
        onend: onEndMusic
    });
}

function onEndMusic(){
    /*歌曲播放完成事件*/
    let nowPlaySetData = parseSessionJson("nowPlaySetData");
    if (!nowPlaySetData || nowPlaySetData.contents.length < 1){
        /*结束播放*/
        callElement("music_bar_play_button", element=>{
            element.src = "/static/icons/next_page_trans.png";
        });
        return;
    }
    let nowPlayData = parseSessionJson("nowPlayData");
    if (!nowPlayData || !isInSet(nowPlaySetData.contents, nowPlayData)){
        /*结束播放*/
        callElement("music_bar_play_button", element=>{
            element.src = "/static/icons/next_page_trans.png";
        });
        return;
    }
    let nowPlayMode = sessionStorage.getItem("nowPlayMode");
    if (nowPlayMode === "only"){
        /*单曲循环*/
        if (!nowMusicPlayer){
            nowMusicPlayer.play();
        }
    }else if (nowPlayMode === "random"){
        /*随机播放*/
        let nowPlayOrder = parseSessionJson("nowPlayOrder");
        if (!nowPlayOrder || nowPlayOrder.length !== nowPlaySetData.contents.length || !isInSet(nowPlayOrder, nowPlayData)){
            nowPlayOrder = shuffleArray(nowPlaySetData.contents);
            sessionStorage.setItem("nowPlayOrder", JSON.stringify(nowPlayOrder));
        }
        sessionStorage.setItem("nowPlayData", JSON.stringify(getNextMusic(nowPlayOrder, nowPlayData)));
        playMusic();
    }else{
        /*顺序播放*/
        sessionStorage.setItem("nowPlayData", JSON.stringify(getNextMusic(nowPlaySetData.contents, nowPlayData)));
        playMusic();
    }
}

function getNextMusic(setData, nowPlayData){
    /*获取下一首歌曲的数据*/
    let musicId = nowPlayData.id;
    let index = setData.findIndex(item => item.id === musicId);
    let nextIndex = (index + 1) % (setData.length || 1);
    return setData[nextIndex];
}

function isInSet(setData, nowPlayData){
    /*判断歌曲是否在合集内*/
    let musicId = nowPlayData.id;
    let index = setData.findIndex(item => item.id === musicId);
    return index !== -1;
}

function onPlayMusic(){
    /*点击播放事件*/
    let nowPlayData = parseSessionJson("nowPlayData");
    if (!nowMusicPlayer || !nowPlayData){
        return;
    }
    nowMusicPlayer.play();
    callElement("music_bar_play_button", element=>{
        element.src = "/static/icons/pause.png";
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
            let nowPlaySetData = parseSessionJson("nowPlaySetData");
            if (!nowPlaySetData){
                try{
                    let nowMscSetId = sessionStorage.getItem("nowMscSetId");
                    let data = await getJsonWithAuth(`/musicSets/${nowMscSetId}?_page=0&_limit=999`);
                    sessionStorage.setItem("nowPlaySetData", JSON.stringify(data));
                    let musicData = randListItem(data.contents);
                    sessionStorage.setItem("nowPlayData", JSON.stringify(musicData));
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

callElement("music_bar_order_button", element=>{
    element.addEventListener("click", function(event){
        /*点击切换播放模式*/
        let nowPlayMode = sessionStorage.getItem("nowPlayMode");
        if (nowPlayMode === "order"){
            sessionStorage.setItem("nowPlayMode", "random");
            event.target.src = "/static/icons/random_order.png";
        } else if (nowPlayMode === "random"){
            sessionStorage.setItem("nowPlayMode", "only");
            event.target.src = "/static/icons/only_play.png";
        } else{
            sessionStorage.setItem("nowPlayMode", "order");
            event.target.src = "/static/icons/order_play.png";
        }
    });
})

callElement("music_bar_rewind_button", element=>{
    element.addEventListener("click", function(event){
        /*点击上一首*/
        let nowPlaySetData = parseSessionJson("nowPlaySetData");
        if (!nowPlaySetData || nowPlaySetData.contents.length < 1){
            playMusic();
            return;
        }
        let nowPlayData = parseSessionJson("nowPlayData");
        if (!nowPlayData || !isInSet(nowPlaySetData.contents, nowPlayData)){
            playMusic();
            return;
        }
        let nowPlayMode = sessionStorage.getItem("nowPlayMode");
        if (nowPlayMode === "random"){
            /*随机播放*/
            let nowPlayOrder = parseSessionJson("nowPlayOrder");
            if (!nowPlayOrder || nowPlayOrder.length !== nowPlaySetData.contents.length || !isInSet(nowPlayOrder, nowPlayData)){
                nowPlayOrder = shuffleArray(nowPlaySetData.contents);
                sessionStorage.setItem("nowPlayOrder", JSON.stringify(nowPlayOrder));
            }
            sessionStorage.setItem("nowPlayData", JSON.stringify(getBeforeMusic(nowPlayOrder, nowPlayData)));
            playMusic();
        }else{
            /*顺序播放*/
            sessionStorage.setItem("nowPlayData", JSON.stringify(getBeforeMusic(nowPlaySetData.contents, nowPlayData)));
            playMusic();
        }
    });
})

callElement("music_bar_forward_button", element=>{
    element.addEventListener("click", function(event){
        /*点击下一首*/
        let nowPlaySetData = parseSessionJson("nowPlaySetData");
        if (!nowPlaySetData || nowPlaySetData.contents.length < 1){
            playMusic();
            return;
        }
        let nowPlayData = parseSessionJson("nowPlayData");
        if (!nowPlayData || !isInSet(nowPlaySetData.contents, nowPlayData)){
            playMusic();
            return;
        }
        let nowPlayMode = sessionStorage.getItem("nowPlayMode");
        if (nowPlayMode === "random"){
            /*随机播放*/
            let nowPlayOrder = parseSessionJson("nowPlayOrder");
            if (!nowPlayOrder || nowPlayOrder.length !== nowPlaySetData.contents.length || !isInSet(nowPlayOrder, nowPlayData)){
                nowPlayOrder = shuffleArray(nowPlaySetData.contents);
                sessionStorage.setItem("nowPlayOrder", JSON.stringify(nowPlayOrder));
            }
            sessionStorage.setItem("nowPlayData", JSON.stringify(getNextMusic(nowPlayOrder, nowPlayData)));
            playMusic();
        }else{
            /*顺序播放*/
            sessionStorage.setItem("nowPlayData", JSON.stringify(getNextMusic(nowPlaySetData.contents, nowPlayData)));
            playMusic();
        }
    });
});

function getBeforeMusic(setData, nowPlayData){
    /*获取上一首歌曲的数据*/
    let musicId = nowPlayData.id;
    let index = setData.findIndex(item => item.id === musicId);
    let nextIndex = (index - 1 + (setData.length || 1)) % (setData.length || 1);
    return setData[nextIndex];
}