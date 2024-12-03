function setTotalPage(total, textId = "page_text_id", nowLimit = "10") {
    /*设置总页数*/
    let totalPage = Math.ceil(parseInt(total) / parseInt(nowLimit));
    let textElement = document.getElementById(textId);
    if (totalPage < 1) {
        totalPage = 1;
    }
    callElement(textId, textElement=>{
        localStorage.setItem("nowTotalPage", String(totalPage));
        textElement.textContent = `页/共${totalPage}页`;
    });
}

function setNowPage(inputId = "page_input_id", page = "1") {
    /*设置当前页数*/
    let inputElement = document.getElementById(inputId);
    if (inputElement) {
        inputElement.value = page;
        let elementWidth = 44 + (page.length - 1) * 10;
        inputElement.style.width = elementWidth + "px";
    }
}

function setPageLimit(elementId = "page_select_limit", limit = "10") {
    /*更新每页项数*/
    callElement(elementId, selectElement=>{
        selectElement.value = limit;
    });
}