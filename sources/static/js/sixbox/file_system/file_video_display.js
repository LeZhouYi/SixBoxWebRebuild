callElement("video_download_button", element=>{
    element.addEventListener("click", function(event){
        /*点击下载视频*/
        let accessToken = localStorage.getItem("accessToken");
        let fileId = sessionStorage.getItem("nowDisplayId");
        let downloadUrl = `api/v1/files/${fileId}/download?token=${accessToken}`;
        downloadByA(downloadUrl);
    });
});

callElement("video_rewind_10_min_button", element=>{
    element.addEventListener("click", function(event){
        /*快进10分*/
        let player = videojs("video_display_panel");
        let current = player.currentTime();
        player.currentTime(current-600);
    });
});

callElement("video_rewind_1_min_button", element=>{
    element.addEventListener("click", function(event){
        /*快进10分*/
        let player = videojs("video_display_panel");
        let current = player.currentTime();
        player.currentTime(current-60);
    });
});

callElement("video_rewind_10_sec_button", element=>{
    element.addEventListener("click", function(event){
        /*快进10分*/
        let player = videojs("video_display_panel");
        let current = player.currentTime();
        player.currentTime(current-10);
    });
});

callElement("video_forward_10_sec_button", element=>{
    element.addEventListener("click", function(event){
        /*快进10分*/
        let player = videojs("video_display_panel");
        let current = player.currentTime();
        player.currentTime(current+10);
    });
});

callElement("video_forward_1_min_button", element=>{
    element.addEventListener("click", function(event){
        /*快进10分*/
        let player = videojs("video_display_panel");
        let current = player.currentTime();
        player.currentTime(current+60);
    });
});

callElement("video_forward_10_min_button", element=>{
    element.addEventListener("click", function(event){
        /*快进10分*/
        let player = videojs("video_display_panel");
        let current = player.currentTime();
        player.currentTime(current+600);
    });
});

callElement("video_close_button", element=>{
    element.addEventListener("click", function(event){
        /*点击关闭视频*/
        hiddenElementById("video_display_overlay");
        let player = videojs("video_display_panel");
        player.dispose();
        callElement("video_display_content", element=>{
            let videoPanel = document.createElement("video");
            videoPanel.id = "video_display_panel";
            videoPanel.controls = true;
            videoPanel.classList.add("video-js","video_display_panel");
            element.insertBefore(videoPanel,element.firstChild);
        });
    });
});

function bindClickVideo(fileItem, element, fileData){
    /*绑定点击视频事件*/
    element.addEventListener("click", function(event){
        let spinner = null;
        try{
            spinner = createSpinnerByElement(fileItem, "spin_panel_light");
            sessionStorage.setItem("nowDisplayId", fileData.id);
            initVideo("video_display_panel", fileData.id, fileData.mimeType, function(){
                displayElementById("video_display_overlay");
                spinner.remove();
            });
        } catch (error){
            displayError(error);
            spinner?.remove();
        }
    });
}

function initVideo(videoId, fileId, fileType, callback){
    /*初始化Video*/
    let accessToken = localStorage.getItem("accessToken");
    let fullDomain = getFullDomain();
    let videoUrl = `${fullDomain}/api/v1/videos/${fileId}/play?token=${accessToken}`;
    let nowPlayVolume = localStorage.getItem("nowPlayVolume");
    nowPlayVolume = nowPlayVolume/100;
    videojs(videoId, {
        controls: true,
        autoplay: false,
        fluid: false,
        preload: false,
        muted: false
    }).ready(function(){
        this.volume(nowPlayVolume);
        this.src({
            src: videoUrl,
            type: fileType
        });
        this.on("volumechange", function(){
            if (!this.muted()){
                let currentVolume = Math.round(this.volume()*100);
                localStorage.setItem("nowPlayVolume", currentVolume);
            }
        });
        callback?.();
    });

}