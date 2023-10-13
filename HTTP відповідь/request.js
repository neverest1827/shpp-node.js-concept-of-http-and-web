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
    let response = `${protocolVersion} ${statusCode} ${statusMessage}\n${Object.entries(headers).reduce((result, [key, value]) => {
        return `${result}${key}: ${value}\n`;
      }, '')}\n${body}`

    console.log(response);
}
   
function processHttpRequest($method, $uri, $headers, $body) {
    let statusCode;
    let statusMessage;
    let body;

    if ( $method === 'GET' && isValidUri($uri)){
        statusCode = 200;
        statusMessage = 'OK'
        body = '' + $uri
        .match(/[\d,]+/)[0]
        .split(',')
        .reduce( ((sum, num) => sum += parseInt(num)), 0);
        
        $headers["Content-Length"] = 1;

    } else {
        if($method === 'GET' || $uri.startWith('?nums=')){
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
        "Connection": "Closed",
        "Content-Type": "text/html; charset=utf-8",
        "Content-Length": body.length,
    };

    outputHttpResponse(statusCode, statusMessage, headers, body)
}

function isValidUri($uri){
    let regExp = /^(\/sum)(\?nums=)[\d,]+$/;
    return regExp.test($uri);
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
    let body = lastRow.includes(':') ? null : lastRow; 

    return { 
        method,
        uri,
        headers,
        body
    }; 
}
   
http = parseTcpStringAsHttpRequest(contents);
processHttpRequest(http.method, http.uri, http.headers, http.body);
