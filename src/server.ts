import Express from "express";
import Init from "./config/init";
const app = Express();
new Init(app);

import AdminRouter from "./app/admin/router";
app.use("/admin", AdminRouter);

import WebsiteRouter from "./app/website/router";
app.use("/", WebsiteRouter);


app.listen(8080, () => {
    console.log("server is starting");
});


