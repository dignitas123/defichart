import { getObjectOnS3, putObjectOnS3 } from "./aws-module/s3-fns.js";

const s3Obj = await getObjectOnS3();

const changedDailyLow = 30197.5;
s3Obj["d1"].low = changedDailyLow;

console.log("getObjectOnS3", s3Obj);

const putObjectResult = putObjectOnS3(s3Obj);
console.log("putObjectResult", putObjectResult);
