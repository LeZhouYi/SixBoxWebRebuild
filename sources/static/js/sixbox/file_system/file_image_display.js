window.addEventListener("load",function () {
    clickMultiOverlayHidden("image_display_overlay", ["now_display_image", "image_display_bar"]);
});

callElement("image_edit_button", element=>{
    element.addEventListener("click", async function(event){
        try{
            let nowControlData = JSON.parse(localStorage.getItem("nowControlData"));
            document.getElementById("file_edit_header_text").textContent = "编辑文件";
            document.getElementById("file_edit_name").value = nowControlData.name;
            await loadFolderSelect("file_edit_folder_select", nowControlData.parentId);
            hiddenElementById("image_display_overlay");
            displayElementById("file_edit_popup_overlay");
        } catch (error){
            displayError(error);
        }

    });
});

callElement("image_set_button", element=>{
    element.addEventListener("click", async function(event){
        /*点击设置背景*/
        try{
            let nowControlData = JSON.parse(localStorage.getItem("nowControlData"));
            let userInfo = JSON.parse(localStorage.getItem("userInfo"));
            let content = await putJsonWithAuth(`/users/${userInfo.id}`, {
                name: userInfo.name,
                background: nowControlData.id
            });
            loadUserInfo(function(){
                initBackground();
            });
            displayMessage(content.message);
        } catch (error) {
            displayErrorMessage(error);
        }
    });
});

callElement("image_download_button", element=>{
    element.addEventListener("click", function(event){
        /*点击下载图片*/
        let accessToken = localStorage.getItem("accessToken");
        let fileId = localStorage.getItem("nowDisplayId");
        let downloadUrl = `api/v1/files/${fileId}/download?token=${accessToken}`;
        downloadByA(downloadUrl);
    })
});

callElement("image_last_button", element=>{
    element.addEventListener("click", async function(event){
        /*切换至上一张图片*/
        let accessToken = localStorage.getItem("accessToken");
        let fileId = localStorage.getItem("nowDisplayId");
        let getUrl = `/files/${fileId}/near`;
        try{
            let data = await getJsonWithAuth(getUrl);
            if(data.last){
                callElement("now_display_image", imageElement=>{
                    localStorage.setItem("nowDisplayId", data.last.id);
                    localStorage.setItem("nowControlData", JSON.stringify(data.last));
                    imageElement.src = `api/v1/files/${data.last.id}/download?token=${accessToken}`;
                });
            }else{
                displayMessage("没有更多了哦")
            }
        } catch (error){
            displayError(error);
        }
    });
});

callElement("image_next_button", element=>{
    element.addEventListener("click", async function(event){
        /*切换至上一张图片*/
        let accessToken = localStorage.getItem("accessToken");
        let fileId = localStorage.getItem("nowDisplayId");
        let getUrl = `/files/${fileId}/near`;
        try{
            let data = await getJsonWithAuth(getUrl);
            if(data.next){
                callElement("now_display_image", imageElement=>{
                    localStorage.setItem("nowDisplayId", data.next.id);
                    localStorage.setItem("nowControlData", JSON.stringify(data.next));
                    imageElement.src = `api/v1/files/${data.next.id}/download?token=${accessToken}`;
                });
            }else{
                displayMessage("没有更多了哦")
            }
        } catch (error){
            displayError(error);
        }
    });
});

callElement("image_close_button", element=>{
    element.addEventListener("click", function(event){
        /*点击关闭图片弹窗*/
        hiddenElementById("image_display_overlay");
    });
});

function bindClickImage(element, fileData){
    /*绑定点击图片事件*/
    element.addEventListener("click", function(event){
        displayElementById("image_display_overlay");
        localStorage.setItem("nowControlData", JSON.stringify(fileData))
        localStorage.setItem("nowDisplayId", fileData.id);
        callElement("now_display_image", element=>{
            let accessToken = localStorage.getItem("accessToken");
            let imageUrl = `api/v1/files/${fileData.id}/download?token=${accessToken}`;
            element.src = imageUrl;
        });
    });
}