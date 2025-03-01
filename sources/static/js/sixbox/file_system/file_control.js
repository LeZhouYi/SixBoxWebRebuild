window.addEventListener("load",function () {
    clickOverlayHidden("file_control_overlay", "file_control_content");
    clickOverlayHidden("confirm_popup_overlay", "confirm_popup_content");
});

callElement("set_background_button", element=>{
    element.addEventListener("click", async function (event) {
        /*点击设置背景*/
        try{
            let spinner = createSpinner("set_background_button");
            let nowControlData = parseLocalJson("nowControlData");
            let userInfo = parseLocalJson("userInfo");
            let content = await putJsonWithAuth(`/users/${userInfo.id}`, {
                name: userInfo.name,
                background: nowControlData.id
            });
            loadUserInfo(function(){
                initBackground();
                hiddenElementById("file_control_overlay");
                spinner.remove();
            });
            displayMessage(content.message);
        } catch (error) {
            displayErrorMessage(error);
            spinner?.remove();
        }
    });
});

callElement("cancel_popup_button", element=>{
    element.addEventListener("click", function (event) {
        /*点击取消*/
        hiddenElementById("confirm_popup_overlay");
    });
});

callElement("confirm_popup_button", element=>{
    element.addEventListener("click", function (event) {
        /*点击确认删除*/
        let nowControlData = parseLocalJson("nowControlData");
        let spinner = createSpinner("confirm_spin_panel");
        if (nowControlData.type === "0") {
            let deleteUrl = `/folders/${nowControlData.id}`;
            deleteJsonWithAuth(deleteUrl).then(data => {
                displayMessage(data.message);
                hiddenElementById("confirm_popup_overlay");
                updateFileList();
            })
            .finally(()=>{
                spinner?.remove();
            });
        } else {
            let deleteUrl = `/files/${nowControlData.id}`;
            deleteJsonWithAuth(deleteUrl).then(data => {
                displayMessage(data.message);
                hiddenElementById("confirm_popup_overlay");
                updateFileList();
            })
            .finally(()=>{
                spinner?.remove();
            });
        }
    });
});

callElement("file_delete_button", element=>{
	element.addEventListener("click", function (event) {
        /*点击弹出删除文件确认窗口*/
        displayElementById("confirm_popup_overlay");
        hiddenElementById("file_control_overlay");
        document.getElementById("confirm_pop_text").textContent = "确认删除？";
    });
});

callElement("copy_full_url_button", element=>{
	element.addEventListener("click", async function (event) {
        /*点击拷贝完整链接*/
        hiddenElementById("file_control_overlay");
        let nowControlData = parseLocalJson("nowControlData");
        let host = window.location.host;
        try {
            if (nowControlData.type === "0") {
                let clipText = `${host}/home.html?nowFolderId=${nowControlData.id}`;
                clipTextToBoard(clipText);
                displayMessage("已成功复制至剪切板");
            } else {
                let clipText = `${host}/api/v1/files/${nowControlData.id}/download`;
                clipTextToBoard(clipText);
                displayMessage("已成功复制至剪切板");
            }
        } catch (error) {
            displayErrorMessage(error);
        }
    });
});

callElement("copy_part_url_button", element=>{
	element.addEventListener("click", async function (event) {
        /*点击拷贝部分链接*/
        hiddenElementById("file_control_overlay");
        let nowControlData = parseLocalJson("nowControlData");
        try {
            if (nowControlData.type === "0") {
                let clipText = `/home.html?nowFolderId=${nowControlData.id}`;
                clipTextToBoard(clipText);
                displayMessage("已成功复制至剪切板");
            } else {
                let clipText = `/api/v1/files/${nowControlData.id}/download`;
                clipTextToBoard(clipText);
                displayMessage("已成功复制至剪切板");
            }
        } catch (error) {
            displayErrorMessage(error);
        }
    });
});

callElement("file_download_button", element=>{
	element.addEventListener("click", function (event) {
        /*点击下载文件*/
        hiddenElementById("file_control_overlay");
        let nowControlData = parseLocalJson("nowControlData");
        try {
            if (nowControlData.type === "0") {
                return;
            }
            let accessToken = localStorage.getItem("accessToken");
            let downloadUrl = `api/v1/files/${nowControlData.id}/download?token=${accessToken}`;
            downloadByA(downloadUrl);
        } catch (error) {
            displayErrorMessage(error);
        }
    });
});

callElement("file_edit_button", element=>{
	element.addEventListener("click", async function (event) {
        /*点击编辑*/
        try {
            let nowControlData = parseLocalJson("nowControlData");
            let spinner = createSpinner("file_edit_button");
            if (nowControlData.type === "0") {
                document.getElementById("file_edit_header_text").textContent = "编辑文件夹";
                document.getElementById("file_edit_name").value = nowControlData.name;
                await loadFolderSelect("file_edit_folder_select", nowControlData.parentId, nowControlData.id);
                hiddenElementById("file_control_overlay");
                displayElementById("file_edit_popup_overlay");
                spinner.remove();
            } else if (nowControlData.type === "5"){
                onPopupEditText(nowControlData.id, function(){
                    hiddenElementById("file_control_overlay");
                    spinner.remove();
                });
            } else {
                document.getElementById("file_edit_header_text").textContent = "编辑文件";
                document.getElementById("file_edit_name").value = nowControlData.name;
                await loadFolderSelect("file_edit_folder_select", nowControlData.parentId);
                hiddenElementById("file_control_overlay");
                displayElementById("file_edit_popup_overlay");
                spinner.remove();
            }
        } catch (error) {
            displayErrorMessage(error);
            spinner?.remove();
        }
    });
});

function bindClickControl(element, fileData) {
    /*绑定操作点击事件*/
    element.addEventListener("click", function (event) {
        displayElementById("file_control_overlay", function () {
            hiddenControlByType("file_control_content", fileData.type);
            adjustRelativeLDPopup("file_control_content", event.pageX, event.pageY);
            addObserveResizeHiddenById("file_control_overlay");
            localStorage.setItem("nowControlData", JSON.stringify(fileData));
        });
    });
}

function hiddenControlByType(controlElementId = "file_control_content", fileType) {
    /*控制操作弹窗的可操作元素显示*/
    if (!(fileType in FileTypeMap)) {
        return;
    }
    callElement(controlElementId, controlElement=>{
        let childNodes = Array.from(controlElement.children);
        let controls = FileTypeMap[fileType].controls;
        childNodes.forEach((value, index) => {
            if (controls.includes(index)) {
                displayElement(value);
            } else {
                hiddenElement(value);
            }
        });
    });
}