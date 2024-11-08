import { resizeFullScreen,displayErrorMessage } from "./util/render.js";
import { throttle } from "./util/func.js";
import { ApiError, getJsonWithBear } from "./util/requestor.js";

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
    checkLocalStorage();

    document.getElementById("side_bar_file_sys").classList.add("active");

    updateFileList();
    resizeFullScreen();
};

window.addEventListener("resize", throttle(function(){
    resizeFullScreen("bodyContainer");
}), 200);

document.getElementById("side_bar_file_sys").addEventListener("click", function(event){
    console.log("test");
    window.location = window.location.href;
});

function updateFileList(){
    /*更新文件列表*/
    const nowFolderId = localStorage.getItem("nowFolderId");
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    getJsonWithBear(`api/v1/folders/${nowFolderId}`,accessToken).then(data=>{
        var contents = data.contents;
        var fileListTable = document.getElementById("file_table_body");
        contents.forEach(content => {
            fileListTable.appendChild(createFileItem(content));
        });
    }).catch(error=>{
        if (error instanceof ApiError){
            displayErrorMessage(error.responseData.message);
        }else{
            displayErrorMessage(error);
        }
    });
}

function createFileItem(fileData){
    /*创建一行文件元素*/
    var fileType = fileData.type;

    var fileItem = document.createElement("div");
    fileItem.classList.add("file_table_item");

    var fileNameDiv = document.createElement("div");
    fileNameDiv.classList.add("file_name_div");
    var fileIcon = document.createElement("img");
    fileIcon.classList.add("file_name_icon");
    fileIcon.src = getSuitFileIcon(fileType);
    fileNameDiv.appendChild(fileIcon);
    var fileName = document.createElement("a");
    fileName.classList.add("file_name_text");
    fileName.textContent = fileData.name;
    fileNameDiv.appendChild(fileName);

    fileItem.appendChild(fileNameDiv);

    var updateTimeDiv = document.createElement("div");
    updateTimeDiv.classList.add("file_text_div");
    updateTimeDiv.textContent = timeStampToText(fileData.updateTime);
    fileItem.appendChild(updateTimeDiv);

    var typeDiv = document.createElement("div");
    typeDiv.classList.add("file_text_div");
    typeDiv.textContent = getSuitFileText(fileData.type);
    fileItem.appendChild(typeDiv);

    var sizeDiv = document.createElement("div");
    sizeDiv.classList.add("file_text_div");
    sizeDiv.textContent = formatFileSize(fileData.size);
    fileItem.appendChild(sizeDiv);

    var controlDiv = document.createElement("div");
    controlDiv.classList.add("file_control_div");
    var controlImg = document.createElement("img");
    controlImg.classList.add("file_control_img");
    controlImg.src = "/sources?filename=icons/dots.png";
    controlDiv.appendChild(controlImg);

    fileItem.appendChild(controlDiv);

    return fileItem;
}

function timeStampToText(timeStamp){
    /*将以秒单位的时间戳转成具体的样式文本*/
    var date = new Date(parseInt(timeStamp)*1000);
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
    var fileSizeTexts = ["B","KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
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