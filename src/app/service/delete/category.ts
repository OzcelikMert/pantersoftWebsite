import Mysql from "../../../pantersoft/server/mysql";
import V from "../../../pantersoft/server/operation/variable";
import Result from "../../../public/helper/service_result";
import {var_types} from "../../../pantersoft/server/mysql/helper";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

const tbl = {
    category: new (require("../../../config/helper/mysql/table/category").default),
    category_linked: new (require("../../../config/helper/mysql/table/category_linked").default)
}

interface Data {
    id: number,
}

class Category {
    private result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: any;
    constructor(db: Mysql, data: Data, session: any) {
        this.db = db;
        this.data = V.clear_all_data(data);
        this.session = session;
    }

    private set() {
        let result = [];
        //Deleted Category
        result[0] = this.db.delete(tbl.category.TABLE_NAME)
            .where.equals([{key: tbl.category.ID, value: this.data.id, type: var_types.NUMBER}])
            .run()
        //Deletes on links of deleted category
        result[1] = this.db.delete(tbl.category_linked.TABLE_NAME)
            .where.equals([{key: tbl.category_linked.CATEGORY_ID,value: this.data.id,type: var_types.NUMBER}])
            .run();

        //Makes the parent id of the deleted category "0"
        result[2] = this.db.update(tbl.category.TABLE_NAME)
            .columns([{key: tbl.category.MAIN_ID,value: 0, type: var_types.NUMBER}])
            .where.equals([{key: tbl.category.MAIN_ID, value: this.data.id, type: var_types.NUMBER}])
            .run()
       // this.result.result = result;

    }

    private check_values() {
        if(V.empty(this.data.id)) this.result.error_code = ErrorCode.EMPTY_VALUE;
        if(this.result.error_code !== ErrorCode.SUCCESS) this.result.status = false;
    }

    init() : Result{
        this.check_values();
        if(this.result.status) this.set()
        return this.result;
    }
}

export default Category;