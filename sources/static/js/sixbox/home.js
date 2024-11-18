import { hiddenClass,resizeFullScreen,displayError,displayErrorMessage,displayMessage } from "./util/render.js";
import { throttle } from "./util/func.js";
import { getJsonWithAuth,postFormWithAuth,postJsonWithAuth } from "./util/requestor.js";
import { initSideBar } from "./common/sidebar.js";

const fileTypeMap = {
    "0": {
        "src": "/sources?filename=icons/all_file.png",
        "text": "文件夹"
    },
    "1": {
        "src": "/sources?filename=icons/file.png",
        "text": "文件"
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

    /*动画相关初始化*/
    document.getElementById("file_sys_container").classList.add("padding_trans");
};

window.addEventListener("resize", throttle(function(){
    resizeFullScreen("bodyContainer");
}), 200);

document.getElementById("all_file_button").addEventListener("click", function(event){
    /*点击所有文件*/
    localStorage.setItem("nowFolderId", "1");
    localStorage.setItem("nowPage", "1");
    updateFileList();
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
        document.getElementById("file_add_popup_overlay").classList.add(hiddenClass);
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
        document.getElementById("file_add_popup_overlay").classList.add(hiddenClass);
        updateFileList();
    })
    .catch(error=>{
        displayError(error);
    });
});

document.getElementById("file_add_pop_button").addEventListener("click", function(event){
    /*点击弹出新增文件弹窗*/
    let fileAddOverlay = document.getElementById("file_add_popup_overlay");
    let fileAddContent = document.getElementById("file_add_content");
    if(fileAddOverlay.classList.contains(hiddenClass)){
        loadFolderSelect("file_add_folder_select");
        loadFolderSelect("folder_add_folder_select");
        fileAddOverlay.classList.remove(hiddenClass);
    }
    /*动画相关*/
    let addFileFormElement = document.getElementById("file_add_form");
    if(addFileFormElement.classList.contains(hiddenClass)){
        fileAddContent.style.height = "498px";
    }else{
        fileAddContent.style.height = "615px";
    }
});

document.getElementById("file_add_cancel").addEventListener("click", function(event){
    /*点击取消新增文件弹窗按钮*/
    let fileAddOverlay = document.getElementById("file_add_popup_overlay");
    fileAddOverlay.classList.add(hiddenClass);
});

document.getElementById("folder_add_cancel").addEventListener("click", function(event){
    /*点击取消新增文件弹窗按钮*/
    let fileAddOverlay = document.getElementById("file_add_popup_overlay");
    fileAddOverlay.classList.add(hiddenClass);
});

document.getElementById("file_add_icon").addEventListener("click", function(event){
    /*点击新增文件的切换按钮*/
    let addFileFormElement = document.getElementById("file_add_form");
    let addFolderFormElement = document.getElementById("folder_add_form");
    let addHeaderText = document.getElementById("file_add_header_text");
    let fileAddContent = document.getElementById("file_add_content");
    if(addFileFormElement.classList.contains(hiddenClass)){
        addFileFormElement.classList.remove(hiddenClass);
        addFolderFormElement.classList.add(hiddenClass);
        file_add_header_text.textContent="新增文件";
        /*动画相关*/
        fileAddContent.style.height = "615px";
    }else{
        addFileFormElement.classList.add(hiddenClass);
        addFolderFormElement.classList.remove(hiddenClass);
        file_add_header_text.textContent="新增文件夹";
        /*动画相关*/
        fileAddContent.style.height = "498px";
    }
});

document.getElementById("file_add_icon").addEventListener("mouseenter", function(event){
    /*鼠标悬停在新增文件夹图标*/
    let addFormElement = document.getElementById("file_add_form");
    let hoverElement = event.target;
    if(addFormElement.classList.contains(hiddenClass)){
        hoverElement.src = "/sources?filename=icons/add_file.png";
    }else{
        hoverElement.src = "/sources?filename=icons/add_folder.png";
    }
});

document.getElementById("file_add_icon").addEventListener("mouseleave", function(event){
    /*鼠标离开在新增文件夹图标*/
    let addFormElement = document.getElementById("file_add_form");
    let hoverElement = event.target;
    if(addFormElement.classList.contains(hiddenClass)){
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

document.getElementById("file_sys_side_button").addEventListener("click", function(event){
    /*切换隐藏或显示侧边栏*/
    let sideBarElement = document.getElementById("side_bar_container");
    let fileSysContainer = document.getElementById("file_sys_container");
    let sidebarHidden = "side_bar_hidden";  //添加将侧边栏往左移出页面
    let sideBarExpand = "side_bar_expand";  //添加将页面主内容腾出侧边栏的显示空间
    if(sideBarElement && fileSysContainer){
        if(sideBarElement.classList.contains(sidebarHidden)){
            sideBarElement.classList.remove(sidebarHidden);
            fileSysContainer.classList.add(sideBarExpand);
        }else if(!sideBarElement.classList.contains(sidebarHidden)){
            sideBarElement.classList.add(sidebarHidden);
            fileSysContainer.classList.remove(sideBarExpand);
        }
    }
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
    if(nowPage > 2){
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

document.getElementById("file_add_popup_overlay").addEventListener("click", function(event){
    /*监听元素是否在弹窗外部*/
    let contentElement = document.getElementById("file_add_content");
    if (contentElement){
        if(!contentElement.classList.contains(hiddenClass)&&!contentElement.contains(event.target)){
            event.target.classList.add(hiddenClass);
            event.preventDefault();
        }
    }
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

        clearFilePathBar("file_path_bar", 1);
        data.parents.forEach(parentData=>{
            addFilePathElement("file_path_bar", parentData.name, parentData.id);
        });
        addFilePathElement("file_path_bar", data.name, data.id);
    }
    catch(error){
        if(localStorage.getItem("nowFolderId") !== "1"){
            localStorage.setItem("nowFolderId", "1")
            updateFileList();
        }else{
            displayError(error);
        }
    }
}

async function loadFolderSelect(dataListId){
    /*为特定元素提供候选输入*/
    let nowFolderId = localStorage.getItem("nowFolderId");
    try {
        let data = await getJsonWithAuth(`/folders/${nowFolderId}?type=0`);
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
    fileNameDiv.classList.add("file_name_div");
    fileNameDiv.classList.add("clickable");
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
    bindClickControl(controlDiv);
    let controlImg = document.createElement("img");
    controlImg.classList.add("file_control_img");
    controlImg.src = "/sources?filename=icons/dots.png";
    controlDiv.appendChild(controlImg);

    fileItem.appendChild(controlDiv);

    return fileItem;
}

function bindClickControl(element){
    /*绑定操作点击事件*/
    element.addEventListener("click", function(event){
        let container = document.getElementById("file_control_overlay");
        if (container && container.classList.contains(hiddenClass)){
            document.getElementById("file_control_overlay").classList.remove(hiddenClass);
        }
    });
}

function bindClickFolder(element, folderId){
    /*绑定文件夹点击事件*/
    element.addEventListener("click", function(event){
        localStorage.setItem("nowFolderId", folderId);
        updateFileList();
    });
}

function timeStampToText(timeStamp){
    /*将以秒单位的时间戳转成具体的样式文本*/
    let date = new Date(parseInt(timeStamp)*1000);
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatFileSize(fileSize){
    /*返回对应的格式的存储大小文本*/
    fileSize = parseInt(fileSize);
    if (fileSize < 1){
        return `${fileSize}B`;
    }
    let fileSizeTexts = ["B","KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    for(let i = 0; i < fileSizeTexts.length; i++){
        if(fileSize < 1024){
            return fileSize.toFixed(2).toString()+" "+fileSizeTexts[i];
        }else{
            fileSize = fileSize/1024;
        }
    }
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

    let nowFolderId = localStorage.getItem("nowFolderId");
    if (nowFolderId === null) {
        localStorage.setItem("nowFolderId", "1");
    }

    let nowLimit = localStorage.getItem("nowLimit");
    if (nowLimit === null){
        localStorage.setItem("nowLimit", "10");
    }
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

function clearFilePathBar(elementId="file_path_bar", minIndex=1){
    /*清空路径元素*/
    let pathElement = document.getElementById(elementId);
    if (!pathElement){
        return;
    }
    let childNodes = pathElement.childNodes;
    for(let i = childNodes.length - 1; i > minIndex; i--){
        pathElement.removeChild(childNodes[i]);
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
    folderElement.classList.add("file_path_text");
    folderElement.classList.add("clickable");
    folderElement.addEventListener("click", function(event){
        let nowFolderId = localStorage.getItem("nowFolderId");
        if (nowFolderId !== folderId){
            localStorage.setItem("nowFolderId", folderId);
            updateFileList();
        }
    });

    let spanElement = document.createElement("div");
    spanElement.textContent = "/";
    spanElement.classList.add("file_path_text");

    parentElement.appendChild(folderElement);
    parentElement.appendChild(spanElement);
}
