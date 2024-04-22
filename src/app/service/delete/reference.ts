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
    id: number,
    type: string
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

    private delete() : Array<any> | any {
        this.result.result = this.db.delete(tbl.reference.TABLE_NAME)
            .where.equals([{key: tbl.reference.ID,value:this.data.id, type: var_types.NUMBER}])
            .run();
    }

    private check_values(){
        if (!(V.isset(()=> this.data.id))) {
            this.result.error_code = ErrorCode.EMPTY_VALUE;
        }

        //if(this.result.error_code == ErrorCode.SUCCESS){}
        if(this.result.error_code !== ErrorCode.SUCCESS) this.result.status = false;
    }

    init() : Result | any{
        this.check_values();
        if (this.result.status) this.delete();
        return this.result;
    }
}

export default Reference;