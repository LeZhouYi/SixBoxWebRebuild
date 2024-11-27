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
    contentElement.classList.add("padding_trans");
}

function initSideBar(nowPage,sidebarId="side_bar_container", overlayId="side_bar_overlay"){
    /*初始化侧边栏*/
    for (let sideBarKey in sideBarMap){
        var sideBarValue = sideBarMap[sideBarKey];
        sideBarValue.elementIds.forEach(elementId=>{
            var element = document.getElementById(elementId);
            if (element){
                element.addEventListener("click", function(event){
                    let currentUrl = `${window.location.pathname}`;
                    if (currentUrl!==sideBarValue.url){
                        window.location = sideBarValue.url;
                    }
                    let overlayElement = document.getElementById(overlayId);
                    let sideBarElement = document.getElementById(sidebarId);
                    if(!overlayElement||!sideBarElement){
                        return;
                    }
                    if (isInClientWidth(0,1300)){
                        changeSideBar(overlayElement,sideBarElement);
                    }
                });
                if(nowPage===nowPage){
                    element.classList.add("active");
                }
            }
        });
    }
}

function changeSideBar(overlayElement, sideBarElement){
    /*侧边栏变换*/
    if(!overlayElement.style.display || overlayElement.style.display==="none"){
        overlayElement.style.display="block";
        setTimeout(()=>{
            sideBarElement.style.transform = "translateX(0)";
        }, 100);
    }else{
        sideBarElement.style.transform = "translateX(-100%)";
        setTimeout(()=>{
            overlayElement.style.display="none";
        }, 1100);
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