window.onload = function () {
    clickOverlayHidden("file_edit_popup_overlay", "file_edit_content");
}

callElement("file_edit_cancel", element=>{
	element.addEventListener("click", function (event) {
        /*点击编辑文件取消*/
        hiddenElementById("file_edit_popup_overlay");
    });
});

callElement("file_edit_form", element=>{
    element.addEventListener("submit", function (event) {
        /*点击确认编辑*/
        event.preventDefault();
        let spinner = createSpinner("file_edit_button_panel");
        let formData = {
            name: document.getElementById("file_edit_name").value,
            parentId: document.getElementById("file_edit_folder_select").value
        };
        let nowControlData = JSON.parse(localStorage.getItem("nowControlData"));
        if (nowControlData.type === "0") {
            putJsonWithAuth(`/folders/${nowControlData.id}`, formData).then(data => {
                displayMessage(data.message);
                hiddenElementById("file_edit_popup_overlay");
                updateFileList();
            })
            .finally(()=>{
                spinner?.remove();
            });
        } else {
            putJsonWithAuth(`/files/${nowControlData.id}`, formData).then(data => {
                displayMessage(data.message);
                hiddenElementById("file_edit_popup_overlay");
                updateFileList();
            })
            .finally(()=>{
                spinner?.remove();
            });
        }
    });
});