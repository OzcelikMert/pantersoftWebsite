import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import V from "../../../pantersoft/server/operation/variable";
import {SessionAdmin} from "../../../config/session";
import {OrderBy, var_types} from "../../../pantersoft/server/mysql/helper";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

const tbl = {
    category: new (require("../../../config/helper/mysql/table/category").default),
    category_linked: new (require("../../../config/helper/mysql/table/category_linked").default),
}
interface Data {
    name : string,
    date : string,
    url: string,
    main_id: number,
    is_active: boolean,
    is_delete: boolean,
    category_type: number,
    type: string,
}

class Category{
    public result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: SessionAdmin;
    constructor(db: Mysql, data: any,session: any) {
        this.db = db;
        this.session = session.data.admin;
        this.data = V.clear_all_data(data);
    }

    private category() : Array<any> | any {
        this.result.result.category = this.db.select(tbl.category.TABLE_NAME)
            .columns([
                this.db.as_name(tbl.category.NAME(this.session.lang),"name"),
                tbl.category.MAIN_ID,
                tbl.category.ID,
                this.db.as_name(tbl.category.URL(this.session.lang),"url"),
                tbl.category.DATE,
                tbl.category.IS_ACTIVE,
                tbl.category.IS_DELETE,
            ])
            .where.equals([{key:tbl.category.TYPE, value: this.data.category_type,type:var_types.NUMBER}])
            .order_by([tbl.category.MAIN_ID],OrderBy.ASC)
            .run();
    }
    private linked_category(){
        this.result.result.linked_category = this.db.select(tbl.category_linked.TABLE_NAME)
            .columns([
                tbl.category_linked.ID,
                tbl.category_linked.ITEM_ID,
                tbl.category_linked.CATEGORY_ID,
            ])
            .where.equals([{key:tbl.category_linked.TYPE, value: this.data.category_type,type:var_types.NUMBER}])
            .order_by(tbl.category_linked.ITEM_ID,OrderBy.ASC).run();
    }

    private check_values(){
        if (V.isset(this.data.category_type)) {
            this.result.error_code = ErrorCode.EMPTY_VALUE;
        }
        if(this.result.error_code !== ErrorCode.SUCCESS) this.result.status = false;
    }

    init() : Result | any{
        this.check_values();
        if (this.result.status){
            this.result.result = {};
            switch (this.data.type){
                case "all": this.category(); this.linked_category(); break;
                case "category": this.category(); break;
                case "category_linked": this.linked_category(); break;
                default: return;
            }
        }
        return this.result;
    }
}

export default Category;