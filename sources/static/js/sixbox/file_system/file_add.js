window.onload = function () {
    clickOverlayHidden("file_add_popup_overlay", "file_add_content");
}

callElement("file_add_pop_button", element=>{
	element.addEventListener("click", function (event) {
        /*点击弹出新增文件弹窗*/
        hiddenFileMenu();
        let fileAddContent = document.getElementById("file_add_content");
        displayElementById("file_add_popup_overlay", function () {
            let nowFolderId = localStorage.getItem("nowFolderId");
            loadFolderSelect("file_add_folder_select", nowFolderId);
            loadFolderSelect("folder_add_folder_select", nowFolderId);
        })
        /*动画相关*/
        let addFileFormElement = document.getElementById("file_add_form");
        if (isHidden(addFileFormElement)) {
            fileAddContent.style.height = "498px";
        } else {
            fileAddContent.style.height = "615px";
        }
    });
});

callElement("file_add_cancel", element=>{
	element.addEventListener("click", function (event) {
        /*点击取消新增文件弹窗按钮*/
        hiddenElementById("file_add_popup_overlay");
    });
});

callElement("folder_add_cancel", element=>{
	element.addEventListener("click", function (event) {
        /*点击取消新增文件弹窗按钮*/
        hiddenElementById("file_add_popup_overlay");
    });
});

callElement("file_add_icon", element=>{
	element.addEventListener("click", function (event) {
        /*点击新增文件的切换按钮*/
        let addFileFormElement = document.getElementById("file_add_form");
        let addFolderFormElement = document.getElementById("folder_add_form");
        let addHeaderText = document.getElementById("file_add_header_text");
        let fileAddContent = document.getElementById("file_add_content");
        if (displayElement(addFileFormElement)) {
            hiddenElement(addFolderFormElement);
            addHeaderText.textContent = "新增文件";
            /*动画相关*/
            fileAddContent.style.height = "615px";
        } else {
            hiddenElement(addFileFormElement);
            displayElement(addFolderFormElement);
            addHeaderText.textContent = "新增文件夹";
            /*动画相关*/
            fileAddContent.style.height = "498px";
        }
    });
});

callElement("file_add_icon", element=>{
	element.addEventListener("mouseenter", function (event) {
        /*鼠标悬停在新增文件夹图标*/
        let addFormElement = document.getElementById("file_add_form");
        let hoverElement = event.target;
        if (isHidden(addFormElement)) {
            hoverElement.src = "/sources?filename=icons/add_file.png";
        } else {
            hoverElement.src = "/sources?filename=icons/add_folder.png";
        }
    });
});

callElement("file_add_icon", element=>{
    element.addEventListener("mouseleave", function (event) {
        /*鼠标离开在新增文件夹图标*/
        let addFormElement = document.getElementById("file_add_form");
        let hoverElement = event.target;
        if (isHidden(addFormElement)) {
            hoverElement.src = "/sources?filename=icons/add_file_blue.png";
        } else {
            hoverElement.src = "/sources?filename=icons/add_folder_blue.png";
        }
    });
});

callElement("file_add_select_element", element=>{
	element.addEventListener("change", function (event) {
        /*点击选择文件*/
        if (event.target.files && event.target.files.length > 0) {
            let fileName = event.target.files[0].name;
            document.getElementById("file_add_select").value = fileName;
        } else {
            document.getElementById("file_add_select").value = "";
        }
    });
});

callElement("file_add_item_button", element=>{
	element.addEventListener("click", function (event) {
        /*点击新增选择文件*/
        document.getElementById("file_add_select_element").click();
    });
});

callElement("folder_add_form", element=>{
	element.addEventListener("submit", function (event) {
        /*点击新增文件夹*/
        event.preventDefault();
        let spinner = createSpinner("folder_add_button_panel");
        let formData = {
            name: document.getElementById("folder_add_name").value,
            parentId: document.getElementById("folder_add_folder_select").value
        };
        postJsonWithAuth("/folders", formData).then(data => {
            displayMessage(data.message);
            hiddenElementById("file_add_popup_overlay");
            updateFileList();
        })
        .catch(error => {
            displayError(error);
        })
        .finally(()=>{
            spinner?.remove();
        });
    });
});

callElement("file_add_form", element=>{
	element.addEventListener("submit", function (event) {
        /*点击新增文件*/
        event.preventDefault();
        let fileElement = document.getElementById("file_add_select_element");
        if (!fileElement.files || fileElement.files.length < 1) {
            displayErrorMessage("未选择文件");
        }
        let spinner = createSpinner("file_add_button_panel");
        let formData = new FormData();
        formData.append("file", fileElement.files[0]);
        formData.append("name", document.getElementById("file_add_name").value);
        formData.append("parentId", document.getElementById("file_add_folder_select").value);
        postFormWithAuth("/files", formData).then(data => {
            displayMessage(data.message);
            hiddenElementById("file_add_popup_overlay");
            updateFileList();
        })
        .catch(error => {
            displayError(error);
        })
        .finally(()=>{
            spinner?.remove();
        });
    });
});