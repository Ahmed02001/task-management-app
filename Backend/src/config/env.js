import dotenv from "dotenv";

dotenv.config({ quiet: true });

const ENV = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://postgres:fsafkjhre3469873ggfbrt@localhost:5433/testManagementDb?schema=public",
};

export default ENV;
