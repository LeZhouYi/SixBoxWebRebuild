function throttle(func, limit) {
    /*节流*/
    let inThrottle = false;  //标志位
    return function () {
        const context = this;
        const args = arguments;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => { inThrottle = false }, limit);
        }
    };
}

function getUrlParam(paramName) {
    /*获取URL特定的查询参数*/
    let queryString = window.location.search;
    let params = new URLSearchParams(queryString);
    if (params.has(paramName)) {
        return params.get(paramName);
    }
    return null;
}

function loadUrlParamInLocal(paramArray) {
    /*读取特定参数并将读取到的值写入localStorage*/
    if (!Array.isArray(paramArray)) {
        return;
    }
    let queryString = window.location.search;
    let params = new URLSearchParams(queryString);
    paramArray.forEach(element => {
        if (params.has(element)) {
            let value = params.get(element);
            if (value) {
                localStorage.setItem(element, value);
            }
        }
    });
}

function checkLocalDefault(itemKey, defaultValue) {
    /*检查LocalStorage,若不存在数据则设置默认值*/
    if (localStorage.getItem(itemKey) === null) {
        localStorage.setItem(itemKey, defaultValue);
    }
}

function downloadByA(downloadUrl) {
    /*设置a元素下载文件*/
    let downloadElement = document.createElement("a");
    downloadElement.href = downloadUrl;
    downloadElement.click();
    downloadElement.remove();
}

function timeStampToText(timeStamp) {
    /*将以秒单位的时间戳转成具体的样式文本*/
    let date = new Date(parseInt(timeStamp) * 1000);
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let day = String(date.getDate()).padStart(2, "0");
    let hours = String(date.getHours()).padStart(2, "0");
    let minutes = String(date.getMinutes()).padStart(2, "0");
    let seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}` + " " + `${hours}:${minutes}:${seconds}`;
}

function formatFileSize(fileSize) {
    /*返回对应的格式的存储大小文本*/
    fileSize = parseInt(fileSize);
    if (fileSize < 1) {
        return `${fileSize}B`;
    }
    let fileSizeTexts = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    for (let i = 0; i < fileSizeTexts.length; i++) {
        if (fileSize < 1024) {
            return fileSize.toFixed(2).toString() + " " + fileSizeTexts[i];
        } else {
            fileSize = fileSize / 1024;
        }
    }
}

async function clipTextToBoard(clipText) {
    /*复制文本至剪切板*/
    if (navigator.clipboard) {
        await navigator.clipboard.writeText(clipText);
        return;
    }
    let isRTL = document.documentElement.getAttribute("dir") === "rtl";
    let element = document.createElement("textarea");
    // 防止在ios中产生缩放效果
    element.style.fontSize = "12pt";
    // 重置盒模型
    element.style.border = "0";
    element.style.padding = "0";
    element.style.margin = "0";
    // 将元素移到屏幕外
    element.style.position = "absolute";
    element.style[isRTL ? "right" : "left"] = "-9999px";
    // 移动元素到页面底部
    let yPosition = window.pageYOffset || document.documentElement.scrollTop;
    element.style.top = `${yPosition}px`;
    //设置元素只读
    element.setAttribute("readonly", "");
    element.value = text;
    document.body.appendChild(element);

    element.select();
    element.setSelectionRange(0, element.value.length);
    document.execCommand("copy");
    element.remove();
}

function callElement(elementId, callback) {
    /*获取元素并校验是否存在，存在则执行callback*/
    let element = document.getElementById(elementId);
    if (element && callback) {
        callback(element);
    }
}

function callElementsByClass(elementClass, callback){
    /*获取元素并校验是否存在，存在则执行callback*/
    let elements = document.querySelectorAll(elementClass);
    if (elements && callback) {
        callback(elements);
    }
}

function getFullDomain(){
    /*获取当前完整的域名*/
    let domain = window.location.protocol + "//" + window.location.host;
    return domain;
}

function parseLocalJson(itemName){
    /*获取并解析数据*/
    let data = localStorage.getItem(itemName);
    if (!data){
        return null;
    }
    return JSON.parse(data);
}

function randListItem(listData){
    /*随机抽取一个无素*/
    let length = listData.length;
    if (length < 1){
        return null;
    }
    return listData[Math.floor(Math.random() * length)];
}

function formatSeconds(seconds){
    /*格式化秒数*/
    seconds = Math.floor(seconds);
    var minutes = Math.floor(seconds/60);
    var secs = seconds % 60;
    var formattedMinutes = minutes.toString().padStart(2, '0');
    var formattedSecs = secs.toString().padStart(2, '0');
    return formattedMinutes + ':' + formattedSecs;
}