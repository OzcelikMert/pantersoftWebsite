import Helper, {QueryType, ParamInsert, ParamSelect, ParamUpdate, ParamHelper} from './helper';

export let Connection : null;

class Mysql extends Helper{
    protected connect: any;
    private type: QueryType | null = null;
    private values: any = {
        table_name : "",
    }

    //param class
    private param_insert : ParamInsert | null = null;
    private param_select : ParamSelect | null = null;
    private param_update : ParamUpdate | null = null;
    private readonly param_helper : ParamHelper;

    constructor() {
        super();
        this.param_helper = new ParamHelper(this);
    }
    insert(table_name: string){
        this.type = QueryType.INSERT;
        this.param_insert = new ParamInsert(this);
        this.values.table_name = table_name;
        return this.param_insert;
    }
    select(table_name: string){
        this.type = QueryType.SELECT;
        this.param_select = new ParamSelect(this,this.param_helper);
        this.values.table_name = table_name;
        return this.param_select;
    }
    update(table_name: string){
        this.type = QueryType.UPDATE;
        this.param_update = new ParamUpdate(this,this.param_helper);
        this.values.table_name = table_name;
        return this.param_update;
    }
    delete(table_name: string){
        this.type = QueryType.DELETE;
        this.values.table_name = table_name;
        return this.param_helper;
    }
    run(just_show_sql: boolean = false){

            let sql = "";
            let result: any;
            let helper_result;
            switch (this.type)  {
                case QueryType.INSERT:
                    // @ts-ignore
                    result = this.param_insert._init();
                    if (typeof result !== "undefined") sql = `INSERT INTO ${this.values.table_name} ${result.columns} VALUES ${result.values}`;
                    break;
                case QueryType.SELECT:
                    // @ts-ignore
                    result = this.param_select._init();
                    helper_result = this.param_helper._init();
                    if (typeof result !== "undefined") sql = `SELECT ${result.columns} FROM ${this.values.table_name} ${helper_result.join} ${helper_result.where} ${helper_result.group_by} ${helper_result.order_by} ${helper_result.limit};`;
                    break;
                case QueryType.UPDATE:
                    // @ts-ignore
                    result = this.param_update._init();
                    helper_result = this.param_helper._init();
                    if (typeof result !== "undefined") sql = `UPDATE ${this.values.table_name} SET ${result.columns} ${helper_result.where} ${helper_result.limit};`;
                    break;
                case QueryType.DELETE:
                    // @ts-ignore
                    helper_result = this.param_helper._init();
                    sql = `DELETE FROM ${this.values.table_name} ${helper_result.join} ${helper_result.where} ${helper_result.limit}`;
                    break;
            }

            let return_data = null;
            let self = this;
            if (!just_show_sql) {
                try {
                    // @ts-ignore
                    return_data = Connection.query(sql)
                }catch (err) {
                    return_data = {error: err.toString(), status: false,}
                    return return_data;
                }
                if (typeof result == "undefined") result = [];
            } else return_data = sql;

            return return_data;
    }
}

export default Mysql;