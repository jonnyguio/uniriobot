function parse(csv) {
    arr = [];
    entries = csv.split('\n');
    headers = arr[0].split(',');
    for(let i = 1; i < entries.length; i++) {
        arr[i - 1] = new Object();
        itens = entries[i].split(',');
        for(let j = 0; j < headers.length; j++) {
            arr[i - 1][headers[j]] = itens[j];
        }
    }

    return arr;
} 

module.exports.parse = parse;
