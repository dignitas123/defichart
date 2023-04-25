import { s3Client as client } from "./client.js";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { constants } from "./constants.js";

function streamToString(stream) {
  return new Promise((resolve, reject) => {
    let data = "";
    stream.on("data", (chunk) => {
      data += chunk;
    });
    stream.on("end", () => {
      resolve(data);
    });
    stream.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Put object on S3
 * @param { string } obj
 * @param { string } objKey Must be unique
 */
export async function putObjectOnS3(obj, objKey = "btcusd-perp-cp") {
  const input = {
    Body: obj,
    Bucket: constants.S3_BUCKET_NAME,
    Key: objKey,
    ContentType: "application/json",
  };
  const command = new PutObjectCommand(input);
  return await client.send(command);
}

/**
 * Get object on S3
 * @param { string } objKey Must be unique
 * @returns
 */
export async function getObjectOnS3(objKey = "btcusd-perp-cp") {
  try {
    const getObjectCommand = new GetObjectCommand({
      Bucket: constants.S3_BUCKET_NAME,
      Key: objKey,
    });

    const response = await client.send(getObjectCommand);

    const objectData = await streamToString(response.Body);

    return JSON.parse(objectData);
  } catch (error) {
    console.error("Error getting object data:", error);
  }
}
