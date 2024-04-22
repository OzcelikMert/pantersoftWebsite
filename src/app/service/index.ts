import Mysql from "../../pantersoft/server/mysql";
import Express from "express";
import Result from "../../public/helper/service_result";
const ServicePage = require("./assets/js/service_page.js");

class Service {
    private req: any;
    private res: any;
    private db: Mysql;

    constructor(db: Mysql, req: any, res: any) {
        this.req = req;
        this.res = res;
        this.db = db;
    }

    public init(result = new Result()) : Promise<Result>{
        let self = this,
            wait = false;
        return new Promise( (resolve) => {
            if(!result.status){
                resolve(result);
            }
            
            let method = self.req.method,
                page = self.req.params.page,
                session = self.req.session,
                data = (self.req.method === "GET") ? self.req.query : self.req.body,
                service = null;

            try {
                service = new (eval(`require("./${method.toLowerCase()}/${page}")`).default)(self.db, data, session);
            } catch (error) { }

            if(service !== null){
                if(method === "POST" && page === ServicePage.IMAGE){
                    wait = true;
                    service.init().then((r: Result) => {
                        resolve(r)
                    });
                }else{
                    result = service.init();
                }
            }

            if(!wait) resolve(result);

        });
    }
}

export default Service;