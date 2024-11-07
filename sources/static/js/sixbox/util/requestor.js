const whiteCode = ["400"]

export class ApiError extends Error{
    /*API接口错误*/
    constructor(message,statusCode, responseData){
        super(message);
        this.statusCode = statusCode;
        this.responseData = responseData
    }
}


export function postJson(url, postData){
    /*post传输json数据*/
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
    }).then(response=>{
        if(!response.ok){
            statusCode = response.status;
            if (whiteCode.include(statusCode)){
                throw new ApiError(`HTTP ERROR: ${response.status}`,response.status,response.json);
            }
            else{
                throw new Error(`HTTP ERROR: ${response.status}`);
            }
        }
        return response.json();
    });
}
