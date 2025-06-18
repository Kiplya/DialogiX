import pool from "./pool";

const checkDbConnection = async () => {
  try {
    await pool.query("SELECT 1");
  } catch (err) {
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  }
};

export default checkDbConnection;
