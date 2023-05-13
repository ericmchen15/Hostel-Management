const AWS = require("aws-sdk")
require('dotenv').config();
const process = require('process');

AWS.config.update({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_KEY
});

let s3 = new AWS.S3();

async function getImage(key) {
    const data = s3
        .getObject({
            Bucket: process.env.BUCKET,
            Key: key,
        })
        .promise();
    return data;
}

module.exports = getImage;