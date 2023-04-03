import { writeClient } from "./client.js";
import { constants } from "./constants.js";
import { UpdateTableCommand } from "@aws-sdk/client-timestream-write";

const params = {
  DatabaseName: constants.DATABASE_NAME,
  TableName: constants.TABLE_NAME,
  RetentionProperties: {
    MemoryStoreRetentionPeriodInHours: 24,
    MagneticStoreRetentionPeriodInDays: 360,
  },
};

const command = new UpdateTableCommand(params);

try {
  const data = await writeClient.send(command);
  console.log("Table updated", data);
} catch (error) {
  console.log("Error updating table. ", error);
}
