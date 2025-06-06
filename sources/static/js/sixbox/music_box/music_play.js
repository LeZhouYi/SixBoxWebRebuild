var nowMusicPlayer = null; //底边栏播放器
var musicPlayProgress = null; //播放器进度条
var musicVolumeProgress = null; //音量进度条
var musicBarProcessInterval; //定时器引用

window.addEventListener("load", function () {
    clickOverlayHidden("msc_add_set_overlay", "msc_add_set_content");
    musicPlayProgress = new ProgressBar("music_play_progress","music_bar_play_progress", onClickPlayProgress);
    musicVolumeProgress = new ProgressBar("music_volume_progress", "music_bar_volume", onClickVolume, localStorage.getItem("nowPlayVolume"));
});

function bindClickMusicItem(element, musicData, setData) {
    /*绑定点击元素Item*/
    element.addEventListener("click", function (event) {
        sessionStorage.setItem("nowPlayData", JSON.stringify(musicData));
        sessionStorage.setItem("nowPlaySetData", JSON.stringify(setData));
        playMusic();
    });
}

function playMusic() {
    /*播放音乐*/
    let nowPlaySetData = parseSessionJson("nowPlaySetData");
    if (!nowPlaySetData || nowPlaySetData.contents.length < 1) {
        return;
    }
    let nowPlayData = parseSessionJson("nowPlayData");
    if (!nowPlayData || !isInSet(nowPlaySetData.contents, nowPlayData)) {
        return;
    }
    if (nowMusicPlayer !== null) {
        nowMusicPlayer.unload();
    }
    let accessToken = localStorage.getItem("accessToken");
    let nowPlayVolume = localStorage.getItem("nowPlayVolume");
    let volume = parseInt(nowPlayVolume, 10) / 10.0;
    nowMusicPlayer = new Howl({
        src: [`api/v1/files/${nowPlayData.fileId}/download?token=${accessToken}`],
        format: ["mp3"],
        volume: volume,
        onload: onPlayMusic,
        onend: onEndMusic
    });
}

function onEndMusic() {
    /*歌曲播放完成事件*/
    let nowPlaySetData = parseSessionJson("nowPlaySetData");
    if (!nowPlaySetData || nowPlaySetData.contents.length < 1) {
        /*结束播放*/
        callElement("music_bar_play_button", element => {
            element.src = "/static/icons/next_page_trans.png";
        });
        return;
    }
    let nowPlayData = parseSessionJson("nowPlayData");
    if (!nowPlayData || !isInSet(nowPlaySetData.contents, nowPlayData)) {
        /*结束播放*/
        callElement("music_bar_play_button", element => {
            element.src = "/static/icons/next_page_trans.png";
        });
        return;
    }
    let nowPlayMode = sessionStorage.getItem("nowPlayMode");
    if (nowPlayMode === "only") {
        /*单曲循环*/
        if (nowMusicPlayer) {
            nowMusicPlayer.play();
        }
    } else if (nowPlayMode === "random") {
        /*随机播放*/
        let nowPlayOrder = parseSessionJson("nowPlayOrder");
        if (!nowPlayOrder || nowPlayOrder.length !== nowPlaySetData.contents.length || !isInSet(nowPlayOrder, nowPlayData)) {
            nowPlayOrder = shuffleArray(nowPlaySetData.contents);
            sessionStorage.setItem("nowPlayOrder", JSON.stringify(nowPlayOrder));
        }
        sessionStorage.setItem("nowPlayData", JSON.stringify(getNextMusic(nowPlayOrder, nowPlayData)));
        playMusic();
    } else {
        /*顺序播放*/
        sessionStorage.setItem("nowPlayData", JSON.stringify(getNextMusic(nowPlaySetData.contents, nowPlayData)));
        playMusic();
    }
}

function getNextMusic(setData, nowPlayData) {
    /*获取下一首歌曲的数据*/
    let musicId = nowPlayData.id;
    let index = setData.findIndex(item => item.id === musicId);
    let nextIndex = (index + 1) % (setData.length || 1);
    return setData[nextIndex];
}

function isInSet(setData, nowPlayData) {
    /*判断歌曲是否在合集内*/
    let musicId = nowPlayData.id;
    let index = setData.findIndex(item => item.id === musicId);
    return index !== -1;
}

function onPlayMusic() {
    /*点击播放事件*/
    let nowPlayData = parseSessionJson("nowPlayData");
    if (!nowMusicPlayer || !nowPlayData) {
        return;
    }
    nowMusicPlayer.play();
    callElement("music_bar_play_button", element => {
        element.src = "/static/icons/pause.png";
    });
    callElement("music_bar_play_name", element => {
        element.textContent = nowPlayData.name;
    });
    callElement("music_bar_play_singer", element => {
        element.textContent = nowPlayData.singer;
    });
    stopMusicBarInterval();
    startMusicBarInterval();
}

callElement("music_bar_play_button", element => {
    /*点击播放暂停按钮事件*/
    element.addEventListener("click", async function (event) {
        if (!nowMusicPlayer) {
            let nowPlaySetData = parseSessionJson("nowPlaySetData");
            if (!nowPlaySetData) {
                try {
                    let data = null;
                    let searchInput = document.getElementById("music_search_input");
                    if (searchInput.value === "") {
                        let nowMscSetId = sessionStorage.getItem("nowMscSetId");
                        data = await getJsonWithAuth(`/musicSets/${nowMscSetId}?_page=0&_limit=999`);
                    } else {
                        data = await getJsonWithAuth(`/musics?_page=0&_limit=999&nameLike=${searchInput.value}`);
                    }
                    sessionStorage.setItem("nowPlaySetData", JSON.stringify(data));
                    let musicData = randListItem(data.contents);
                    sessionStorage.setItem("nowPlayData", JSON.stringify(musicData));
                } catch (error) {
                    displayError(error);
                }
            }
            playMusic();
        } else if (nowMusicPlayer.playing()) {
            nowMusicPlayer.pause();
            stopMusicBarInterval();
            callElement("music_bar_play_button", element => {
                element.src = "/static/icons/next_page_trans.png"
            });
        } else {
            onPlayMusic();
        }
    });
});

function onClickVolume(event, percentage){
    if (nowMusicPlayer) {
        let volume = parseInt(percentage) / 10.0;
        localStorage.setItem("nowPlayVolume", percentage);
        nowMusicPlayer.volume(volume);
    }
}

function startMusicBarInterval() {
    /*执行定时器*/
    let firstDuration = nowMusicPlayer.duration() || 1;
    callElement("music_bar_end_text", element => {
        element.textContent = formatSeconds(firstDuration);
    });
    musicBarProcessInterval = setInterval(function () {
        let currentTime = nowMusicPlayer.seek() || 0;
        let duration = nowMusicPlayer.duration() || 1;
        let progressPercent = (currentTime / duration) * 100;
        callElement("music_bar_start_text", element => {
            element.textContent = formatSeconds(currentTime);
        });
        musicPlayProgress?.update(progressPercent);
    }, 1000);
}

function stopMusicBarInterval() {
    /*终止定时器*/
    clearInterval(musicBarProcessInterval);
}

function onClickPlayProgress(event, percentage){
    if (nowMusicPlayer) {
        let progressPercent = percentage / 100.0;
        let duration = nowMusicPlayer.duration();
        let currentTime = duration * progressPercent;
        nowMusicPlayer.seek(currentTime);
        callElement("music_bar_start_text", element => {
            element.textContent = formatSeconds(currentTime);
        });
        if (!nowMusicPlayer.playing()) {
            onPlayMusic();
        }
    }
}

callElement("music_bar_order_button", element => {
    element.addEventListener("click", function (event) {
        /*点击切换播放模式*/
        let nowPlayMode = sessionStorage.getItem("nowPlayMode");
        if (nowPlayMode === "order") {
            sessionStorage.setItem("nowPlayMode", "random");
            event.target.src = "/static/icons/random_order.png";
        } else if (nowPlayMode === "random") {
            sessionStorage.setItem("nowPlayMode", "only");
            event.target.src = "/static/icons/only_play.png";
        } else {
            sessionStorage.setItem("nowPlayMode", "order");
            event.target.src = "/static/icons/order_play.png";
        }
    });
})

callElement("music_bar_rewind_button", element => {
    element.addEventListener("click", function (event) {
        /*点击上一首*/
        let nowPlaySetData = parseSessionJson("nowPlaySetData");
        if (!nowPlaySetData || nowPlaySetData.contents.length < 1) {
            playMusic();
            return;
        }
        let nowPlayData = parseSessionJson("nowPlayData");
        if (!nowPlayData || !isInSet(nowPlaySetData.contents, nowPlayData)) {
            playMusic();
            return;
        }
        let nowPlayMode = sessionStorage.getItem("nowPlayMode");
        if (nowPlayMode === "random") {
            /*随机播放*/
            let nowPlayOrder = parseSessionJson("nowPlayOrder");
            if (!nowPlayOrder || nowPlayOrder.length !== nowPlaySetData.contents.length || !isInSet(nowPlayOrder, nowPlayData)) {
                nowPlayOrder = shuffleArray(nowPlaySetData.contents);
                sessionStorage.setItem("nowPlayOrder", JSON.stringify(nowPlayOrder));
            }
            sessionStorage.setItem("nowPlayData", JSON.stringify(getBeforeMusic(nowPlayOrder, nowPlayData)));
            playMusic();
        } else {
            /*顺序播放*/
            sessionStorage.setItem("nowPlayData", JSON.stringify(getBeforeMusic(nowPlaySetData.contents, nowPlayData)));
            playMusic();
        }
    });
})

callElement("music_bar_forward_button", element => {
    element.addEventListener("click", function (event) {
        /*点击下一首*/
        let nowPlaySetData = parseSessionJson("nowPlaySetData");
        if (!nowPlaySetData || nowPlaySetData.contents.length < 1) {
            playMusic();
            return;
        }
        let nowPlayData = parseSessionJson("nowPlayData");
        if (!nowPlayData || !isInSet(nowPlaySetData.contents, nowPlayData)) {
            playMusic();
            return;
        }
        let nowPlayMode = sessionStorage.getItem("nowPlayMode");
        if (nowPlayMode === "random") {
            /*随机播放*/
            let nowPlayOrder = parseSessionJson("nowPlayOrder");
            if (!nowPlayOrder || nowPlayOrder.length !== nowPlaySetData.contents.length || !isInSet(nowPlayOrder, nowPlayData)) {
                nowPlayOrder = shuffleArray(nowPlaySetData.contents);
                sessionStorage.setItem("nowPlayOrder", JSON.stringify(nowPlayOrder));
            }
            sessionStorage.setItem("nowPlayData", JSON.stringify(getNextMusic(nowPlayOrder, nowPlayData)));
            playMusic();
        } else {
            /*顺序播放*/
            sessionStorage.setItem("nowPlayData", JSON.stringify(getNextMusic(nowPlaySetData.contents, nowPlayData)));
            playMusic();
        }
    });
});

function getBeforeMusic(setData, nowPlayData) {
    /*获取上一首歌曲的数据*/
    let musicId = nowPlayData.id;
    let index = setData.findIndex(item => item.id === musicId);
    let nextIndex = (index - 1 + (setData.length || 1)) % (setData.length || 1);
    return setData[nextIndex];
}

callElement("music_add_set_button", element => {
    element.addEventListener("click", function (event) {
        /*添加点击事件*/
        let nowPlayData = parseSessionJson("nowPlayData");
        if (!nowPlayData) {
            displayError("未选择音频")
        }
        sessionStorage.setItem("nowControlData", JSON.stringify(nowPlayData));
        callElement("msc_add_set_name", async function (selectElement) {
            selectElement.innerHTML = null;
            await create_collect_option(selectElement);
        });
        displayElementById("msc_add_set_overlay");
    });
});

async function create_collect_option(element) {
    /*添加合集选项*/
    try {
        let getUrl = "/musicSets?_page=0&_limit=999";
        let setData = await getJsonWithAuth(getUrl);
        setData.forEach(setDataItem => {
            let option = createOption(setDataItem.name, setDataItem.id);
            element.appendChild(option);
        });
    } catch (error) {
        displayError(error);
    }
}

callElement("msc_add_set_cancel", element => {
    element.addEventListener("click", function (event) {
        /*点击关闭*/
        hiddenElementById("msc_add_set_overlay");
    });
});

callElement("msc_add_set_form", element => {
    element.addEventListener("submit", function (event) {
        event.preventDefault();
        let spinner = createSpinner("msc_add_set_button_panel");
        try{
            let nowControlData = parseSessionJson("nowControlData");
            let formData = {
                "music_id": nowControlData.id
            }
            let setId = document.getElementById("msc_add_set_name").value;
            let postUrl = `/musicSets/${setId}/add`;
            let nowMscSetId = sessionStorage.getItem("nowMscSetId");
            postJsonWithAuth(postUrl, formData).then(data => {
                displayMessage(data.message);
                if (setId === nowMscSetId) {
                    updateMusicList();
                }
                hiddenElementById("msc_add_set_overlay");
                spinner?.remove();
            });
        } catch(error){
            displayError(error);
            spinner?.remove();
        };
    });
});