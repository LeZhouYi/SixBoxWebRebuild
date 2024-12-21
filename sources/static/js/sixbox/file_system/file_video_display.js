callElement("video_download_button", element=>{
    element.addEventListener("click", function(event){
        /*点击下载视频*/
        let accessToken = localStorage.getItem("accessToken");
        let fileId = localStorage.getItem("nowDisplayId");
        let downloadUrl = `api/v1/files/${fileId}/download?token=${accessToken}`;
        downloadByA(downloadUrl);
    });
});

callElement("video_forward_10_min_button", element=>{
    element.addEventListener("click", function(event){
        /*快进10分*/
        let player = videojs("video_display_panel");
        let current = player.currentTime();
        console.log(current);
        player.currentTime(current+600);
        console.log(player.currentTime());
    });
});

callElement("video_close_button", element=>{
    element.addEventListener("click", function(event){
        /*点击关闭视频*/
        hiddenElementById("video_display_overlay");
    });
});

function bindClickVideo(fileItem, element, fileData){
    /*绑定点击视频事件*/
    element.addEventListener("click", function(event){
        try{
            let spinner = createSpinnerByElement(fileItem, "spin_panel_light");
            localStorage.setItem("nowDisplayId", fileData.id);
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
    let videoUrl = `${fullDomain}/api/v1/files/${fileId}/download?token=${accessToken}`;
    videojs(videoId, {
        controls: true,
        autoplay: false,
        fluid: false,
        preload: false
    }).ready(function(){
        this.src({
            src: videoUrl,
            type: fileType
        });
        callback?.();
    });
}