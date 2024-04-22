import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import {SessionAdmin} from "../../../config/session";
import V from "../../../pantersoft/server/operation/variable";
import {var_types} from "../../../pantersoft/server/mysql/helper";

const tbl = {
    example: new (require("../../../config/helper/mysql/table/example").default),
}

interface Data {
    type: string,
}

class Yasin {
    public result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: SessionAdmin;
    constructor(db: Mysql, data: any,session: any) {
        this.db = db;
        this.session = session.data.admin;
        this.data = V.clear_all_data(data);
    }

    private get() {
       this.result.result = this.db.select(tbl.example.TABLE_NAME).columns([
            tbl.example.ID,
            tbl.example.NAME,
            tbl.example.SURNAME,
            tbl.example.DATE,
            tbl.example.AGE,
            tbl.example.GENDER,
            tbl.example.PHONE,
            tbl.example.ADDRESS,
            tbl.example.CONTENT(this.session.lang)
       ]).run()
    }

    init() : Result | any{
        this.get();
        return this.result;
    }
}

export default Yasin;