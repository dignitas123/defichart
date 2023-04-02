import { connect } from "../../connectv2";
connect();

const dynamoDB = new AWS.DynamoDB();

const tableName = "btc_perp_tick_history";
const newAttributeName = "volume";
const attributeType = "N";

const indexName =
  newAttributeName[0].toUpperCase() + newAttributeName.slice(1) + "Index";

const params = {
  TableName: tableName,
  AttributeDefinitions: [
    {
      AttributeName: newAttributeName,
      AttributeType: attributeType,
    },
  ],
  GlobalSecondaryIndexUpdates: [
    {
      Create: {
        IndexName: indexName,
        KeySchema: [
          {
            AttributeName: newAttributeName,
            KeyType: "HASH",
          },
        ],
        Projection: {
          ProjectionType: "ALL",
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      },
    },
  ],
};

dynamoDB.updateTable(params, function (err, data) {
  if (err) {
    console.error(
      "Unable to update table. Error JSON:",
      JSON.stringify(err, null, 2)
    );
  } else {
    console.log(
      "Updated table. Table description JSON:",
      JSON.stringify(data.TableDescription, null, 2)
    );
  }
});
