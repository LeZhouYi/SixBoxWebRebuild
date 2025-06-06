callElement("tidy_up_button", element => {
    element.addEventListener("click", async function (event) {
        /*点击整理文件*/
        let spinner = createSpinner("tidy_up_button");
        try {
            let result = await getJsonWithAuth("/filesTidyUp");
            displayMessage(result.message);
            updateFileList();
            spinner?.remove();
        } catch (error) {
            displayError(error);
            spinner?.remove();
        }
    });
});