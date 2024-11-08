const hiddenClass = "hidden";

export function setBackgroundImage(className, fileUrl){
    /*
    设置类名对应元素的图片背景
    className: 元素类名
    fileName: 文件URL
    */
    var elements = document.getElementsByClassName(className);
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

export function displayErrorMessage(errorMessageText, iconUrl="sources?filename=icons/alert.png", removeTime=5000){
    /*显示错误信息*/
    let errorsContainer = document.querySelector(".error_message_container");
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

//        setTimeout(()=>{
//            errorMessage.remove();
//        }, removeTime);
    }
}