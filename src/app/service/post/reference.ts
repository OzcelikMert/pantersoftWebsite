import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import V, {DateMask} from "../../../pantersoft/server/operation/variable";
import {SessionAdmin} from "../../../config/session";
import {var_types} from "../../../pantersoft/server/mysql/helper";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

const tbl = {
    reference: new (require("../../../config/helper/mysql/table/reference").default)
}
interface Data {
    name : string,
    url: string,
    image: string,
    rank: number,
    status: number,
    type: string,
}

class Reference{
    public result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: SessionAdmin;
    constructor(db: Mysql, data: any,session: any) {
        this.db = db;
        this.session = session.data.admin;
        this.data = V.clear_all_data(data);
    }

    private post() : Array<any> | any {
        this.result.result = this.db.insert(tbl.reference.TABLE_NAME).values([
            {key: tbl.reference.NAME(this.session.lang), value: this.data.name},
            {key: tbl.reference.URL,  value: this.data.url},
            {key: tbl.reference.RANK, value: this.data.rank  ,type:var_types.NUMBER},
            {key: tbl.reference.IMAGE, value: this.data.image},
            {key: tbl.reference.DATE, value: V.date_format(new Date(),DateMask.ALL)},
            {key: tbl.reference.STATUS, value: this.data.status, type: var_types.NUMBER},
        ]).run();
    }

    private check_values(){
        if (!
            (V.isset(()=> this.data.url))   &&
            (V.isset(()=> this.data.name))  &&
            (V.isset(()=> this.data.rank))  &&
            (V.isset(()=> this.data.image)) &&
            (V.isset(()=> this.data.status))
        ) {
            this.result.error_code = ErrorCode.EMPTY_VALUE;
        }

        //if(this.result.error_code == ErrorCode.SUCCESS){}
        if(this.result.error_code !== ErrorCode.SUCCESS) this.result.status = false;
    }


    init() : Result | any{
        this.check_values();
        if (this.result.status) this.post();
        return this.result;
    }
}

export default Reference;