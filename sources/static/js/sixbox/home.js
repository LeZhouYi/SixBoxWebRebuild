import { hiddenClass,resizeFullScreen,displayError } from "./util/render.js";
import { throttle } from "./util/func.js";
import { getJsonWithAuth } from "./util/requestor.js";
import { initSideBar } from "./common/sidebar.js";

const fileTypeMap = {
    "0": {
        "src": "/sources?filename=icons/open_folder.png",
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
    document.getElementById("file_sys_container").classList.add("left_trans");
    document.getElementById("side_bar_container").classList.remove(hiddenClass);
};

window.addEventListener("resize", throttle(function(){
    resizeFullScreen("bodyContainer");
}), 200);

document.getElementById("file_add_icon").addEventListener("click", function(event){
    /*点击新增文件的切换按钮*/
    let addFileFormElement = document.getElementById("file_add_form");
    let addFolderFormElement = document.getElementById("folder_add_form");
    let addHeaderText = document.getElementById("file_add_header_text");
    if(addFileFormElement.classList.contains(hiddenClass)){
        addFileFormElement.classList.remove(hiddenClass);
        addFolderFormElement.classList.add(hiddenClass);
        file_add_header_text.textContent="新增文件";
    }else{
        addFileFormElement.classList.add(hiddenClass);
        addFolderFormElement.classList.remove(hiddenClass);
        file_add_header_text.textContent="新增文件夹";
    }
})

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
    let sidebarHidden = "sidebar_hide";
    let hideWithSidebar = "hide_with_sidebar";
    if(sideBarElement && fileSysContainer){
        if(sideBarElement.classList.contains(sidebarHidden)){
            sideBarElement.classList.remove(sidebarHidden);
            fileSysContainer.classList.remove(hideWithSidebar);
        }else if(!sideBarElement.classList.contains(sidebarHidden)){
            sideBarElement.classList.add(sidebarHidden);
            fileSysContainer.classList.add(hideWithSidebar);
        }
    }
});

async function updateFileList(){
    /*更新文件列表*/
    const nowFolderId = localStorage.getItem("nowFolderId");

    try {
        const data = await getJsonWithAuth(`/folders/${nowFolderId}`);
        let contents = data.contents;
        let fileListTable = document.getElementById("file_table_body");
        contents.forEach(content => {
            fileListTable.appendChild(createFileItem(content));
        });
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
    let fileIcon = document.createElement("img");
    fileIcon.classList.add("file_name_icon");
    fileIcon.src = getSuitFileIcon(fileType);
    fileNameDiv.appendChild(fileIcon);
    let fileName = document.createElement("a");
    fileName.classList.add("file_name_text");
    fileName.textContent = fileData.name;
    fileNameDiv.appendChild(fileName);

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
    let controlImg = document.createElement("img");
    controlImg.classList.add("file_control_img");
    controlImg.src = "/sources?filename=icons/dots.png";
    controlDiv.appendChild(controlImg);

    fileItem.appendChild(controlDiv);

    return fileItem;
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
            return fileSize.toFixed(2).toString()+fileSizeTexts[i];
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
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (accessToken === null || refreshToken === null){
        window.location.href = "/login.html";
    }

    const nowFolderId = localStorage.getItem("nowFolderId");
    if (nowFolderId === null) {
        localStorage.setItem("nowFolderId", "1");
    }
}