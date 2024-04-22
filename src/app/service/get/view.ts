import Mysql from "../../../pantersoft/server/mysql";
import Variable from "../../../pantersoft/server/operation/variable";
import Result from "../../../public/helper/service_result";
import {OrderBy} from "../../../pantersoft/server/mysql/helper";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

const tbl = {
    views: new (require("../../../config/helper/mysql/table/view").default)
}

interface Data {
    date_start?: string | any,
    date_end?: string | any,
    ip?: string,
    type: string,
    detail_type?: string
}

class View {
    private result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: any;
    constructor(db: Mysql, data: Data, session: any) {
        this.db = db;
        this.data = Variable.clear_all_data(data);
        this.session = session;
    }

    private total() {
        let db = this.db;

        this.result.result = db.select(tbl.views.TABLE_NAME)
            .columns(db.as_name(db.count(tbl.views.ID), "total"))
            .run()[0];
    }

    private detail() {
        let db = this.db;
        let number = 0;
        let time_end = "23:59:59";
        let time_start = "00:00:00";
        let date = new Date();

        switch (this.data.detail_type){
            case "year":
                number = 4;
                this.data.date_end = Variable.date_format(date, `yyyy-12-31 ${time_end}`);
                this.data.date_start = Variable.date_format(date, `2020-01-01 ${time_start}`);
                break;
            case "month":
                number = 7;
                this.data.date_end = Variable.date_format(date, `yyyy-mm-31 ${time_end}`);
                date.addYears(-1);
                this.data.date_start = Variable.date_format(date, `yyyy-mm-01 ${time_start}`);
                break;
            case "week":
                number = 10;
                this.data.date_end = Variable.date_format(date, `yyyy-mm-dd ${time_end}`);
                date.addDays(-7);
                this.data.date_start = Variable.date_format(date, `yyyy-mm-dd ${time_start}`);
                break;
            case "day": number = 13;
                this.data.date_end = Variable.date_format(date, `yyyy-mm-dd ${time_end}`);
                this.data.date_start = Variable.date_format(date, `yyyy-mm-dd ${time_start}`);
                break;
        }

        this.result.result = db.select(tbl.views.TABLE_NAME)
            .columns([
                db.as_name(db.count(tbl.views.ID), "total"),
                db.as_name(db.substring(tbl.views.DATE, 1, number), "date")
            ])
            .where.between([
                {
                    column: tbl.views.DATE,
                    values: [
                        {value: this.data.date_start},
                        {value: this.data.date_end}
                    ]
                }
            ])
            .group_by([db.substring(tbl.views.DATE, 1, number)])
            .order_by(["date"], OrderBy.ASC)
            .run();
    }

    init() : Result{
        switch (this.data.type){
            case "total": this.total(); break;
            case "detail": this.detail(); break;
        }

        return this.result;
    }
}

export default View;