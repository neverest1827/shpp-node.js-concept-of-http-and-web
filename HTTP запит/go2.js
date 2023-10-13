// цей файл потрібно буде дописати...

// не звертайте увагу на цю функцію 
// вона потрібна для того, щоб коректно зчитувати вхідні данні
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

// ось цю функцію, власне, і треба написати
function parseTcpStringAsHttpRequest(string) { 
    let stringArr = string
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
console.log(JSON.stringify(http, undefined, 2));
