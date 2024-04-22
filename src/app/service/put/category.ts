import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import V, {ClearTypes, DateMask} from "../../../pantersoft/server/operation/variable";
import {SessionAdmin} from "../../../config/session";
import {var_types} from "../../../pantersoft/server/mysql/helper";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

const tbl = {
    category: new (require("../../../config/helper/mysql/table/category").default)
}
interface Data {
    name : string,
    main_id: number,
    id: number,
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
        let db = this.db;

        this.result.result = db.update(tbl.category.TABLE_NAME)
            .columns([
            {key: tbl.category.MAIN_ID,                 value: this.data.main_id},
            {key: tbl.category.NAME(this.session.lang), value: this.data.name},
            {key: tbl.category.URL(this.session.lang),  value: V.clear(this.data.name, ClearTypes.SEO_URL)},
            {key: tbl.category.DATE,                    value: V.date_format(new Date(),DateMask.ALL)},
            ]).where.equals([
                {key: tbl.category.ID, value: this.data.id, type: var_types.NUMBER}
            ]).run();
    }

    private check_values(){
        if (!(V.isset(()=> this.data.name)) && (this.data.main_id.isInt() && this.data.id.isInt())) {
            this.result.error_code = ErrorCode.EMPTY_VALUE;
        }
        if(this.result.error_code == ErrorCode.SUCCESS){
            this.data.main_id = (V.isset(()=> this.data.main_id))? this.data.main_id : 0;
            this.data.main_id = (this.data.main_id !== this.data.id) ? this.data.main_id : 0;
        }
        if(this.result.error_code !== ErrorCode.SUCCESS) this.result.status = false;
    }


    init() : Result | any{
        this.result.message = "category post"
        this.check_values();
        if (this.result.status){
            switch (this.data.type){
                case "category": this.category(); break;
                default: return;
            }
        }
        return this.result;
    }
}

export default Category;