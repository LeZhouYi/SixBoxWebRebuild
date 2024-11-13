"use strict";

const whiteErrorCode = [400, 401];
export const requestConfig = {
    "apiPrefix": "/api/v1",
    "authErrorRoute": "/login.html"
};

export class ApiError extends Error{
    /*API接口错误*/
    constructor(message, errorKey, errorData){
        super(message);
        this.errorKey = errorKey;
        this.errorData = errorData;
    }
}

export async function postJson(url, postData){
    /*post传输json数据*/
    const response = await fetch(requestConfig.apiPrefix+url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
    });
    var statusCode = response.status;
    if (!response.ok){
        if (whiteErrorCode.includes(statusCode)){
            let data = await response.json();
            throw new ApiError(`HTTP ERROR: ${statusCode}`, "NORMAL ERROR", data);
        }
        throw new Error(`HTTP ERROR: ${statusCode}`);
    }else{
        const data = await response.json();
        return data;
    }
}

export async function postJsonWithAuth(url,postData){
    /*带重试，Bearer验证的post方法获取Json数据的接口*/
    /*请求*/
    let requestFunc = async function(url){
        let accessToken = localStorage.getItem("accessToken");
        return fetch(requestConfig.apiPrefix+url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(postData)
        });
    }
    /*出现401则重试*/
    let retryTimes = 1;
    while(retryTimes>=0){
        let response = await requestFunc(url);
        if (response.ok){
            return response.json();
        }else if (response.status===401){
            /*重新获取Token*/
            retryTimes = retryTimes - 1;
            try{
                await refreshToken();
            }catch(error){
                throw new ApiError(error.message, "REFRESH FAIL");
            }
        }else if (whiteErrorCode.includes(response.status)){
            let data = await response.json();
            throw new ApiError(`HTTP ERROR: ${response.status}`, "NORMAL ERROR", data);
        }else{
            throw new Error(`HTTP ERROR: ${response.status}`);
        }
    }
}

export async function getJsonWithAuth(url){
    /*带重试，Bearer验证的Get方法获取Json数据的接口*/
    /*请求*/
    let requestFunc = async function(url){
        let accessToken = localStorage.getItem("accessToken");
        return fetch(requestConfig.apiPrefix+url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
    }
    /*出现401则重试*/
    let retryTimes = 1;
    while(retryTimes>=0){
        let response = await requestFunc(url);
        if (response.ok){
            return response.json();
        }else if (response.status===401){
            /*重新获取Token*/
            retryTimes = retryTimes - 1;
            try{
                await refreshToken();
            }catch(error){
                throw new ApiError(error.message, "REFRESH FAIL");
            }
        }else if (whiteErrorCode.includes(response.status)){
            let data = await response.json();
            throw new ApiError(`HTTP ERROR: ${response.status}`, "NORMAL ERROR", data);
        }else{
            throw new Error(`HTTP ERROR: ${response.status}`);
        }
    }
}

export async function postFormWithAuth(url, formData){
    /*带重试，Bearer验证的POST方法传输form-data数据的接口*/
    /*请求*/
    let requestFunc = async function(url){
        let accessToken = localStorage.getItem("accessToken");
        return fetch(requestConfig.apiPrefix+url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            },
            body: formData
        });
    }
    /*出现401则重试*/
    let retryTimes = 1;
    while(retryTimes>=0){
        let response = await requestFunc(url);
        if (response.ok){
            return response.json();
        }else if (response.status===401){
            /*重新获取Token*/
            retryTimes = retryTimes - 1;
            try{
                await refreshToken();
            }catch(error){
                throw new ApiError(error.message, "REFRESH FAIL");
            }
        }else if (whiteErrorCode.includes(response.status)){
            let data = await response.json();
            throw new ApiError(`HTTP ERROR: ${response.status}`, "NORMAL ERROR", data);
        }else{
            throw new Error(`HTTP ERROR: ${response.status}`);
        }
    }
}

async function refreshToken(){
    /*更新Token*/
    /*检查缓存中的refresh token*/
    let refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken){
        throw new Error("Refresh Token Empty");
    }
    /*构造请求*/
    let response = await fetch(requestConfig.apiPrefix+"/refresh", {
        "method": "POST",
        "headers":{
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "refreshToken": refreshToken
        })
    });
    if (!response.ok){
        /*更新Token失败*/
        throw new Error(`HTTP ERROR: ${response.status}`);
    }else{
        let data = await response.json();
        if(data || !("accessToken" in data)){
            throw new Error("Refresh Access Token Fail");
        }
        /*更新Token并写入缓存*/
        let accessToken = data.accessToken;
        localStorage.setItem("accessToken", accessToken);
        return accessToken;
    }
}