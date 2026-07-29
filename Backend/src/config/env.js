import dotenv from "dotenv";

dotenv.config({ quiet: true });

const ENV = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || "TFIutyr74$E%$%DU",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://postgres:fsafkjhre3469873ggfbrt@localhost:5433/testManagementDb?schema=public",
};

export default ENV;
