const sideBarMap = {
    "fileSystem": {
        "url": "/home.html",
        "elementIds": ["side_bar_file_sys"]
    }
}

export function initSideBar(nowPage){
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
                });
                if(nowPage===nowPage){
                    element.classList.add("active");
                }
            }
        });
    }
}