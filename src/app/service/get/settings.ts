import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import {SessionAdmin} from "../../../config/session";
import HelperDB from "../../../public/helper/db";

const tbl = {
    setting: new (require("../../../config/helper/mysql/table/setting").default),
}
interface Data {
    type: string
}

class Settings{
    public result: Result = new Result();
    private readonly db: Mysql;
    //private readonly data: Data;
    private readonly session: SessionAdmin;
    constructor(db: Mysql, data: any,session: any) {
        this.db = db;
        this.session = session.data.admin;
        //this.data = V.clear_all_data(data);
    }

    private get() : Array<any> | any {
        /*let rows = this.db.select(tbl.setting.TABLE_NAME)
            .columns([
                tbl.setting.KEY,
                this.db.as_name(tbl.setting.VALUE(this.session.lang),"value"),
            ]).run();

        rows.forEach((item: {key: string, value: string})=>{
            item.value = JSON.parse(item.value);
        })*/
        this.result.result = HelperDB.get.setting(this.db,this.session.lang);
    }

    init() : Result | any{
        this.get();
        return this.result;
    }
}

export default Settings;