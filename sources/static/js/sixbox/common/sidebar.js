const SideBarMap = {
    "fileSystem": {
        "url": "/home.html",
        "elementIds": ["side_bar_file_sys"]
    }
}
const SideBarWidth = 1300;

function initSidebar(nowPage, contentId, sidebarId = "side_bar_container", overlayId = "side_bar_overlay") {
    /*初始化侧边栏的内容，基础数据*/
    for (let sidebarKey in SideBarMap) {
        var sidebarValue = SideBarMap[sidebarKey];
        sidebarValue.elementIds.forEach(elementId => {
            getElement(elementId, element => {
                /*绑定点击事件*/
                bindSideButtonClick(element, sidebarValue.url, contentId, sidebarId, overlayId);
                if (nowPage === nowPage) {
                    /*设置当前选中效果*/
                    element.classList.add("active");
                }
            });
        });
    }
    /*初始设置为展示状态*/
    checkLocalDefault("isShowSidebar", "1");
    updateSidebar(contentId, sidebarId, overlayId);
}

function updateSidebar(contentId, sidebarId = "side_bar_container", overlayId = "side_bar_overlay") {
    /*根据当前缓存控制显示/隐藏侧边栏*/
    let contentElement = document.getElementById(contentId);
    let overlayElement = document.getElementById(overlayId);
    let sidebarElement = document.getElementById(sidebarId);
    let isShowSidebar = localStorage.getItem("isShowSidebar");
    if (!contentElement || !overlayElement || !sidebarElement || !isShowSidebar) {
        return;
    }
    if (isShowSidebar === "1" && isDisplayValue(overlayElement, "none")) {
        /*显示侧边栏*/
        overlayElement.style.display = "block";
        setTimeout(() => {
            sidebarElement.style.transform = "translateX(0%)";
            contentElement.classList.add("side_bar_expand");
        }, 100);
    } else if (isDisplayValue(overlayElement, "block")) {
        /*隐藏侧边栏*/
        sidebarElement.style.transform = "translateX(-100%)";
        contentElement.classList.remove("side_bar_expand");
        setTimeout(() => {
            overlayElement.style.display = "none";
        }, 1100);
    }
}

function bindSideButtonClick(element, url, contentId, sidebarId, overlayId) {
    /*绑定侧边栏按钮的点击事件*/
    element.addEventListener("click", function (event) {
        let currentUrl = `${window.location.pathname}`;
        if (currentUrl !== url) {
            /*若当前的位置已是激活状态，则不用跳转*/
            window.location = url;
        }
        if (isInClientWidth(0, SideBarWidth)) {
            /*点击侧边栏按钮*/
            reverseIsShowSidebar();
            updateSidebar(contentId, sidebarId, overlayId);
        }
    });
}

function bindSidebarEvent(controlId, contentId, sidebarId = "side_bar_container", overlayId = "side_bar_overlay") {
    /*
        绑定点击相关事件，controlID为控制侧边栏展开隐藏的元素
        contentId为与侧边栏共存的页面
    */
    let controlElement = document.getElementById(controlId);
    let overlayElement = document.getElementById(overlayId);
    let sidebarElement = document.getElementById(sidebarId);
    if (!controlElement || !overlayElement || !sidebarElement) {
        return;
    }
    overlayElement.addEventListener("click", function (event) {
        /*点击空白处*/
        if (isInClientWidth(0, SideBarWidth) && !sidebarElement.contains(event.target)) {
            reverseIsShowSidebar();
            updateSidebar(contentId, sidebarId, overlayId);
        }
    });
    controlElement.addEventListener("click", function (event) {
        /*点击展开/隐藏按钮*/
        reverseIsShowSidebar();
        updateSidebar(contentId, sidebarId, overlayId);
    });
}

function reverseIsShowSidebar() {
    /*反转是否显示/隐藏侧边栏*/
    if (localStorage.getItem("isShowSidebar") === "1") {
        localStorage.setItem("isShowSidebar", "0");
    } else {
        localStorage.setItem("isShowSidebar", "1");
    }
}

function onSidebarResize(contentId, sidebarId = "side_bar_container", overlayId = "side_bar_overlay"){
    /*当元素尺寸变化*/
    let controlElement = document.getElementById(controlId);
    let overlayElement = document.getElementById(overlayId);
    let sidebarElement = document.getElementById(sidebarId);
    if (!controlElement || !overlayElement || !sidebarElement) {
        return;
    }
    if(!isInClientWidth(0,SideBarWidth)){
        localStorage.setItem("isShowSidebar", "0");
        updateSidebar(contentId, sidebarId, overlayId);
    }
}