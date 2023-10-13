function readHttpLikeInput(){
    var fs = require("fs");
    var res = "";
    var buffer = Buffer.alloc ? Buffer.alloc(1) : new Buffer(1);
    let was10 = 0;
    for(;;){ 
        try { fs.readSync(0 /*stdin fd*/, buffer, 0, 1); } catch (e) {break; /* windows */}
        if(buffer[0] === 10 || buffer[0] === 13) {
            if (was10 > 10) 
                break;
            was10++;
        } else 
           was10 = 0;
        res += new String(buffer);
    }

    return res;
}
   
let contents = readHttpLikeInput();
   
function outputHttpResponse(statusCode, statusMessage, headers, body) {
    const protocolVersion = 'HTTP/1.1';
    let response = [
        `${protocolVersion} ${statusCode} ${statusMessage}`,
        `${Object.entries(headers).reduce((result, [key, value]) => {
            return `${result}${key}: ${value}\n`;
        }, '')}`,
        body
    ].join('\n')

    console.log(response);
}
   
function processHttpRequest($method, $uri, $headers, $body) {
    let statusCode;
    let statusMessage;
    let body;

    if ( $method === 'POST' && isValidUri($uri) && isValidContentType($headers["Content-Type"])){
        let regExp = /login=([^&]+)&password=([^&]+)/;
        const matches = $body.match(regExp); 

        const FILE_PATH = './passwords.txt';
        const textFile = readFile(FILE_PATH);

        if(textFile && isUserExist(textFile, matches)){ // So that the second condition is checked only if the first one is true
            statusCode = 200;
            statusMessage = 'OK'
            body = '<h1 style="color:green">FOUND</h1>';
        } else {
            statusCode = 500;
            statusMessage = 'Internal Server Error'
            body = 'incorect login or password'
        }        
    
    } else {
        if($method === 'POST' && isValidContentType($headers["Content-Type"])){
            statusCode = 404
            statusMessage = 'Not Found'
        } else {
            statusCode = 400
            statusMessage = 'Bad Request'
        }
        body = statusMessage.toLowerCase();
    }

    let headers = {
        "Date": new Date(),
        "Server": "Apache/2.2.14 (Win32)",
        "Content-Length": body.length,
        "Connection": "Closed",
        "Content-Type": "text/html; charset=utf-8",
    };

    outputHttpResponse(statusCode, statusMessage, headers, body)
}

function readFile(path){
    const fs = require('fs');
    let result;

    try{
        result = fs.readFileSync(path, { encoding: "utf-8" });
    } catch(err) {
        result = '';
    }
     
    return result;
}

function isUserExist(textFile, userInfo){
    return textFile.includes(`${userInfo[1]}:${userInfo[2]}`);
}

function isValidUri($uri){
    const validUri = '/api/checkLoginAndPassword';
    return $uri === validUri;
}

function isValidContentType(value){
    const validContentType = 'application/x-www-form-urlencoded';
    return value === validContentType;
}
   
function parseTcpStringAsHttpRequest($string) {
    let stringArr = $string
    .split('\n')
    .filter( (row) => row ); // Delete empty rows

    let [method, uri] = stringArr[0].split(' ');

    let headers = stringArr
    .filter( (row) => row.includes(':') )
    .map( (element) => element.split(':') )
    .reduce( ((obj, header) => {
        obj[header[0]] = header[1].trim();
        return obj;
    }), {} )
    headers = Object.keys(headers).length === 0 ? null : headers; // Check if is empty

    let lastRow = stringArr[stringArr.length - 1]
    let body = lastRow.includes(':') ? null : lastRow; // Check if is exist

    return { 
        method,
        uri,
        headers,
        body
    }; 
}
   
http = parseTcpStringAsHttpRequest(contents);
processHttpRequest(http.method, http.uri, http.headers, http.body);
