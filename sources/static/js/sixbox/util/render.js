import { requestConfig, ApiError } from "./requestor.js";

export const hiddenClass = "hidden";

export function setBackgroundImage(className, fileUrl){
    /*
    设置类名对应元素的图片背景
    className: 元素类名
    fileName: 文件URL
    */
    let elements = document.getElementsByClassName(className);
    Array.from(elements).forEach(element => {
        if(!element.classList.contains(hiddenClass)){
            element.style.backgroundImage = fileUrl;
        }
    });
}

export function resizeFullScreen(){
    /*计算并调整页页使用适应全屏*/
    let bodyContainer = document.body;
    bodyContainer.style.height = String(document.documentElement.clientHeight)+"px";
}

export function displayMessage(messageText, iconUrl="sources?filename=icons/correct.png", removeTime=4500){
    /*显示普通消息，一般是成功操作的提示*/
    let messageContainer = document.querySelector(".message_container");
    if (messageContainer){
        const messageIcon = document.createElement("img");
        messageIcon.classList.add("message_icon");
        messageIcon.src = iconUrl;

        const showText = document.createElement("div");
        showText.classList.add("message_text");
        showText.textContent = messageText;

        const showMessage = document.createElement("div");
        showMessage.classList.add("message_item");
        showMessage.appendChild(messageIcon);
        showMessage.appendChild(showText);

        messageContainer.appendChild(showMessage);

        setTimeout(()=>{
            showMessage.remove();
        }, removeTime);
    }
}

export function displayErrorMessage(errorMessageText, iconUrl="sources?filename=icons/alert.png", removeTime=4500){
    /*显示错误信息*/
    let errorsContainer = document.querySelector(".message_container");
    if (errorsContainer){
        const errorIcon = document.createElement("img");
        errorIcon.classList.add("error_message_icon");
        errorIcon.src = iconUrl;

        const errorText = document.createElement("div");
        errorText.classList.add("error_message_text");
        errorText.textContent = errorMessageText;

        const errorMessage = document.createElement("div");
        errorMessage.classList.add("error_message_item");
        errorMessage.appendChild(errorIcon);
        errorMessage.appendChild(errorText);

        errorsContainer.appendChild(errorMessage);

        setTimeout(()=>{
            errorMessage.remove();
        }, removeTime);
    }
}

export function displayError(error){
    /*显示错误*/
    if (error instanceof ApiError){
        if (error.errorKey==="REFRESH FAIL"){
            setTimeout(function(){
                window.location = requestConfig.authErrorRoute;
            }, 2000);
        }else{
            displayErrorMessage(error.errorData.message);
        }
    }else{
        displayErrorMessage(error);
    }
}