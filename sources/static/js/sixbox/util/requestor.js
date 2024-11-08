const whiteCode = ["400"]

export class ApiError extends Error{
    /*API接口错误*/
    constructor(message,statusCode, responseData){
        super(message);
        this.statusCode = statusCode;
        this.responseData = responseData;
    }
}

export async function postJson(url, postData){
    /*post传输json数据*/
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(postData)
    });
    var statusCode = response.status.toString();
    if (!response.ok){
        if (!whiteCode.includes(statusCode)){
            throw new Error(`HTTP ERROR: ${statusCode}`);
        }else{
            const data = await response.json();
            throw new ApiError(`HTTP ERROR: ${statusCode}`, statusCode, data);
        }
    }else{
        const data = await response.json();
        return data;
    }
}

export async function getJsonWithBear(url, accessToken){
    /*post传输json数据*/
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    });
    var statusCode = response.status.toString();
    if (!response.ok){
        if (!whiteCode.includes(statusCode)){
            throw new Error(`HTTP ERROR: ${statusCode}`);
        }else{
            const data = await response.json();
            throw new ApiError(`HTTP ERROR: ${statusCode}`, statusCode, data);
        }
    }else{
        const data = await response.json();
        return data;
    }
}
