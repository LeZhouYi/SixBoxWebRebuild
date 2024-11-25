const fileTypeMap = {
    "0": {
        "src": "/sources?filename=icons/all_file.png",
        "text": "文件夹",
        "controls": [
            0,1,3,4
        ]
    },
    "1": {
        "src": "/sources?filename=icons/file.png",
        "text": "文件",
        "controls": [
            0,1,2,3,4
        ]
    }
}

window.onload = function() {
    /*检查并初始化存储数据*/
    checkLocalStorage();

    /*侧边栏初始化*/
    initSideBar("fileSystem");

    /*页面功能*/
    updateFileList();

    /*页面调整*/
    resizeFullScreen();

    /*事件相关*/
    clickOverlayHidden("file_add_popup_overlay", "file_add_content");
    clickOverlayHidden("file_control_overlay", "file_control_content");
    clickOverlayHidden("file_edit_popup_overlay", "file_edit_content");
    clickOverlayHidden("confirm_popup_overlay", "confirm_popup_content");
    bindSideBarEvent("file_sys_side_button", "file_sys_container");

    /*动画相关初始化*/
    document.getElementById("file_sys_container").classList.add("padding_trans");

    window.addEventListener("resize", throttle(function(){
        resizeFullScreen("bodyContainer");
    }), 200);
    window.addEventListener("resize", throttle(function(){
        onSideBarReside();
    }), 2000);
};

document.getElementById("all_file_button").addEventListener("click", function(event){
    /*点击所有文件*/
    let nowFolderId = localStorage.getItem("nowFolderId");
    let nowPage = localStorage.getItem("nowPage");
    let searchInput = document.getElementById("file_search_input");
    if(nowFolderId!=="1"||nowPage!=="1"||searchInput.value!==""){
        localStorage.setItem("nowFolderId", "1");
        localStorage.setItem("nowPage", "1");
        searchInput.value="";
        updateFileList();
    }
});

document.getElementById("folder_add_form").addEventListener("submit", function(event){
    /*点击新增文件夹*/
    event.preventDefault();
    let formData = {
        name: document.getElementById("folder_add_name").value,
        parentId: document.getElementById("folder_add_folder_select").value
    };
    postJsonWithAuth("/folders", formData).then(data=>{
        displayMessage(data.message);
        hiddenElementById("file_add_popup_overlay");
        updateFileList();
    })
    .catch(error=>{
        displayError(error);
    });
});

document.getElementById("file_add_form").addEventListener("submit", function(event){
    /*点击新增文件*/
    event.preventDefault();
    let fileElement = document.getElementById("file_add_select_element");
    if(!fileElement.files || fileElement.files.length<1){
        displayErrorMessage("未选择文件");
    }
    let formData = new FormData();
    formData.append("file", fileElement.files[0]);
    formData.append("name", document.getElementById("file_add_name").value);
    formData.append("parentId", document.getElementById("file_add_folder_select").value);
    postFormWithAuth("/files", formData).then(data=>{
        displayMessage(data.message);
        hiddenElementById("file_add_popup_overlay");
        updateFileList();
    })
    .catch(error=>{
        displayError(error);
    });
});

document.getElementById("file_add_pop_button").addEventListener("click", function(event){
    /*点击弹出新增文件弹窗*/
    let fileAddContent = document.getElementById("file_add_content");
    displayElementById("file_add_popup_overlay", function(){
        let nowFolderId = localStorage.getItem("nowFolderId");
        loadFolderSelect("file_add_folder_select",nowFolderId);
        loadFolderSelect("folder_add_folder_select",nowFolderId);
    })
    /*动画相关*/
    let addFileFormElement = document.getElementById("file_add_form");
    if(isHidden(addFileFormElement)){
        fileAddContent.style.height = "498px";
    }else{
        fileAddContent.style.height = "615px";
    }
});

document.getElementById("file_add_cancel").addEventListener("click", function(event){
    /*点击取消新增文件弹窗按钮*/
    hiddenElementById("file_add_popup_overlay");
});

document.getElementById("folder_add_cancel").addEventListener("click", function(event){
    /*点击取消新增文件弹窗按钮*/
    hiddenElementById("file_add_popup_overlay");
});

document.getElementById("file_add_icon").addEventListener("click", function(event){
    /*点击新增文件的切换按钮*/
    let addFileFormElement = document.getElementById("file_add_form");
    let addFolderFormElement = document.getElementById("folder_add_form");
    let addHeaderText = document.getElementById("file_add_header_text");
    let fileAddContent = document.getElementById("file_add_content");
    if(displayElement(addFileFormElement)){
        hiddenElement(addFolderFormElement);
        addHeaderText.textContent="新增文件";
        /*动画相关*/
        fileAddContent.style.height = "615px";
    }else{
        hiddenElement(addFileFormElement);
        displayElement(addFolderFormElement);
        addHeaderText.textContent="新增文件夹";
        /*动画相关*/
        fileAddContent.style.height = "498px";
    }
});

document.getElementById("file_add_icon").addEventListener("mouseenter", function(event){
    /*鼠标悬停在新增文件夹图标*/
    let addFormElement = document.getElementById("file_add_form");
    let hoverElement = event.target;
    if(isHidden(addFormElement)){
        hoverElement.src = "/sources?filename=icons/add_file.png";
    }else{
        hoverElement.src = "/sources?filename=icons/add_folder.png";
    }
});

document.getElementById("file_add_icon").addEventListener("mouseleave", function(event){
    /*鼠标离开在新增文件夹图标*/
    let addFormElement = document.getElementById("file_add_form");
    let hoverElement = event.target;
    if(isHidden(addFormElement)){
        hoverElement.src = "/sources?filename=icons/add_file_blue.png";
    }else{
        hoverElement.src = "/sources?filename=icons/add_folder_blue.png";
    }
});

document.getElementById("file_add_select_element").addEventListener("change", function(event){
    /*点击选择文件*/
    if (event.target.files && event.target.files.length > 0){
        let fileName = event.target.files[0].name;
        document.getElementById("file_add_select").value = fileName;
    } else{
        document.getElementById("file_add_select").value = "";
    }
});

document.getElementById("file_add_item_button").addEventListener("click", function(event){
    /*点击新增选择文件*/
    document.getElementById("file_add_select_element").click();
});

document.getElementById("page_input_id").addEventListener("input", function(event){
    /*根据输入动态变换长度*/
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 3) {
      value = value.slice(0, 3);
    }
    event.target.value = value;
    let elementWidth = 44 + (value.length-1)*10;
    if (elementWidth < 44){
        elementWidth = 44;
    }
    event.target.style.width = elementWidth + "px";
});

document.getElementById("page_input_id").addEventListener("keydown", function(event){
    /*enter触发页面输入*/
    if (event.key === 'Enter' || event.keyCode === 13) {
        updatePageInput(event);
    }
});

document.getElementById("page_input_id").addEventListener("blur", function(event){
    /*失去焦点触发页面输入*/
    updatePageInput(event);
});

document.getElementById("page_select_limit").addEventListener("change", function(event){
    /*更改每页项数*/
    localStorage.setItem("nowPage", "1");
    localStorage.setItem("nowLimit", event.target.value);
    updateFileList();
});

document.getElementById("last_page_button").addEventListener("click", function(event){
    /*点击上一页*/
    let nowPage = parseInt(localStorage.getItem("nowPage"));
    if(nowPage > 1){
        localStorage.setItem("nowPage", String(nowPage-1));
        updateFileList();
    }
});

document.getElementById("next_page_button").addEventListener("click", function(event){
    /*点击下一页*/
    let nowPage = parseInt(localStorage.getItem("nowPage"));
    let nowTotalPage = parseInt(localStorage.getItem("nowTotalPage"));
    if(nowPage <= nowTotalPage-1){
        localStorage.setItem("nowPage", String(nowPage+1));
        updateFileList();
    }
});

document.getElementById("copy_full_url_button").addEventListener("click", async function(event){
    /*点击拷贝完整链接*/
    hiddenElementById("file_control_overlay");
    let nowControlData = JSON.parse(localStorage.getItem("nowControlData"));
    let host = window.location.host;
    try{
        if (nowControlData.type==="0"){
            let clipText = `${host}/home.html?nowFolderId=${nowControlData.id}`;
            await navigator.clipboard.writeText(clipText);
            displayMessage("已成功复制至剪切板");
        }else if(nowControlData.type==="1"){
            let clipText = `${host}/api/v1/files/${nowControlData.id}/download`;
            await navigator.clipboard.writeText(clipText);
            displayMessage("已成功复制至剪切板");
        }
    } catch (error){
        displayErrorMessage(error);
    }
});

document.getElementById("copy_part_url_button").addEventListener("click", async function(event){
    /*点击拷贝完整链接*/
    hiddenElementById("file_control_overlay");
    let nowControlData = JSON.parse(localStorage.getItem("nowControlData"));
    try{
        if (nowControlData.type==="0"){
            let clipText = `/home.html?nowFolderId=${nowControlData.id}`;
            await navigator.clipboard.writeText(clipText);
            displayMessage("已成功复制至剪切板");
        }else if(nowControlData.type==="1"){
            let clipText = `/api/v1/files/${nowControlData.id}/download`;
            await navigator.clipboard.writeText(clipText);
            displayMessage("已成功复制至剪切板");
        }
    } catch (error){
        displayErrorMessage(error);
    }
});

document.getElementById("file_download_button").addEventListener("click", function(event){
    /*点击下载文件*/
    hiddenElementById("file_control_overlay");
    let nowControlData = JSON.parse(localStorage.getItem("nowControlData"));
    try{
        if (nowControlData.type==="0"){
            return;
        }
        let accessToken = localStorage.getItem("accessToken");
        let downloadUrl = `api/v1/files/${nowControlData.id}/download?token=${accessToken}`;
        downloadByA(downloadUrl);
    } catch (error){
        displayErrorMessage(error);
    }
});

document.getElementById("file_edit_button").addEventListener("click", function(event){
    /*点击编辑*/
    hiddenElementById("file_control_overlay");
    try{
        let nowControlData = JSON.parse(localStorage.getItem("nowControlData"));
        if(!displayElementById("file_edit_popup_overlay")){
                return;
            }
        if (nowControlData.type==="0"){
            document.getElementById("file_edit_header_text").textContent="编辑文件夹";
            document.getElementById("file_edit_name").value = nowControlData.name;
            loadFolderSelect("file_edit_folder_select", nowControlData.parentId, nowControlData.id);
        } else if (nowControlData.type==="1"){
            document.getElementById("file_edit_header_text").textContent="编辑文件";
            document.getElementById("file_edit_name").value = nowControlData.name;
            loadFolderSelect("file_edit_folder_select", nowControlData.parentId);
        }
    } catch (error){
        displayErrorMessage(error);
    }
});

document.getElementById("file_edit_cancel").addEventListener("click", function(event){
    /*点击编辑文件取消*/
    hiddenElementById("file_edit_popup_overlay");
});

document.getElementById("file_edit_form").addEventListener("submit", function(event){
    /*点击确认编辑*/
    event.preventDefault();
    let formData = {
        name: document.getElementById("file_edit_name").value,
        parentId: document.getElementById("file_edit_folder_select").value
    };
    let nowControlData = JSON.parse(localStorage.getItem("nowControlData"));
    if(nowControlData.type==="0"){
        putJsonWithAuth(`/folders/${nowControlData.id}`, formData).then(data=>{
            displayMessage(data.message);
            hiddenElementById("file_edit_popup_overlay");
            updateFileList();
        })
    }else{
        putJsonWithAuth(`/files/${nowControlData.id}`, formData).then(data=>{
            displayMessage(data.message);
            hiddenElementById("file_edit_popup_overlay");
            updateFileList();
        })
    }
});

document.getElementById("file_delete_button").addEventListener("click", function(event){
    /*点击弹出删除文件确认窗口*/
    displayElementById("confirm_popup_overlay");
    hiddenElementById("file_control_overlay");
    document.getElementById("confirm_pop_text").textContent = "确认删除？";
});

document.getElementById("cancel_popup_button").addEventListener("click", function(event){
    /*点击取消*/
    hiddenElementById("confirm_popup_overlay");
});

document.getElementById("confirm_popup_button").addEventListener("click", function(event){
    /*点击确认删除*/
    let nowControlData = JSON.parse(localStorage.getItem("nowControlData"));
    if (nowControlData.type==="0"){
        let deleteUrl = `/folders/${nowControlData.id}`;
        deleteJsonWithAuth(deleteUrl).then(data=>{
            displayMessage(data.message);
            hiddenElementById("confirm_popup_overlay");
            updateFileList();
        });
    }else{
        let deleteUrl = `/files/${nowControlData.id}`;
        deleteJsonWithAuth(deleteUrl).then(data=>{
            displayMessage(data.message);
            hiddenElementById("confirm_popup_overlay");
            updateFileList();
        });
    }
})

document.getElementById("file_search_input").addEventListener("keydown", function(event){
    /*输入搜索文件*/
    if(event.key==="Enter"||event.keyCode===13){
        event.preventDefault();
        event.target.blur();
    }
});

document.getElementById("file_search_input").addEventListener("blur", function(event){
    /*失去焦点触发页面输入*/
    event.preventDefault();
    updateFileList();
});

function updatePageInput(event){
    /*监听页面输入事件*/
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 3) {
      value = value.slice(0, 3);
    }
    value = parseInt(value);
    if (value<1){
        value = 1;
    }
    let nowTotalPage = parseInt(localStorage.getItem("nowTotalPage"));
    if (value> nowTotalPage){
        value = nowTotalPage;
    }
    event.target.value = value;
    let elementWidth = 44 + (String(value).length-1)*10;
    event.target.style.width = elementWidth + "px";

    let nowPage = parseInt(localStorage.getItem("nowPage"));
    if (nowPage!==value){
        localStorage.setItem("nowPage", String(value));
        updateFileList();
    }
}

async function updateFileList(){
    /*更新文件列表*/
    try {
        let searchInput = document.getElementById("file_search_input");
        if (searchInput.value!==""){
            let nowPage = localStorage.getItem("nowPage");
            let nowLimit = localStorage.getItem("nowLimit");

            setPageLimit("page_select_limit",nowLimit);
            setNowPage("page_input_id", nowPage);

            let pageIndex = parseInt(nowPage)-1;
            let data = await getJsonWithAuth(`/files?nameLike=${searchInput.value}&_page=${pageIndex}&_limit=${nowLimit}`);

            let contents = data.contents;
            let fileListTable = document.getElementById("file_table_body");
            fileListTable.innerHTML = null;
            contents.forEach(content => {
                fileListTable.appendChild(createFileItem(content));
            });
            setTotalPage(data.total,"page_text_id",nowLimit);
            return;
        }
    }catch(error){
        displayError(error);
    }

    try {
        let nowFolderId = localStorage.getItem("nowFolderId");
        let nowPage = localStorage.getItem("nowPage");
        let nowLimit = localStorage.getItem("nowLimit");

        setPageLimit("page_select_limit",nowLimit);
        setNowPage("page_input_id", nowPage);
        let pageIndex = parseInt(nowPage)-1;

        let data = await getJsonWithAuth(`/folders/${nowFolderId}?_page=${pageIndex}&_limit=${nowLimit}`);
        let contents = data.contents;
        let fileListTable = document.getElementById("file_table_body");
        fileListTable.innerHTML = null;
        contents.forEach(content => {
            fileListTable.appendChild(createFileItem(content));
        });
        setTotalPage(data.total,"page_text_id",nowLimit);

        clearElementByStart("file_path_bar", 1);
        data.parents.forEach(parentData=>{
            addFilePathElement("file_path_bar", parentData.name, parentData.id);
        });
        addFilePathElement("file_path_bar", data.name, data.id);
    }
    catch(error){
        displayError(error);
        if(localStorage.getItem("nowFolderId") !== "1"){
            localStorage.setItem("nowFolderId", "1")
            updateFileList();
        }
    }
}

async function loadFolderSelect(dataListId, nowFolderId, editFolderId=null){
    /*为特定元素提供候选输入*/
    try {
        let data = await getJsonWithAuth(`/folders/${nowFolderId}?type=0&_page=0&_limit=999`);
        let contents = data.contents;
        let selectElement = document.getElementById(dataListId);
        selectElement.innerHTML = null;
        /*默认选项*/
        let defaultOptGroup = document.createElement("optgroup");
        defaultOptGroup.setAttribute("label", "默认");
        let defaultOption = document.createElement("option");
        defaultOption.value = data.id;
        defaultOption.text = data.name;
        defaultOptGroup.appendChild(defaultOption);
        selectElement.appendChild(defaultOptGroup);
        /*额外选项*/
        let otherOptGroup = document.createElement("optgroup");
        otherOptGroup.setAttribute("label", data.name);
        let folderCount = 0;
        contents.forEach(content => {
            if(content.type==="0"){
                if(editFolderId!==null && editFolderId===content.id){
                    return;
                }
                folderCount = folderCount + 1;
                let otherOption = document.createElement("option");
                otherOption.value = content.id;
                otherOption.text = content.name;
                otherOptGroup.appendChild(otherOption);
            }
        });
        if(folderCount>0){
            selectElement.appendChild(otherOptGroup);
        }
        selectElement.value = data.id;
    }
    catch(error){
        displayError(error);
    }
}

function createFileItem(fileData){
    /*创建一行文件元素*/
    let fileType = fileData.type;

    let fileItem = document.createElement("div");
    fileItem.classList.add("file_table_item");

    let fileNameDiv = document.createElement("div");
    fileNameDiv.classList.add("file_name_div","clickable");
    let fileIcon = document.createElement("img");
    fileIcon.classList.add("file_name_icon");
    fileIcon.src = getSuitFileIcon(fileType);
    fileNameDiv.appendChild(fileIcon);
    let fileName = document.createElement("a");
    fileName.classList.add("file_name_text");
    fileName.textContent = fileData.name;
    fileNameDiv.appendChild(fileName);

    /*绑定事件*/
    if(fileType==="0"){
        bindClickFolder(fileNameDiv, fileData.id);
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
    controlImg.classList.add("file_control_img","clickable");
    controlImg.src = "/sources?filename=icons/dots.png";
    controlDiv.appendChild(controlImg);

    fileItem.appendChild(controlDiv);

    return fileItem;
}

function bindClickControl(element, fileData){
    /*绑定操作点击事件*/
    element.addEventListener("click", function(event){
        displayElementById("file_control_overlay", function(){
            hiddenControlByType("file_control_content", fileData.type);
            adjustRelativeLDPopup("file_control_content", event.pageX, event.pageY);
            addObserveResizeHiddenById("file_control_overlay");
            localStorage.setItem("nowControlData",JSON.stringify(fileData));
        });
    });
}

function hiddenControlByType(controlElementId="file_control_content",fileType){
    /*控制操作弹窗的可操作元素显示*/
    let controlElement = document.getElementById(controlElementId);
    if (!controlElement){
        return;
    }
    if(!(fileType in fileTypeMap)){
        return;
    }
    let childNodes = Array.from(controlElement.children);
    let controls = fileTypeMap[fileType].controls;
    childNodes.forEach((value, index)=>{
        if(controls.includes(index)){
            displayElement(value);
        }else{
            hiddenElement(value);
        }
    });
}

function bindClickFolder(element, folderId){
    /*绑定文件夹点击事件*/
    element.addEventListener("click", function(event){
        localStorage.setItem("nowFolderId", folderId);
        document.getElementById("file_search_input").value="";
        updateFileList();
    });
}

function getSuitFileText(fileType){
    /*返回对应的类型*/
    if (fileType in fileTypeMap){
        return fileTypeMap[fileType].text;
    }else{
        return fileType["1"].text;
    }
}

function getSuitFileIcon(fileType){
    /*返回对应的图标*/
    if (fileType in fileTypeMap){
        return fileTypeMap[fileType].src;
    }else{
        return fileType["1"].src;
    }
}

function checkLocalStorage(){
    /*检查本地存储*/
    let accessToken = localStorage.getItem("accessToken");
    let refreshToken = localStorage.getItem("refreshToken");
    if (accessToken === null || refreshToken === null){
        window.location.href = "/login.html";
    }

    loadUrlParamInLocal(["nowFolderId"]);
    checkLocalDefault("nowFolderId", "1");
    checkLocalDefault("nowLimit", "20");

    localStorage.setItem("nowPage", "1");
    localStorage.setItem("nowTotalPage", "1");
}

function setPageLimit(elementId="page_select_limit",limit="10"){
    /*更新每页项数*/
    let selectElement = document.getElementById(elementId);
    if (selectElement){
        selectElement.value = limit;
    }
}

function setNowPage(inputId="page_input_id", page="1"){
    /*设置当前页数*/
    let inputElement = document.getElementById(inputId);
    if (inputElement){
        inputElement.value = page;
        let elementWidth = 44 + (page.length-1)*10;
        inputElement.style.width = elementWidth + "px";
    }
}

function setTotalPage(total, textId="page_text_id", nowLimit="10"){
    /*设置总页数*/
    let totalPage = Math.ceil(parseInt(total)/parseInt(nowLimit));
    let textElement = document.getElementById(textId);
    if (totalPage < 1){
        totalPage = 1;
    }
    if(textElement){
        localStorage.setItem("nowTotalPage", String(totalPage));
        textElement.textContent = `页/共${totalPage}页`;
    }
}

function addFilePathElement(parentId, folderName, folderId){
    /*为文件路径添加单个可点击路径*/
    let parentElement = document.getElementById(parentId);
    if (!parentElement){
        return;
    }

    let folderElement = document.createElement("div");
    folderElement.textContent = folderName;
    folderElement.classList.add("file_path_text","clickable");
    folderElement.addEventListener("click", function(event){
        let nowFolderId = localStorage.getItem("nowFolderId");
        let searchInput = document.getElementById("file_search_input");
        if (nowFolderId !== folderId || searchInput.value!==""){
            localStorage.setItem("nowFolderId", folderId);
            searchInput.value="";
            updateFileList();
        }
    });

    let spanElement = document.createElement("div");
    spanElement.textContent = "/";
    spanElement.classList.add("file_path_text");

    parentElement.appendChild(folderElement);
    parentElement.appendChild(spanElement);
}
