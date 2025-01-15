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
    updateCollectList();
    updateMusicList();

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
    checkLocalDefault("nowMscSetId", "1");
}

async function updateMusicList(){
    /*更新并显示当前音频合集*/
    try{
        let nowPage = localStorage.getItem("nowPage");
        let pageIndex = parseInt(nowPage) - 1;
        let nowLimit = localStorage.getItem("nowLimit");
        let nowMscSetId = localStorage.getItem("nowMscSetId");
        let data = await getJsonWithAuth(`/musicSets/${nowMscSetId}?_page=${pageIndex}&_limit=${nowLimit}`);

        callElement("music_control_title_text", titleElement=>{
            titleElement.textContent = data.name;
        });
        let contents = data.contents;
        callElement("music_content_row", rowElement=>{
            rowElement.innerHTML = null;
            contents.forEach(content => {
                rowElement.appendChild(createMusicItem(content));
            });
        });
    } catch(error){
        displayError(error);
    }
}

function createMusicItem(content){
    /*创建单行音频元素*/
    let musicItem = document.createElement("div");
    musicItem.classList.add("music_content");

    let musicItemName = document.createElement("div");
    musicItemName.classList.add("music_item_name_div");

    let musicItemIcon = document.createElement("img");
    musicItemIcon.classList.add("music_item_name_icon");
    musicItemIcon.src = "/static/icons/music.png";
    musicItemName.appendChild(musicItemIcon);

    let musicItmeNameText = document.createElement("div");
    musicItmeNameText.classList.add("music_item_name_text");
    musicItmeNameText.textContent = content.name;
    musicItemName.appendChild(musicItmeNameText);

    musicItem.appendChild(musicItemName);

    let musicItemSinger = document.createElement("div");
    musicItemSinger.classList.add("music_item_text");
    musicItemSinger.textContent = content.singer;
    musicItem.appendChild(musicItemSinger);

    let musicItemAlbum = document.createElement("div");
    musicItemAlbum.classList.add("music_item_text");
    musicItemAlbum.textContent = content.album;
    musicItem.appendChild(musicItemAlbum);

    let musicItemTags = document.createElement("div");
    musicItemTags.classList.add("music_item_tags_div");
    musicItemTags.textContent = content.tags;
    musicItem.appendChild(musicItemTags);

    let musicItemControl = document.createElement("div");
    musicItemControl.classList.add("music_item_control_div");

    let controlImg = document.createElement("img");
    controlImg.classList.add("music_item_control_img", "clickable");
    controlImg.src = "/static/icons/dots.png";
    musicItemControl.appendChild(controlImg);

    musicItem.appendChild(musicItemControl);

    return musicItem;
}

async function updateCollectList(){
    /*更新合集列表*/
    try{
        let data = await getJsonWithAuth("/musicSets?_page=0&_limit=999");
        clearElementByStart("music_menu_dl");
        callElement("music_menu_dl", menuElement=>{
            data.forEach(content => {
                menuElement.appendChild(createMusicMenuItem(content));
            });
        });
    } catch(error){
        displayError(error);
    }
}

function createMusicMenuItem(content){
    /*创建合集元素*/
    let menuItemDiv = document.createElement("div");
    menuItemDiv.classList.add("music_menu_item");

    let menuItemIconDiv = document.createElement("div");
    menuItemIconDiv.classList.add("music_menu_image_div");
    let menuItemIcon = document.createElement("img");
    menuItemIcon.classList.add("music_menu_image");
    menuItemIcon.src = "/static/icons/music.png";
    menuItemIconDiv.appendChild(menuItemIcon);

    menuItemDiv.appendChild(menuItemIconDiv);

    let menuItemText = document.createElement("div");
    menuItemText.classList.add("music_menu_item_text");
    menuItemText.textContent = content.name;
    menuItemDiv.appendChild(menuItemText);

    return menuItemDiv;
}