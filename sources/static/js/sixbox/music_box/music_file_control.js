window.addEventListener("load",function () {
    clickOverlayHidden("music_add_overlay", "music_collect_content");
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