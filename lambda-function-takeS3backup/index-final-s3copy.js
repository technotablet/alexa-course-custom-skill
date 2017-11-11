'use strict';

console.log('Loading function');

const aws = require('aws-sdk');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });


exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    // Get the object from the event and show its content type
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
    const params = {
        Bucket: bucket,
        Key: key,
    };
    s3.getObject(params, (err, data) => {
        if (err) {
            console.log(err);
            const message = `Error getting object ${key} from bucket ${bucket}. Make sure they exist and your bucket is in the same region as this function.`;
            console.log(message);
            callback(message);
        } else {
            //console.log('CONTENT TYPE:', data.ContentType);
            
            var targetBucket = bucket + "-backup"; //treasuretrove-backup
            
            console.log("Copying data from " + bucket + " to " + targetBucket);
            
            s3.copyObject({
                Bucket: targetBucket,
                Key: key,
                
                CopySource: encodeURIComponent(bucket + '/' + key),
                MetadataDirective: 'COPY'
            }, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                } else {
                    console.log("Copied successfully from " + bucket + " to " + targetBucket);
                }
            });
            
            callback(null, data.ContentType);
        }
    });
};

