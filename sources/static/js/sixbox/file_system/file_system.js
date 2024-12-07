const FileTypeMap = {
    "0": {
        "src": "/sources?filename=icons/all_file.png",
        "text": "文件夹",
        "controls": [
            0, 1, 3, 4
        ]
    },
    "1": {
        "src": "/sources?filename=icons/file.png",
        "text": "文件",
        "controls": [
            0, 1, 2, 3, 4
        ]
    },
    "2": {
        "src": "/sources?filename=icons/image.png",
        "text": "图片",
        "controls": [
            0, 1, 2, 3, 4
        ]
    },
    "3": {
        "src": "/sources?filename=icons/music.png",
        "text": "音频",
        "controls": [
            0, 1, 2, 3, 4
        ]
    },
    "4": {
        "src": "/sources?filename=icons/movie.png",
        "text": "视频",
        "controls": [
            0, 1, 2, 3, 4
        ]
    }
}

window.onload = function () {
    /*检查并初始化存储数据*/
    checkLocalStorage();

    /*侧边栏初始化*/
    initSidebar("fileSystem", "file_sys_container");
    bindSidebarEvent("file_sys_side_button", "file_sys_container");

    /*页面功能*/
    updateFileList();

    /*页面调整*/
    resizeFullScreen();

    /*事件相关*/
    clickOverlayHidden("file_add_popup_overlay", "file_add_content");
    clickOverlayHidden("file_edit_popup_overlay", "file_edit_content");

    window.addEventListener("resize", throttle(function () {
        resizeFullScreen("bodyContainer");
    }), 200);
    window.addEventListener("resize", throttle(function () {
        onFileMenuResize();
    }), 2000);
};

callElement("all_file_button", element=>{
	element.addEventListener("click", function (event) {
        /*点击所有文件*/
        hiddenFileMenu();
        let nowFolderId = localStorage.getItem("nowFolderId");
        let nowPage = localStorage.getItem("nowPage");
        let searchInput = document.getElementById("file_search_input");
        callElement("file_search_input", searchInput=>{
            if (nowFolderId !== "1" || nowPage !== "1" || searchInput.value !== "") {
                localStorage.setItem("nowFolderId", "1");
                localStorage.setItem("nowPage", "1");
                searchInput.value = "";
                updateFileList();
            }
        });
    });
});

callElement("folder_add_form", element=>{
	element.addEventListener("submit", function (event) {
        /*点击新增文件夹*/
        event.preventDefault();
        let spinner = createSpinner("folder_add_button_panel");
        let formData = {
            name: document.getElementById("folder_add_name").value,
            parentId: document.getElementById("folder_add_folder_select").value
        };
        postJsonWithAuth("/folders", formData).then(data => {
            displayMessage(data.message);
            hiddenElementById("file_add_popup_overlay");
            updateFileList();
        })
        .catch(error => {
            displayError(error);
        })
        .finally(()=>{
            spinner?.remove();
        });
    });
});

callElement("file_add_form", element=>{
	element.addEventListener("submit", function (event) {
        /*点击新增文件*/
        event.preventDefault();
        let fileElement = document.getElementById("file_add_select_element");
        if (!fileElement.files || fileElement.files.length < 1) {
            displayErrorMessage("未选择文件");
        }
        let spinner = createSpinner("file_add_button_panel");
        let formData = new FormData();
        formData.append("file", fileElement.files[0]);
        formData.append("name", document.getElementById("file_add_name").value);
        formData.append("parentId", document.getElementById("file_add_folder_select").value);
        postFormWithAuth("/files", formData).then(data => {
            displayMessage(data.message);
            hiddenElementById("file_add_popup_overlay");
            updateFileList();
        })
        .catch(error => {
            displayError(error);
        })
        .finally(()=>{
            spinner?.remove();
        });
    });
});

callElement("file_add_pop_button", element=>{
	element.addEventListener("click", function (event) {
        /*点击弹出新增文件弹窗*/
        hiddenFileMenu();
        let fileAddContent = document.getElementById("file_add_content");
        displayElementById("file_add_popup_overlay", function () {
            let nowFolderId = localStorage.getItem("nowFolderId");
            loadFolderSelect("file_add_folder_select", nowFolderId);
            loadFolderSelect("folder_add_folder_select", nowFolderId);
        })
        /*动画相关*/
        let addFileFormElement = document.getElementById("file_add_form");
        if (isHidden(addFileFormElement)) {
            fileAddContent.style.height = "498px";
        } else {
            fileAddContent.style.height = "615px";
        }
    });
});

callElement("file_add_cancel", element=>{
	element.addEventListener("click", function (event) {
        /*点击取消新增文件弹窗按钮*/
        hiddenElementById("file_add_popup_overlay");
    });
});

callElement("folder_add_cancel", element=>{
	element.addEventListener("click", function (event) {
        /*点击取消新增文件弹窗按钮*/
        hiddenElementById("file_add_popup_overlay");
    });
});

callElement("file_add_icon", element=>{
	element.addEventListener("click", function (event) {
        /*点击新增文件的切换按钮*/
        let addFileFormElement = document.getElementById("file_add_form");
        let addFolderFormElement = document.getElementById("folder_add_form");
        let addHeaderText = document.getElementById("file_add_header_text");
        let fileAddContent = document.getElementById("file_add_content");
        if (displayElement(addFileFormElement)) {
            hiddenElement(addFolderFormElement);
            addHeaderText.textContent = "新增文件";
            /*动画相关*/
            fileAddContent.style.height = "615px";
        } else {
            hiddenElement(addFileFormElement);
            displayElement(addFolderFormElement);
            addHeaderText.textContent = "新增文件夹";
            /*动画相关*/
            fileAddContent.style.height = "498px";
        }
    });
});

callElement("file_add_icon", element=>{
	element.addEventListener("mouseenter", function (event) {
        /*鼠标悬停在新增文件夹图标*/
        let addFormElement = document.getElementById("file_add_form");
        let hoverElement = event.target;
        if (isHidden(addFormElement)) {
            hoverElement.src = "/sources?filename=icons/add_file.png";
        } else {
            hoverElement.src = "/sources?filename=icons/add_folder.png";
        }
    });
});

callElement("file_add_icon", element=>{
    element.addEventListener("mouseleave", function (event) {
        /*鼠标离开在新增文件夹图标*/
        let addFormElement = document.getElementById("file_add_form");
        let hoverElement = event.target;
        if (isHidden(addFormElement)) {
            hoverElement.src = "/sources?filename=icons/add_file_blue.png";
        } else {
            hoverElement.src = "/sources?filename=icons/add_folder_blue.png";
        }
    });
});

callElement("file_add_select_element", element=>{
	element.addEventListener("change", function (event) {
        /*点击选择文件*/
        if (event.target.files && event.target.files.length > 0) {
            let fileName = event.target.files[0].name;
            document.getElementById("file_add_select").value = fileName;
        } else {
            document.getElementById("file_add_select").value = "";
        }
    });
});

callElement("file_add_item_button", element=>{
	element.addEventListener("click", function (event) {
        /*点击新增选择文件*/
        document.getElementById("file_add_select_element").click();
    });
});

callElement("page_input_id", element=>{
	element.addEventListener("input", function (event) {
        /*根据输入动态变换长度*/
        let value = event.target.value.replace(/\D/g, '');
        if (value.length > 3) {
            value = value.slice(0, 3);
        }
        event.target.value = value;
        let elementWidth = 44 + (value.length - 1) * 10;
        if (elementWidth < 44) {
            elementWidth = 44;
        }
        event.target.style.width = elementWidth + "px";
    });
});

callElement("page_input_id", element=>{
	element.addEventListener("keydown", function (event) {
        /*enter触发页面输入*/
        if (event.key === 'Enter' || event.keyCode === 13) {
            updatePageInput(event);
        }
    });
});

callElement("page_input_id", element=>{
	element.addEventListener("blur", function (event) {
        /*失去焦点触发页面输入*/
        updatePageInput(event);
    });
});

callElement("page_select_limit", element=>{
	element.addEventListener("change", function (event) {
        /*更改每页项数*/
        localStorage.setItem("nowPage", "1");
        localStorage.setItem("nowLimit", event.target.value);
        updateFileList();
    });
});

callElement("last_page_button", element=>{
	element.addEventListener("click", function (event) {
        /*点击上一页*/
        let nowPage = parseInt(localStorage.getItem("nowPage"));
        if (nowPage > 1) {
            localStorage.setItem("nowPage", String(nowPage - 1));
            updateFileList();
        }
    });
});

callElement("next_page_button", element=>{
	element.addEventListener("click", function (event) {
        /*点击下一页*/
        let nowPage = parseInt(localStorage.getItem("nowPage"));
        let nowTotalPage = parseInt(localStorage.getItem("nowTotalPage"));
        if (nowPage <= nowTotalPage - 1) {
            localStorage.setItem("nowPage", String(nowPage + 1));
            updateFileList();
        }
    });
});

callElement("file_edit_cancel", element=>{
	element.addEventListener("click", function (event) {
        /*点击编辑文件取消*/
        hiddenElementById("file_edit_popup_overlay");
    });
});

callElement("file_edit_form", element=>{
    element.addEventListener("submit", function (event) {
        /*点击确认编辑*/
        event.preventDefault();
        let spinner = createSpinner("file_edit_button_panel");
        let formData = {
            name: document.getElementById("file_edit_name").value,
            parentId: document.getElementById("file_edit_folder_select").value
        };
        let nowControlData = JSON.parse(localStorage.getItem("nowControlData"));
        if (nowControlData.type === "0") {
            putJsonWithAuth(`/folders/${nowControlData.id}`, formData).then(data => {
                displayMessage(data.message);
                hiddenElementById("file_edit_popup_overlay");
                updateFileList();
            })
            .finally(()=>{
                spinner?.remove();
            });
        } else {
            putJsonWithAuth(`/files/${nowControlData.id}`, formData).then(data => {
                displayMessage(data.message);
                hiddenElementById("file_edit_popup_overlay");
                updateFileList();
            })
            .finally(()=>{
                spinner?.remove();
            });
        }
    });
});

callElement("file_search_input", element=>{
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
        updateFileList();
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

function updatePageInput(event) {
    /*监听页面输入事件*/
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 3) {
        value = value.slice(0, 3);
    }
    value = parseInt(value);
    if (value < 1) {
        value = 1;
    }
    let nowTotalPage = parseInt(localStorage.getItem("nowTotalPage"));
    if (value > nowTotalPage) {
        value = nowTotalPage;
    }
    event.target.value = value;
    let elementWidth = 44 + (String(value).length - 1) * 10;
    event.target.style.width = elementWidth + "px";

    let nowPage = parseInt(localStorage.getItem("nowPage"));
    if (nowPage !== value) {
        localStorage.setItem("nowPage", String(value));
        updateFileList();
    }
}

async function updateFileList() {
    /*更新文件列表*/
    let nowPage = localStorage.getItem("nowPage");
    let nowLimit = localStorage.getItem("nowLimit");
    setPageLimit("page_select_limit", nowLimit);
    setNowPage("page_input_id", nowPage);
    let pageIndex = parseInt(nowPage) - 1;

    let spinner = createSpinner("file_table_spinner","spin_panel_light");
    try {
        let searchInput = document.getElementById("file_search_input");
        if (searchInput.value !== "") {
            let data = await getJsonWithAuth(`/files?nameLike=${searchInput.value}&_page=${pageIndex}&_limit=${nowLimit}`);

            let contents = data.contents;
            callElement("file_table_body", fileListTable=>{
                fileListTable.innerHTML = null;
                contents.forEach(content => {
                    fileListTable.appendChild(createFileItem(content));
                });
            });
            setTotalPage(data.total, "page_text_id", nowLimit);
            spinner?.remove();
            return;
        }
    } catch (error) {
        displayError(error);
        spinner?.remove();
    }

    try {
        let nowFolderId = localStorage.getItem("nowFolderId");
        let data = await getJsonWithAuth(`/folders/${nowFolderId}?_page=${pageIndex}&_limit=${nowLimit}`);
        let contents = data.contents;
        callElement("file_table_body", fileListTable=>{
            fileListTable.innerHTML = null;
            contents.forEach(content => {
                fileListTable.appendChild(createFileItem(content));
            });
        });
        setTotalPage(data.total, "page_text_id", nowLimit);

        clearElementByStart("file_path_bar", 1);
        data.parents.forEach(parentData => {
            addFilePathElement("file_path_bar", parentData.name, parentData.id);
        });
        addFilePathElement("file_path_bar", data.name, data.id);
        spinner?.remove();
    }
    catch (error) {
        displayError(error);
        if (localStorage.getItem("nowFolderId") !== "1") {
            localStorage.setItem("nowFolderId", "1")
            updateFileList();
        }
        spinner?.remove();
    }
}

async function loadFolderSelect(dataListId, nowFolderId, editFolderId = null) {
    /*为特定元素提供候选输入*/
    try {
        let data = await getJsonWithAuth(`/folders/${nowFolderId}?type=0&_page=0&_limit=999`);
        callElement(dataListId, selectElement=>{
            selectElement.innerHTML = null;
            /*默认选项*/
            let defaultOptGroup = createOptGroup("默认");
            let defaultOption = createOption(data.name, data.id);
            defaultOptGroup.appendChild(defaultOption);
            selectElement.appendChild(defaultOptGroup);
            /*额外选项*/
            let otherOptGroup = createOptGroup("子文件夹");
            let folderCount = 0;
            data.contents.forEach(content => {
                if (content.type === "0") {
                    if (editFolderId !== null && editFolderId === content.id) {
                        return;
                    }
                    folderCount = folderCount + 1;
                    let otherOption = createOption(content.name, content.id);
                    otherOptGroup.appendChild(otherOption);
                }
            });
            if (folderCount > 0) {
                selectElement.appendChild(otherOptGroup);
            }
            selectElement.value = data.id;
        });
        if(!data.parentId){
            return;
        }
        data = await getJsonWithAuth(`/folders/${data.parentId}?type=0&_page=0&_limit=10`);
        let parentOptGroup = createOptGroup("父文件夹");
        let parentOption = createOption(data.name, data.id);
        parentOptGroup.appendChild(parentOption);
        callElement(dataListId, selectElement=>{
            selectElement.appendChild(parentOptGroup);
        });
    }
    catch (error) {
        displayError(error);
    }
}

function createFileItem(fileData) {
    /*创建一行文件元素*/
    let fileType = fileData.type;

    let fileItem = document.createElement("div");
    fileItem.classList.add("file_table_item");

    let fileNameDiv = document.createElement("div");
    fileNameDiv.classList.add("file_name_div", "clickable");
    let fileIcon = document.createElement("img");
    fileIcon.classList.add("file_name_icon");
    fileIcon.src = getSuitFileIcon(fileType);
    fileNameDiv.appendChild(fileIcon);
    let fileName = document.createElement("a");
    fileName.classList.add("file_name_text");
    fileName.textContent = fileData.name;
    fileNameDiv.appendChild(fileName);

    /*绑定事件*/
    if (fileType === "0") {
        bindClickFolder(fileNameDiv, fileData.id);
    }else if(fileType === "2"){
        bindClickImage(fileNameDiv, fileData);
    }

    fileItem.appendChild(fileNameDiv);

    let updateTimeDiv = document.createElement("div");
    updateTimeDiv.classList.add("file_text_div");
    updateTimeDiv.textContent = timeStampToText(fileData.updateTime);
    fileItem.appendChild(updateTimeDiv);

    let typeDiv = document.createElement("div");
    typeDiv.classList.add("file_text_div");
    typeDiv.textContent = getSuitFileText(fileData.type);
    fileItem.appendChild(typeDiv);

    let sizeDiv = document.createElement("div");
    sizeDiv.classList.add("file_text_div");
    sizeDiv.textContent = formatFileSize(fileData.size);
    fileItem.appendChild(sizeDiv);

    let controlDiv = document.createElement("div");
    controlDiv.classList.add("file_control_div");
    bindClickControl(controlDiv, fileData);
    let controlImg = document.createElement("img");
    controlImg.classList.add("file_control_img", "clickable");
    controlImg.src = "/sources?filename=icons/dots.png";
    controlDiv.appendChild(controlImg);

    fileItem.appendChild(controlDiv);

    return fileItem;
}

function hiddenControlByType(controlElementId = "file_control_content", fileType) {
    /*控制操作弹窗的可操作元素显示*/
    if (!(fileType in FileTypeMap)) {
        return;
    }
    callElement(controlElementId, controlElement=>{
        let childNodes = Array.from(controlElement.children);
        let controls = FileTypeMap[fileType].controls;
        childNodes.forEach((value, index) => {
            if (controls.includes(index)) {
                displayElement(value);
            } else {
                hiddenElement(value);
            }
        });
    });
}

function bindClickFolder(element, folderId) {
    /*绑定文件夹点击事件*/
    element.addEventListener("click", function (event) {
        localStorage.setItem("nowFolderId", folderId);
        callElement("file_search_input", element=>{
            element.value = "";
        });
        updateFileList();
    });
}

function getSuitFileText(fileType) {
    /*返回对应的类型*/
    if (fileType in FileTypeMap) {
        return FileTypeMap[fileType].text;
    } else {
        return fileType["1"].text;
    }
}

function getSuitFileIcon(fileType) {
    /*返回对应的图标*/
    if (fileType in FileTypeMap) {
        return FileTypeMap[fileType].src;
    } else {
        return fileType["1"].src;
    }
}

function checkLocalStorage() {
    /*检查本地缓存，解析Url并将参数存入缓存*/
    let accessToken = localStorage.getItem("accessToken");
    let refreshToken = localStorage.getItem("refreshToken");
    if (accessToken === null || refreshToken === null) {
        window.location.href = "/login.html";
    }

    loadUrlParamInLocal(["nowFolderId"]);
    checkLocalDefault("nowFolderId", "1");
    checkLocalDefault("nowLimit", "20");

    localStorage.setItem("nowPage", "1");
    localStorage.setItem("nowTotalPage", "1");
}

function addFilePathElement(parentId, folderName, folderId) {
    /*为文件路径添加单个可点击路径*/
    callElement(parentId, parentElement=>{
        let folderElement = document.createElement("div");
        folderElement.textContent = folderName;
        folderElement.classList.add("file_path_text", "clickable");
        folderElement.addEventListener("click", function (event) {
            let nowFolderId = localStorage.getItem("nowFolderId");
            let searchInput = document.getElementById("file_search_input");
            if (nowFolderId !== folderId || searchInput.value !== "") {
                localStorage.setItem("nowFolderId", folderId);
                searchInput.value = "";
                updateFileList();
            }
        });

        let spanElement = document.createElement("div");
        spanElement.textContent = "/";
        spanElement.classList.add("file_path_text");

        parentElement.appendChild(folderElement);
        parentElement.appendChild(spanElement);
    });
}
