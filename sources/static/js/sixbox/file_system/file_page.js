callElement("page_input_id", element => {
    element.addEventListener("input", function (event) {
        /*根据输入动态变换长度*/
        let value = event.target.value.replace(/\D/g, '');
        if (value.length > 3) {
            value = value.slice(0, 3);
        }
        event.target.value = value;
        let elementWidth = 44 + (value.length - 1) * 10;
        if (elementWidth < 44) {
            elementWidth = 44;
        }
        event.target.style.width = elementWidth + "px";
    });
});

callElement("page_input_id", element => {
    element.addEventListener("keydown", function (event) {
        /*enter触发页面输入*/
        if (event.key === 'Enter' || event.keyCode === 13) {
            updatePageInput(event);
        }
    });
});

callElement("page_input_id", element => {
    element.addEventListener("blur", function (event) {
        /*失去焦点触发页面输入*/
        updatePageInput(event);
    });
});

callElement("page_select_limit", element => {
    element.addEventListener("change", function (event) {
        /*更改每页项数*/
        sessionStorage.setItem("nowPage", "1");
        sessionStorage.setItem("nowLimit", event.target.value);
        updateFileList();
    });
});

callElement("last_page_button", element => {
    element.addEventListener("click", function (event) {
        /*点击上一页*/
        let nowPage = parseInt(sessionStorage.getItem("nowPage"));
        if (nowPage > 1) {
            sessionStorage.setItem("nowPage", String(nowPage - 1));
            updateFileList();
        }
    });
});

callElement("next_page_button", element => {
    element.addEventListener("click", function (event) {
        /*点击下一页*/
        let nowPage = parseInt(sessionStorage.getItem("nowPage"));
        let nowTotalPage = parseInt(sessionStorage.getItem("nowTotalPage"));
        if (nowPage <= nowTotalPage - 1) {
            sessionStorage.setItem("nowPage", String(nowPage + 1));
            updateFileList();
        }
    });
});