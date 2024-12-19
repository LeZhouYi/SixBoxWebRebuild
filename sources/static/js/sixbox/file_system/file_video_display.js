window.addEventListener("load",function () {
    clickMultiOverlayHidden("video_display_overlay", ["video_display_panel"]);
});

function bindClickVideo(fileItem, element, fileData){
    /*绑定点击视频事件*/
    element.addEventListener("click", function(event){
        displayElementById("video_display_overlay");
        localStorage.setItem("nowDisplayId", fileData.id);
        initVideo("video_display_panel", fileData.id);
    });
}

function initVideo(videoId, fileId){
    /*初始化Video*/
    let accessToken = localStorage.getItem("accessToken");
    let fullDomain = getFullDomain();
    let videoUrl = `${fullDomain}/api/v1/files/${fileId}/download?token=${accessToken}`;
    videojs(videoId).ready(function(){
        this.src({
            src: videoUrl,
            type: "video/mp4"
        });
        this.play();
    });
}