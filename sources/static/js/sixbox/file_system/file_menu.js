callElement("file_sys_container", element=>{
    element.addEventListener("click", function (event) {
        /*点击容器关闭文件菜单*/
        if (isInClientWidth(0, 999)) {
            callElement("file_sys_menu", fileMenuElement=>{
                if(isDisplayValue(fileMenuElement, "grid")&&!fileMenuElement.contains(event.target)){
                    fileMenuElement.style.display = "none";
                }
            });
        }
    });
});

callElement("file_menu_pop_button", element=>{
    element.addEventListener("click", function (event) {
        /*点击弹出文件菜单*/
        if (!isInClientWidth(0, 999)) {
            return;
        }
        callElement("file_sys_menu", fileMenuElement=>{
            if (isDisplayValue(fileMenuElement, "none")) {
                fileMenuElement.style.display = "grid";
            } else {
                fileMenuElement.style.display = "none";
            }
        });
        event.stopPropagation();
    });
});

function onFileMenuResize() {
    /*文件菜单尺寸变化*/
    callElement("file_sys_menu", fileMenuElement=>{
        if (!isInClientWidth(0, 999)) {
            if (isDisplayValue(fileMenuElement, "none")) {
                fileMenuElement.style.display = "grid";
            }
        } else{
            if (isDisplayValue(fileMenuElement, "grid")){
                fileMenuElement.style.display = "none";
            }
        }
    });
}

function hiddenFileMenu() {
    /*隐藏文件菜单*/
    if (isInClientWidth(0, 999)) {
        callElement("file_sys_menu", fileMenuElement=>{
            if (isDisplayValue(fileMenuElement, "grid")){
                fileMenuElement.style.display = "none";
            }
        });
    }
}