const AWS = require("aws-sdk");

const credentials = require("./credentials");

AWS.config.update({
  accessKeyId: credentials.AWS_ACCESS_KEY_ID,
  secretAccessKey: credentials.AWS_SECRET_ACCESS_KEY,
  region: credentials.AWS_REGION,
});

const dynamoDB = new AWS.DynamoDB();

const tableName = 'btcusd-perp-history-tickdata'

// Define the table schema
const params = {
  KeySchema: [
    { AttributeName: 'timestamp', KeyType: 'HASH' }, // Partition key
    { AttributeName: 'price', KeyType: 'RANGE' } // Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: 'timestamp', AttributeType: 'S' },
    { AttributeName: 'price', AttributeType: 'N' }, // not necessary
    { AttributeName: 'volume', AttributeType: 'N' } // not necessary
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  },
  TableName: tableName
};

// Create the table
dynamoDB.createTable(params, function(err, data) {
  if (err) {
    console.error('Error creating table: ', err);
  } else {
    console.log('Table created successfully: ', data);
  }
});
