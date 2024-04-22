import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import V, {ClearTypes, DateMask} from "../../../pantersoft/server/operation/variable";
import Crypto from "crypto";
import {config} from "../../../config/init";
import {Session, SessionAdmin} from "../../../config/session";
import HelperDB from "../../../public/helper/db";
import {ErrorCode,TableTypes} from "../../../config/helper/require";

const tbl = {
    user: new (require("../../../config/helper/mysql/table/user").default),
}

interface Data {
    name : string,
    surname : string,
    email: string,
    password: string,
    permission: Array<number>,
    ip?: string,
    status: number,
    ban_date_end?: string | any,
    ban_comment?: string,
    user_type: number,
    type?: string,
}

class User {
    public result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: SessionAdmin;
    constructor(db: Mysql, data: any,session: any) {
        this.db = db;
        this.session = session.data.admin;
        this.data = V.clear_all_data(data);
    }

    private set() {
        let self = this;
        let db = this.db;

        let insert_values = [
            {key: tbl.user.NAME,              value: self.data.name},
            {key: tbl.user.SURNAME,           value: self.data.surname},
            {key: tbl.user.TYPE,              value: self.data.user_type},
            {key: tbl.user.EMAIL,             value: V.clear(self.data.email, ClearTypes.EMAIL)},
            {key: tbl.user.IP,                value: self.session.ip},
            {key: tbl.user.PASSWORD,          value: Crypto.createHash('sha256').update( config.PASSWORD_SALT + this.data.password).digest('hex')},
            {key: tbl.user.DATE,              value: V.date_format(new Date(), DateMask.ALL)},
            {key: tbl.user.PERMISSION,        value: JSON.stringify(self.data.permission)},
            {key: tbl.user.STATUS,        value: JSON.stringify(self.data.status)},
        ];

        if(self.data.status === TableTypes.status.BANNED){
            insert_values.push(
                {key: tbl.user.BAN_DATE, value: V.date_format(new Date(), DateMask.ALL)},
                {key: tbl.user.BAN_COMMENT, value: self.data.ban_comment},
                {key: tbl.user.BAN_DATE_END, value: V.date_format(new Date(self.data.ban_date_end), DateMask.ALL)},
            );
        }

        db.insert(tbl.user.TABLE_NAME).values(insert_values).run();
    }

    private check_values(){
        let self = this;
        if (V.empty(
                self.data.name,
                self.data.surname,
                self.data.email,
                self.data.password,
                self.data.status,
                self.data.permission,
                self.data.user_type
            ) ||
            (self.data.status === TableTypes.status.BANNED && V.empty(self.data.ban_date_end, self.data.ban_comment))
        ) self.result.error_code = ErrorCode.EMPTY_VALUE;

        if(self.result.error_code == ErrorCode.SUCCESS){
            if(self.session.type !== TableTypes.user.ADMIN && V.array_index_of(self.session.permission, "id", TableTypes.permission.USER_ADD) === -1){
                self.result.error_code = ErrorCode.NO_PERM;
            }
        }

        if(self.result.error_code == ErrorCode.SUCCESS){
            let filter =
                (self.data.user_type === TableTypes.user.EDITOR) ? TableTypes.permission_for_user.EDITOR() :
                    (self.data.user_type === TableTypes.user.AUTHOR) ? TableTypes.permission_for_user.AUTHOR() :
                        (self.data.user_type === TableTypes.user.USER) ? TableTypes.permission_for_user.USER() :
                            [];
            if(self.data.permission.length !== V.array_find_multi(filter, "", self.data.permission).length){
                self.result.error_code = ErrorCode.WRONG_VALUE;
            }
        }

        if(this.result.error_code === ErrorCode.SUCCESS){
            if (TableTypes.user_rank[self.session.type] >= TableTypes.user_rank[self.data.user_type]) {
                self.result.error_code = ErrorCode.NO_PERM;
            }
        }

        if(this.result.error_code === ErrorCode.SUCCESS){
            let row = HelperDB.get.user(self.db, self.session.lang, 0, V.clear(self.data.email, ClearTypes.EMAIL));
            if (row.length > 0) {
                if(row[0].id !== self.session.id) self.result.error_code = ErrorCode.REGISTERED_VALUE;
            }
        }

        if(self.result.error_code !== ErrorCode.SUCCESS) self.result.status = false;
    }

    init() : Result | any{
        this.check_values();
        if (this.result.status) {
            this.set();
        }
        return this.result;
    }
}

export default User;