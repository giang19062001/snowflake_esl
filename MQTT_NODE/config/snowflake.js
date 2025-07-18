const snowflake = require("snowflake-sdk");

// Tạo connection pool
const connectionPool = snowflake.createPool(
   {
      account: "DTYJLEE-SO27804",
      username: "GIANG19062001",
      password: "Giang19062001!",
      role: "ACCOUNTADMIN",
      warehouse: "COMPUTE_WH",
      database: "MYDB",
      schema: "MARKET",
      clientSessionKeepAlive: true,
   },
   {
      max: 10, // Số kết nối tối đa trong pool
      min: 0, // Số kết nối tối thiểu
      testOnBorrow: true, // Kiểm tra kết nối trước khi sử dụng
      autostart: true, // Tự động khởi tạo pool
   }
);

module.exports = {
   executeQueryList: async (sqlText, binds = []) => {
      try {
         return new Promise((resolve, reject) => {
            connectionPool.use(async (clientConnection) => {
               const statement = await clientConnection.execute({
                  sqlText: sqlText,
                  binds: binds,
                  complete: function (err, stmt, rows) {
                     if (err) {
                        return reject(err); // Ném lỗi khi có lỗi
                     }
                     var stream = stmt.streamRows();
                     stream.on("data", function (row) {
                        // console.log("row", row);
                     });

                     stream.on("error", function (error) {
                        console.error("Stream error:", error);
                        reject(error); // Xử lý lỗi stream
                     });
                     stream.on("end", function (row) {
                        resolve(rows);
                     });
                  },
               });
            });
         });
      } catch (err) {
         console.error("Connection test failed:", err);
         throw err;
      }
   },
   executeQuery: async (sqlText, binds = []) => {
      try {
         return new Promise((resolve, reject) => {
            connectionPool.use(async (clientConnection) => {
               const statement = await clientConnection.execute({
                  sqlText: sqlText,
                  binds: binds,
                  complete: function (err, stmt, rows) {
                     if (err) {
                        reject(err);
                        return;
                     }

                     // Kiểm tra loại truy vấn
                     const queryType = sqlText.trim().split(/\s+/)[0].toUpperCase();

                     if (queryType === "SELECT") {
                        // Đối với SELECT, trả về các dòng dữ liệu
                        const stream = stmt.streamRows();
                        const resultRows = [];

                        stream.on("data", function (row) {
                           resultRows.push(row);
                        });

                        stream.on("end", function () {
                           resolve(resultRows);
                        });

                        stream.on("error", function (error) {
                           reject(error);
                        });
                     } else {
                        // Đối với INSERT/UPDATE/DELETE, trả về thông tin số bản ghi bị ảnh hưởng
                        resolve({
                           affectedRows: stmt.getNumRows(),
                           queryType: queryType,
                           statement: stmt,
                        });
                     }
                  },
               });
            });
         });
      } catch (err) {
         console.error("Database operation failed:", err);
         throw err;
      }
   },

   /**
    * Đóng pool kết nối
    */
   closePool: async () => {
      try {
         await pool.drain();
         await pool.clear();
         console.log("Connection pool closed successfully");
      } catch (err) {
         console.error("Error closing connection pool:", err);
      }
   },

   /**
    * Lấy thông tin pool
    * @returns {object} Thông tin trạng thái pool
    */
   getPoolStatus: () => {
      return {
         size: pool.size,
         available: pool.available,
         borrowed: pool.borrowed,
         pending: pool.pending,
      };
   },
};
