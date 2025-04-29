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
    initMusicBar();

    window.addEventListener("resize", throttle(function () {
        resizeFullScreen("bodyContainer");
    }), 200);
});

function initMusicBar(){
    /*初始化页面元素*/
    callElement("music_bar_volume", element=>{
        let nowPlayVolume = localStorage.getItem("nowPlayVolume");
        element.value = nowPlayVolume;
    });
    callElement("music_bar_order_button", element=>{
        let nowPlayMode = sessionStorage.getItem("nowPlayMode");
        if (nowPlayMode === "order"){
            element.src = "/static/icons/order_play.png";
        } else if (nowPlayMode === "random"){
            element.src = "/static/icons/random_order.png";
        } else{
            element.src = "/static/icons/only_play.png";
        }
    });
}

function checkLocalStorage() {
    /*检查本地缓存，解析Url并将参数存入缓存*/
    let accessToken = localStorage.getItem("accessToken");
    let refreshToken = localStorage.getItem("refreshToken");
    if (accessToken === null || refreshToken === null) {
        window.location.href = "/login.html";
    }
    checkSessionDefault("nowMscSetId", "1");
    checkLocalDefault("nowPlayVolume", "10");
    checkSessionDefault("nowPlayMode", "order");
}

async function updateMusicList(){
    /*更新并显示当前音频合集*/
    try{
        let nowMscSetId = sessionStorage.getItem("nowMscSetId");
        let searchInput = document.getElementById("music_search_input");
        let data = null;

        if (searchInput.value !== ""){
            data = await getJsonWithAuth(`/musics?_page=0&_limit=999&nameLike=${searchInput.value}`);
            callElement("music_control_title_text", titleElement=>{
                titleElement.textContent = "搜索";
            });
        } else{
            data = await getJsonWithAuth(`/musicSets/${nowMscSetId}?_page=0&_limit=999`);
            callElement("music_control_title_text", titleElement=>{
                titleElement.textContent = data.name;
            });
        }
        let contents = data.contents;
        callElement("music_content_row", rowElement=>{
            rowElement.innerHTML = null;
            contents.forEach(content => {
                rowElement.appendChild(createMusicItem(content, data));
            });
        });


    } catch(error){
        displayError(error);
    }
}

function createMusicItem(content, setData){
    /*创建单行音频元素*/
    let musicItem = document.createElement("div");
    musicItem.classList.add("music_content");

    let musicItemName = document.createElement("div");
    musicItemName.classList.add("music_item_name_div", "clickable");

    bindClickMusicItem(musicItemName, content, setData);

    let musicItemIcon = document.createElement("img");
    musicItemIcon.classList.add("music_item_name_icon");
    musicItemIcon.src = "/static/icons/music.png";
    musicItemName.appendChild(musicItemIcon);

    let musicItemNameText = document.createElement("div");
    musicItemNameText.classList.add("music_item_name_text");
    musicItemNameText.textContent = content.name;
    musicItemName.appendChild(musicItemNameText);

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
    addClickMusicControl(controlImg, content);
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
    menuItemDiv.classList.add("music_menu_item", "clickable");

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

    binkClickMenuItem(menuItemDiv, content);
    return menuItemDiv;
}

callElement("cancel_popup_button", element=>{
    /*取消删除*/
    element.addEventListener("click", function(event){
        hiddenElementById("confirm_popup_overlay");
    });
});

callElement("confirm_popup_button", element=>{
    /*确认删除*/
    element.addEventListener("click", function(event){
        let nowControlData = parseSessionJson("nowControlData");
        if (nowControlData.type){
            if(nowControlData.type==="musicSet"){
                let deleteUrl = `/musicSets/${nowControlData.id}`;
                deleteJsonWithAuth(deleteUrl).then(data => {
                    displayMessage(data.message);
                    hiddenElementById("confirm_popup_overlay");
                    sessionStorage.setItem("nowMscSetId", "1");
                    updateCollectList();
                    updateMusicList();
                })
                .catch(error =>{
                    displayError(error);
                });
            }
        }else{
            let deleteUrl = `/musics/${nowControlData.id}`;
            deleteJsonWithAuth(deleteUrl).then(data => {
                displayMessage(data.message);
                hiddenElementById("confirm_popup_overlay");
                updateMusicList();
            })
            .catch(error =>{
                displayError(error);
            });
        }
    });
});

callElement("music_search_input", element=>{
    element.addEventListener("keydown", function (event) {
        /*输入搜索文件*/
        if (event.key === "Enter" || event.keyCode === 13) {
            event.preventDefault();
            event.target.blur();
        }
    });
    element.addEventListener("blur", function (event) {
        /*失去焦点触发页面输入*/
        event.preventDefault();
        updateMusicList();
    });
});