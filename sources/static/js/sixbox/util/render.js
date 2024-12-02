const hiddenClass = "hidden";

function setBackgroundImage(className, fileUrl) {
    /*
    设置类名对应元素的图片背景
    className: 元素类名
    fileName: 文件URL
    */
    let elements = document.getElementsByClassName(className);
    Array.from(elements).forEach(element => {
        if (!element.classList.contains(hiddenClass)) {
            element.style.backgroundImage = fileUrl;
        }
    });
}

function resizeFullScreen() {
    /*计算并调整页页使用适应全屏*/
    let bodyContainer = document.body;
    bodyContainer.style.height = String(document.documentElement.clientHeight) + "px";
}

function displayMessage(messageText, iconUrl = "sources?filename=icons/correct.png", removeTime = 4500) {
    /*显示普通消息，一般是成功操作的提示*/
    let messageContainer = document.querySelector(".message_container");
    if (messageContainer) {
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

        setTimeout(() => {
            showMessage.remove();
        }, removeTime);
    }
}

function displayErrorMessage(errorMessageText, iconUrl = "sources?filename=icons/alert.png", removeTime = 4500) {
    /*显示错误信息*/
    let errorsContainer = document.querySelector(".message_container");
    if (errorsContainer) {
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

        setTimeout(() => {
            errorMessage.remove();
        }, removeTime);
    }
}

function displayError(error) {
    /*显示错误*/
    if (error instanceof ApiError) {
        if (error.errorKey === "REFRESH FAIL") {
            setTimeout(function () {
                window.location = requestConfig.authErrorRoute;
            }, 2000);
        } else {
            displayErrorMessage(error.errorData.message);
        }
    } else {
        displayErrorMessage(error);
    }
}

function adjustRelativeLDPopup(popupElementId, startX, startY) {
    /*将弹窗从X,Y调整显示合适的位置，左下角弹出*/
    let popupElement = document.getElementById(popupElementId);
    if (!popupElement) {
        return;
    }
    let elementWidth = popupElement.offsetWidth;
    let elementHeight = popupElement.offsetHeight;
    let innerWidth = window.innerWidth;
    let innerHeight = window.innerHeight;
    /*调整元素宽度*/
    if (elementWidth > innerWidth) {
        popupElement.style.width = (window.innerWidth - 36) + "px";
    }
    if (elementHeight > innerHeight) {
        popupElement.style.height = (window.innerHeight - 36) + "px";
    }
    elementWidth = popupElement.offsetWidth;
    elementHeight = popupElement.offsetHeight;
    /*计算位置*/
    let x = startX - elementWidth;
    let y = startY;
    if (x < 0) {
        x = 18;
    }
    if (y + elementHeight > innerHeight) {
        y = innerHeight - elementHeight - 18;
    }
    popupElement.style.left = x + "px";
    popupElement.style.top = y + "px";
}

function addObserveResizeHiddenById(elementId) {
    /*
        页面变化后隐藏，并移除监听器
        添加Math.floor的原因是因为beforeRect和contentRect两者的数值精度不一致
    */
    let element = document.getElementById(elementId);
    addObserveResizeHidden(element);
}

function addObserveResizeHidden(element) {
    /*
        页面变化后隐藏，并移除监听器
        添加Math.floor的原因是因为beforeRect和contentRect两者的数值精度不一致
    */
    if (!element) {
        return;
    }
    let beforeRect = element.getBoundingClientRect();
    let beforeWidth = Math.floor(beforeRect.width);
    let beforeHeight = Math.floor(beforeRect.height);
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (entry.target === element) {
                let entryRect = entry.contentRect;
                if (Math.floor(entryRect.width) !== beforeWidth || Math.floor(entryRect.height) !== beforeHeight) {
                    element.classList.add(hiddenClass);
                    resizeObserver.unobserve(element);
                }
            }
        }
    });
    resizeObserver.observe(element);
}

function clickOverlayHidden(overlayId, contentId) {
    /*点击overlay区域将隐藏元素*/
    let overlayElement = document.getElementById(overlayId);
    if (overlayElement) {
        overlayElement.addEventListener("click", function (event) {
            /*监听元素是否在弹窗外部*/
            let contentElement = document.getElementById(contentId);
            if (contentElement && !contentElement.contains(event.target)) {
                hiddenElement(overlayElement);
                event.preventDefault();
            }
        });
    }
}

function clearElementByStart(elementId = "file_path_bar", minIndex = 1) {
    /*清空路径元素*/
    let pathElement = document.getElementById(elementId);
    if (!pathElement) {
        return;
    }
    let childNodes = pathElement.childNodes;
    for (let i = childNodes.length - 1; i > minIndex; i--) {
        pathElement.removeChild(childNodes[i]);
    }
}

function hiddenElement(element, callback) {
    /*隐藏元素*/
    if (element) {
        element.classList.add(hiddenClass);
        callback?.();
        return true;
    }
    return false;
}

function displayElement(element, callback) {
    /*显示元素*/
    if (element && element.classList.contains(hiddenClass)) {
        element.classList.remove(hiddenClass);
        callback?.();
        return true;
    }
    return false;
}

function hiddenElementById(elementId, callback) {
    /*隐藏元素*/
    let element = document.getElementById(elementId);
    if (element) {
        element.classList.add(hiddenClass);
        callback?.();
        return true;
    }
    return false;
}

function displayElementById(elementId, callback) {
    /*显示元素*/
    let element = document.getElementById(elementId);
    if (element && element.classList.contains(hiddenClass)) {
        element.classList.remove(hiddenClass);
        callback?.();
        return true;
    }
    return false;
}

function isHidden(element) {
    /*判断元素是否拥有hidden类*/
    return element && element.classList.contains(hiddenClass);
}

function isDisplayValue(element, value) {
    /*判断元素是否处于特定显示状态*/
    return element && (!element.style.display || element.style.display === value);
}

function isInClientWidth(start = 0, end = 399, callback) {
    /*判断当前页面是否在范围宽度内*/
    let width = document.documentElement.clientWidth;
    if (width >= start && width <= end) {
        callback?.();
        return true;
    }
}

function createOptGroup(name){
    /*创建下拉选项组*/
    let optGroup = document.createElement("optgroup");
    optGroup.setAttribute("label", name);
    return optGroup;
}

function createOption(text, value){
    /*创建下拉选项*/
    let option = document.createElement("option");
    option.value = value;
    option.text = text;
    return option;
}