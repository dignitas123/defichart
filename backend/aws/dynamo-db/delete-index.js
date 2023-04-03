import { connect } from "../connectv2";
connect();

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
