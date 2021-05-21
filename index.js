const http = require('http');
const fs = require('fs');
const readline = require('readline');
const zlib = require('zlib');

// download car data
const carData = {
    url: 'http://livetiming.formula1.com/static/2021/2021-04-18_Emilia_Romagna_Grand_Prix/2021-04-18_Race/CarData.z.jsonStream',
    downloadCache: './cache/CarDataDownload.jsonStream'
}

if (!fs.existsSync(carData.downloadCache)) {
    console.log('Downloading data...')
    const file = fs.createWriteStream(carData.downloadCache);
    http.get(carData.url, function (response) {
        response.pipe(file);
    });
} else {
    console.log('Reading cache...')
}

// process data
streamCacheToJson(carData.downloadCache, './cache/CarData.json');

// FUNCTIONS

async function streamCacheToJson(streamCacheFile, outputFile) {
    try {
        let jsonFileContents = "";
        const fileStream = fs.createReadStream(streamCacheFile);

        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            const [time, compressedData] = line.split('"')
            var buf = Buffer.from(compressedData, 'base64');
            const data = zlib.inflateRawSync(buf)
            jsonFileContents += `{
            "time": "${time}"
            "data": ${data.toString('utf-8')}
            },`;
        }

        console.log(`Writing ${outputFile}`)
        fs.writeFileSync(outputFile, `[${jsonFileContents}]`)
    } catch (e) {
        console.error("😭 PROCESSING ERROR 😭\n", e, '\n', e.message)
    }
}