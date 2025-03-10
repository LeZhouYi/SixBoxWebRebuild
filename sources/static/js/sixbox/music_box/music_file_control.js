window.addEventListener("load",function () {
    clickOverlayHidden("music_add_overlay", "music_add_content");
    clickOverlayHidden("music_edit_overlay", "music_edit_content");
    clickOverlayHidden("confirm_popup_overlay", "confirm_popup_content");
});

callElement("add_music_button", element=>{
    /*点击新增歌曲弹窗*/
    element.addEventListener("click", function(event){
        displayElementById("music_add_overlay");
    });
});

callElement("music_add_cancel", element=>{
    /*点击取消新增歌曲*/
    element.addEventListener("click", function(event){
        hiddenElementById("music_add_overlay");
    });
});

callElement("music_add_select_element", element=>{
	element.addEventListener("change", function (event) {
        /*点击选择文件*/
        if (event.target.files && event.target.files.length > 0) {
            let fileName = event.target.files[0].name;
            document.getElementById("music_add_select").value = fileName;
        } else {
            document.getElementById("music_add_select").value = "";
        }
    });
});

callElement("music_add_item_button", element=>{
	element.addEventListener("click", function (event) {
        /*点击新增选择文件*/
        document.getElementById("music_add_select_element").click();
    });
});

callElement("music_add_form", element=>{
	element.addEventListener("submit", function (event) {
        /*点击新增文件*/
        event.preventDefault();
        let fileElement = document.getElementById("music_add_select_element");
        if (!fileElement.files || fileElement.files.length < 1) {
            displayErrorMessage("未选择文件");
        }
        let formData = new FormData();
        formData.append("file", fileElement.files[0]);
        formData.append("name", document.getElementById("music_add_name").value);
        formData.append("singer", document.getElementById("music_add_singer").value);
        formData.append("album", document.getElementById("music_add_album").value);
        formData.append("tags", document.getElementById("music_add_tags").value);
        formData.append("setId", "1");
        postFormWithAuth("/musics", formData).then(data => {
            displayMessage(data.message);
            hiddenElementById("music_add_overlay");
            updateMusicList();
        })
        .catch(error => {
            displayError(error);
        });
    });
});

callElement("music_edit_button", element=>{
    /*点击编辑*/
    element.addEventListener("click", function(event){
        hiddenElementById("music_control_overlay");
        displayElementById("music_edit_overlay");
        let nowData = parseSessionJson("nowControlData");
        callElement("music_edit_name", nameElement=>{
            nameElement.value = nowData.name;
        });
        callElement("music_edit_singer", singerElement=>{
            singerElement.value = nowData.singer;
        });
        callElement("music_edit_album", albumElement=>{
            albumElement.value = nowData.album;
        });
        callElement("music_edit_tags", tagsElement=>{
            tagsElement.value = nowData.tags;
        });
    });
});

callElement("music_edit_cancel", element=>{
    /*取消编辑*/
    element.addEventListener("click", function(event){
        hiddenElementById("music_edit_overlay");
    });
});

callElement("music_edit_form", element=>{
    /*确认编辑*/
    element.addEventListener("submit", function(event){
        event.preventDefault();
        let formData = {
            name: document.getElementById("music_edit_name").value,
            singer: document.getElementById("music_edit_singer").value,
            album: document.getElementById("music_edit_album").value,
            tags: document.getElementById("music_edit_tags").value
        };
        let nowControlData = parseSessionJson("nowControlData");
        putJsonWithAuth(`/musics/${nowControlData.id}`, formData).then(data => {
            displayMessage(data.message);
            hiddenElementById("music_edit_overlay");
            updateMusicList();
        })
        .catch(error => {
            displayError(error);
        });
    });
});

callElement("music_delete_button", element=>{
    /*点击删除*/
    element.addEventListener("click", function(event){
        document.getElementById("confirm_pop_text").textContent = "确认删除？";
        hiddenElementById("music_control_overlay");
        displayElementById("confirm_popup_overlay");
    });
});

callElement("cancel_popup_button", element=>{
    /*取消删除*/
    element.addEventListener("click", function(event){
        hiddenElementById("confirm_popup_overlay");
    });
});

callElement("confirm_popup_button", element=>{
    /*确认删除*/
    element.addEventListener("click", function(event){
        let nowControlData = parseSessionJson("nowControlData");
        let deleteUrl = `/musics/${nowControlData.id}`;
        deleteJsonWithAuth(deleteUrl).then(data => {
            displayMessage(data.message);
            hiddenElementById("confirm_popup_overlay");
            updateMusicList();
        });
    });
});