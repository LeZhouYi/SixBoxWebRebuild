window.addEventListener("load",function () {
    clickOverlayHidden("navigation_user_overlay", "navigation_user_content");
});

function setNavigationBarTitle(title,elementId="navigation_header_title"){
    /*设置导航栏标题*/
    callElement(elementId, element=>{
        element.textContent = title;
    })
}

callElement("navigate_user_button", element=>{
    /*点击用户图标*/
    element.addEventListener("click", function(event){
        displayElementById("navigation_user_overlay");
        adjustRelativeLDPopup("navigation_user_content", event.pageX, event.pageY);
        addObserveResizeHiddenById("navigation_user_overlay");
    });
});

callElement("user_logout_button", element=>{
    /*点击登出*/
    element.addEventListener("click", function(event){
        window.location.href = "/login.html";
    });
});