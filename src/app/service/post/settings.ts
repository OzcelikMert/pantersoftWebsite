import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import {SessionAdmin} from "../../../config/session";
import {ErrorCode,TableTypes} from "../../../config/helper/require";
import V from "../../../pantersoft/server/operation/variable";

const tbl = {
    setting: new (require("../../../config/helper/mysql/table/setting").default),
}

interface Data {
    key: string,
    type: string,

    general: object,
    contact: object,
    social: object,
    captcha: object,
    lang: object,
}

class Settings {
    public result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: SessionAdmin;
    constructor(db: Mysql, data: any,session: any) {
        this.db = db;
        this.session = session.data.admin;
        this.data = V.clear_all_data(data);
    }

    private post() {
        let self = this;
        let db = this.db;

        // @ts-ignore
        let value = JSON.stringify(this.data[this.data.type]);

         db.insert(tbl.setting.TABLE_NAME)
            .values([
                {key: tbl.setting.KEY,value: this.data.type},
                {key: tbl.setting.VALUE(this.session.lang), value: value},
            ])
            .run();
    }
    private put(){
       this.result = (new (require("../put/settings")).default(this.db, this.data, this.session).init());
    }

    private check_values(){
        let self = this;
        let types = ["general", "contact", "social", "captcha", "lang", "mail"];
        if ((!V.isset(()=> this.data.type)) && (!types.includes(this.data.type))) {
            this.result.error_code = ErrorCode.NOT_FOUND;
        }

        if (this.result.error_code === ErrorCode.SUCCESS) {
            let rows = this.db.select(tbl.setting.TABLE_NAME)
                .columns(tbl.setting.ALL)
                .where.equals([{key: tbl.setting.KEY, value: this.data.type}])
                .run();
            if (rows.length === 0) { //new data
                self.post();
            }else if (rows.length > 0){
                this.put();
            }
        }

        if(this.result.error_code !== ErrorCode.SUCCESS) self.result.status = false;
    }

    init() : Result | any{
        this.check_values();
        return this.result;
    }
}

export default Settings;