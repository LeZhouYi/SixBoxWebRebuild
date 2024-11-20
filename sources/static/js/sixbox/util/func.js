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