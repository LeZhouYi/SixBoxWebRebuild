window.addEventListener("load",function () {
    clickOverlayHidden("music_control_overlay", "music_control_content");
});

function addClickMusicControl(element, data){
    /*添加元素的点击操作音乐事件*/
    if(element){
        element.addEventListener("click", function(event){
            displayElementById("music_control_overlay");
            adjustRelativeLDPopup("music_control_content", event.pageX, event.pageY);
            addObserveResizeHiddenById("music_control_overlay");
            sessionStorage.setItem("nowControlData", JSON.stringify(data));
        });
    }
}