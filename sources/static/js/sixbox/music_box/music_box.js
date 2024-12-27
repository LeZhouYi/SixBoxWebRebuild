window.addEventListener("load",function () {
    /*检查并初始化存储数据*/
    checkLocalStorage();

    /*侧边栏初始化*/
    initSidebar("musicBox", "music_box_container");
    bindSidebarEvent("main_side_bar_button", "music_box_container");

    /*页面调整*/
    setNavigationBarTitle("音乐盒");
    loadUserInfo(function(){
        initBackground();
    });
    resizeFullScreen();

    window.addEventListener("resize", throttle(function () {
        resizeFullScreen("bodyContainer");
    }), 200);
});

function checkLocalStorage() {
    /*检查本地缓存，解析Url并将参数存入缓存*/
    let accessToken = localStorage.getItem("accessToken");
    let refreshToken = localStorage.getItem("refreshToken");
    if (accessToken === null || refreshToken === null) {
        window.location.href = "/login.html";
    }
}