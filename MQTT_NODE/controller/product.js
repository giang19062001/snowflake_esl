const snowflake = require("../config/snowflake");
const mqttClient = require("../mqtt");

module.exports = {
   async updatePrice(req, res, next) {
      const { code, name, price } = req.body;
      console.log(code, name, price);

      if (!code || !name || !price) {
         return res.status(400).json({ error: "Missing code, name, or price" });
      }

      await snowflake.executeQuery(
         `
          UPDATE PRODUCTS
          SET PRICE = ? WHERE CODE = ?
          `,
         [price, code]
      );
      return res.status(200).json({ data: "Ok", result: true });
      // Publish data đến topic = code (ví dụ: "PRO001")
      // const topic = code;
      // const payload = JSON.stringify({ name, price });

      //   mqttClient.publish(topic, payload, (err) => {
      //      if (err) {
      //         console.error("❌ Publish error:", err);
      //         return res.status(500).json({ error: "Failed to send data to ESP32" });
      //      }
      //      console.log(`📢 Published to topic "${topic}": ${payload}`);
      //      res.status(200).json({ success: true, message: "Data sent to ESP32" });
      //   });
   },
   async getProducts(req, res, next) {
      const offset = req.body.offset;
      try {
         const products =
            offset !== 0
               ? await snowflake.executeQueryList(" SELECT * FROM PRODUCTS  AT(OFFSET => -60*?) ", [offset]) // phút
               : await snowflake.executeQueryList(" SELECT * FROM PRODUCTS ", []);
         return res.status(200).json({ data: products ?? [], result: true, message: "" });
      } catch (err) {
         console.error("Error fetching products:", err?.message);
         return res.status(200).json({ data: [], result: false, message: err?.message });
      }
   },
async getHistoryProduct(req, res, next) {
      const code = req.body.code;
      try {
         const histories = await snowflake.executeQueryList(` SELECT 
               code, name, price,
               METADATA$ACTION AS action_type, -- 'INSERT', 'DELETE', 'UPDATE'
               METADATA$ISUPDATE AS is_update
            FROM 
               products_stream
            WHERE 
               code = ?
           `, [code])
         return res.status(200).json({ data: histories, result: true, message: "" });
      } catch (err) {
         console.error("Error fetching products:", err?.message);
         return res.status(200).json({ data: [], result: false, message: err?.message });
      }
   },
   
};
