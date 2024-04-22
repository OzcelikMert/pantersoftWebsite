import Mysql from "../../../pantersoft/server/mysql";
import V from "../../../pantersoft/server/operation/variable";
import Result from "../../../public/helper/service_result";
import {var_types} from "../../../pantersoft/server/mysql/helper";
import {ErrorCode,TableTypes} from "../../../config/helper/require";


const tbl = {
    blog: new (require("../../../config/helper/mysql/table/blog").default),
    category_linked: new (require("../../../config/helper/mysql/table/category_linked").default)
}

interface Data { id: number, type: string }

class Blog {
    private result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: any;
    constructor(db: Mysql, data: Data, session: any) {
        this.db = db;
        this.data = V.clear_all_data(data);
        this.session = session;
    }

    private delete(){
      this.result.result =  this.db.delete(tbl.blog.TABLE_NAME)
            .where.equals([{
                key: tbl.blog.ID,
                value: this.data.id,
                type: var_types.NUMBER
            }]).run()

        this.db.delete(tbl.category_linked.TABLE_NAME)
            .where.equals([{
                key: tbl.category_linked.ITEM_ID,
                value: this.data.id,
                type: var_types.NUMBER
            }]).run();
    }

    private check_values() {
        if(V.empty(this.data.id)) this.result.error_code = ErrorCode.EMPTY_VALUE;
        if(this.result.error_code !== ErrorCode.SUCCESS) this.result.status = false;
    }

    init() : Result{
        this.check_values();
        if (this.result.status) {
            switch (this.data.type) {
                case "delete": this.delete(); break;
            }
        }
        return this.result;
    }
}

export default Blog;