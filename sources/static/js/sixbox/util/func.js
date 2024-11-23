export function throttle(func, limit){
    /*节流*/
    let inThrottle = false;  //标志位
    return function() {
        const context = this;
        const args = arguments;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => {inThrottle = false}, limit);
        }
    };
}

export function getUrlParam(paramName){
    /*获取URL特定的查询参数*/
    let queryString = window.location.search;
    let params = new URLSearchParams(queryString);
    if (params.has(paramName)){
        return params.get(paramName);
    }
    return null;
}

export function loadUrlParamInLocal(paramArray){
    /*读取特定参数并将读取到的值写入localStorage*/
    if (!Array.isArray(paramArray)){
        return;
    }
    let queryString = window.location.search;
    let params = new URLSearchParams(queryString);
    paramArray.forEach(element=>{
        if (params.has(element)){
            let value = params.get(element);
            if (value){
                localStorage.setItem(element, value);
            }
        }
    });
}

export function checkLocalDefault(itemKey, defaultValue){
    /*检查LocalStorage,若不存在数据则设置默认值*/
    if(localStorage.getItem(itemKey)===null){
        localStorage.setItem(itemKey, defaultValue);
    }
}

export function downloadByA(downloadUrl){
    /*设置a元素下载文件*/
    let downloadElement = document.createElement("a");
    downloadElement.href = downloadUrl;
    downloadElement.click();
    downloadElement.remove();
}

export function timeStampToText(timeStamp){
    /*将以秒单位的时间戳转成具体的样式文本*/
    let date = new Date(parseInt(timeStamp)*1000);
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}`+" "+`${hours}:${minutes}:${seconds}`;
}

export function formatFileSize(fileSize){
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