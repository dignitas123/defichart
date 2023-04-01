const AWS = require("aws-sdk");

const credentials = require("./credentials");

AWS.config.update({
  accessKeyId: credentials.AWS_ACCESS_KEY_ID,
  secretAccessKey: credentials.AWS_SECRET_ACCESS_KEY,
  region: credentials.AWS_REGION,
});

const dynamoDB = new AWS.DynamoDB();

const tableName = "btc_perp_tick_history";
const item = {
  price: 1502.03,
  volume: 3093092,
  timestamp: new Date().toISOString(),
};

const params = {
  TableName: tableName,
  Item: item,
};

dynamoDB.putItem(params, (err, data) => {
  if (err) {
    console.log("Error adding item to table:", err);
  } else {
    console.log("Item added to table:", data);
  }
});
