import { connect } from "./connect.js";
connect();

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
