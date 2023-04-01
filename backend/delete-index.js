const AWS = require("aws-sdk");

const credentials = require("./credentials");

AWS.config.update({
  accessKeyId: credentials.AWS_ACCESS_KEY_ID,
  secretAccessKey: credentials.AWS_SECRET_ACCESS_KEY,
  region: credentials.AWS_REGION,
});

const dynamodb = new AWS.DynamoDB();

const tableName = "btc_perp_tick_history";
const indexName = "new-index";

const params = {
  TableName: tableName,
  GlobalSecondaryIndexUpdates: [
    {
      Delete: {
        IndexName: indexName,
      },
    },
  ],
};

dynamodb.updateTable(params, (err, data) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Index deleted successfully:", data);
  }
});
