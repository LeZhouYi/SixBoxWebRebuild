const sideBarMap = {
    "fileSystem": {
        "url": "/home.html",
        "elementIds": ["side_bar_file_sys"]
    }
}

function initSideBarAnima(contentId){
    /*初始化时添加动画类*/
    let contentElement = document.getElementById(contentId);
    if(!contentElement){
        return;
    }
    /*左右移动的动画*/
    contentElement.classList.add("padding_trans");
}

function reverseIsShowSideBar(){
    /*反转是否显示/隐藏侧边栏*/
    if(localStorage.getItem("isShowSideBar")==="1"){
        localStorage.getItem("isShowSideBar")==="0";
    }else{
        localStorage.getItem("isShowSideBar")==="1"
    }
}

function bindSideButtonClick(element, sideBarId, overlayId){
    /*绑定侧边栏按钮的点击事件*/
    element.addEventListener("click", function(event){
        let currentUrl = `${window.location.pathname}`;
        if (currentUrl!==sideBarValue.url){
            /*若当前的位置已是激活状态，则不用跳转*/
            window.location = sideBarValue.url;
        }
        let overlayElement = document.getElementById(overlayId);
        let sideBarElement = document.getElementById(sidebarId);
        if(!overlayElement||!sideBarElement){
            return;
        }
        if (isInClientWidth(0,1300)){
            /*低于1300px时，点击后侧边栏要关闭*/
            localStorage.setItem("isShowSideBar", "0");
            updateSideBar(overlayElement,sideBarElement)
//            changeSideBar(overlayElement,sideBarElement);
        }
    });
}

function initSideBar(nowPage,sidebarId="side_bar_container", overlayId="side_bar_overlay"){
    /*初始化侧边栏的内容，基础数据*/
    for (let sideBarKey in sideBarMap){
        var sideBarValue = sideBarMap[sideBarKey];
        sideBarValue.elementIds.forEach(elementId=>{
            let element = document.getElementById(elementId);
            if (element){
                /*绑定点击事件*/
                bindSideButtonClick(element,sidebarId,overlayId);
                if(nowPage===nowPage){
                    /*设置当前选中效果*/
                    element.classList.add("active");
                }
            }
        });
    }
    /*检查本地缓存*/
    checkLocalDefault("isShowSideBar", "1");
}

function updateSideBar(overlayElement, sideBarElement){
    let isShowSideBar = localStorage.getItem("isShowSideBar");
    if(isShowSideBar!=="1"){
        /*表示要隐藏元素*/
        sideBarElement.style.transform = "translateX(-100%)";
        setTimeout(()=>{
            overlayElement.style.display="none";
        }, 1100);
    }else{
        /*表示要显示元素*/
        overlayElement.style.display="block";
        setTimeout(()=>{
            sideBarElement.style.transform = "translateX(0)";
        }, 100);
    }
}

function onSideBarReside(sidebarId="side_bar_container", overlayId="side_bar_overlay"){
    /*当页面尺寸变化时，调整侧边栏显示*/
    let overlayElement = document.getElementById(overlayId);
    let sideBarElement = document.getElementById(sidebarId);
    if(!overlayElement||!sideBarElement){
        return;
    }
    if (!isInClientWidth(0,1300)){
        if(!overlayElement.style.display || overlayElement.style.display==="none"){
            overlayElement.style.display="";
            setTimeout(()=>{
                sideBarElement.style = "";
            }, 100);
        }
    }else{
        if(overlayElement.style.display==="block"){
            sideBarElement.style.transform = "translateX(-100%)";
            setTimeout(()=>{
                overlayElement.style.display="none";
            }, 1100);
        }
    }
}

function bindSideBarEvent(controlId, contentId, sidebarId="side_bar_container", overlayId="side_bar_overlay"){
    /*
        绑定点击相关事件，controlID为控制侧边栏展开隐藏的元素
        contentId为与侧边栏共存的页面
    */
    let controlElement = document.getElementById(controlId);
    let overlayElement = document.getElementById(overlayId);
    let sideBarElement = document.getElementById(sidebarId);
    if(!controlElement||!overlayElement||!sideBarElement){
        return;
    }
    overlayElement.addEventListener("click", function(event){
        if (isInClientWidth(0,1300) && !sideBarElement.contains(event.target)){
            changeSideBar(overlayElement,sideBarElement);
        }
    });
    controlElement.addEventListener("click", function(event){
        let contentElement = document.getElementById(contentId);

        if(!contentElement){
            return;
        }
        let sideBarExpand = "side_bar_expand";  //添加将页面主内容腾出侧边栏的显示空间
        let sidebarHidden = "side_bar_hidden";  //添加将侧边栏往左移出页面
        if(sideBarElement && contentElement){
            if (!isInClientWidth(0,1300)){
                if(sideBarElement.classList.contains(sidebarHidden)){
                    overlayElement.style.display="block";
                    contentElement.classList.add(sideBarExpand);
                    setTimeout(()=>{
                        sideBarElement.classList.remove(sidebarHidden);
                    },100);
                }else if(!sideBarElement.classList.contains(sidebarHidden)){
                    sideBarElement.classList.add(sidebarHidden);
                    contentElement.classList.remove(sideBarExpand);
                    setTimeout(()=>{
                        overlayElement.style.display="none";
                    }, 1000);
                }
            }else{
                changeSideBar(overlayElement,sideBarElement);
            }
        }
    });
}