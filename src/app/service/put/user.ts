import Mysql from "../../../pantersoft/server/mysql";
import Result from "../../../public/helper/service_result";
import {SessionAdmin} from "../../../config/session";
import V, {ClearTypes, DateMask} from "../../../pantersoft/server/operation/variable";
import HelperDB from "../../../public/helper/db";
import {Column, var_types} from "../../../pantersoft/server/mysql/helper";
import Crypto from "crypto";
import {config} from "../../../config/init";

import {ErrorCode,TableTypes} from "../../../config/helper/require";


const tbl = {
    user: new (require("../../../config/helper/mysql/table/user").default),
}

interface Data {
    type: string
    id?: number,
    name?: string | any,
    surname?: string | any,
    email?: string | any,
    password?: string,
    new_password?: string,
    new_password_verification?: string,
    image?: string | any,
    comment?: string,
    phone?: string,
    facebook?: string,
    twitter?: string,
    instagram?: string,
    linkedin?: string,
    gmail?: string,
    permission?: any,
    ip?: string,
    status?: number,
    ban_date_end?: string | any,
    ban_comment?: string,
}

class User {
    public result: Result = new Result();
    private readonly db: Mysql;
    private readonly data: Data;
    private readonly session: SessionAdmin;

    constructor(db: Mysql, data: any, session: any) {
        this.db = db;
        this.session = session.data.admin;
        this.data = V.clear_all_data(data);
    }

    private set() {
        let self = this;
        let data = this.data;
        let columns: Array<Column> = [];
        switch (this.data.type){
            case "user":
                columns = [
                    {key: tbl.user.NAME,              value: self.data.name},
                    {key: tbl.user.SURNAME,           value: self.data.surname},
                    {key: tbl.user.EMAIL,             value: V.clear(self.data.email, ClearTypes.EMAIL)},
                    {key: tbl.user.PERMISSION,        value: JSON.stringify(self.data.permission)},
                    {key: tbl.user.STATUS,        value: JSON.stringify(self.data.status)},
                ];

                if(!V.empty(self.data.password))
                    columns.push({key: tbl.user.PASSWORD, value: Crypto.createHash('sha256').update( config.PASSWORD_SALT + this.data.password).digest('hex')})

                if(self.data.status === TableTypes.status.BANNED){
                    columns.push(
                        {key: tbl.user.BAN_DATE, value: V.date_format(new Date(), DateMask.ALL)},
                        {key: tbl.user.BAN_COMMENT, value: self.data.ban_comment},
                        {key: tbl.user.BAN_DATE_END, value: V.date_format(new Date(self.data.ban_date_end), DateMask.ALL)},
                    );
                }
                break;
            case "info":
                columns = [
                    {key: tbl.user.NAME, value: data.name},
                    {key: tbl.user.SURNAME, value: data.surname},
                    {key: tbl.user.PHONE, value: data.phone},
                    {key: tbl.user.EMAIL, value: data.email},
                    {key: tbl.user.COMMENT(this.session.lang), value: data.comment},
                ];
                break;
            case "social_media":
                columns = [
                    {key: tbl.user.FACEBOOK, value: data.facebook},
                    {key: tbl.user.TWITTER, value: data.twitter},
                    {key: tbl.user.INSTAGRAM, value: data.instagram},
                    {key: tbl.user.GMAIL, value: data.gmail},
                    {key: tbl.user.LINKEDIN, value: data.linkedin},
                ];
                break;
            case "image":
                columns = [
                    {key: tbl.user.IMAGE, value: data.image},
                ];
                break;
            case "change_password":
                columns = [
                    {key: tbl.user.PASSWORD, value: Crypto.createHash('sha256').update( config.PASSWORD_SALT + this.data.new_password).digest('hex')}
                ];
                break;
        }

        self.db.update(tbl.user.TABLE_NAME)
            .columns(columns)
            .where.equals([{key:tbl.user.ID, value: this.data.id, type: var_types.NUMBER}])
            .run();

        switch(this.data.type){
            case "info":
                this.session.name = data.name;
                this.session.surname = data.surname;
                this.session.email = data.email;
                break;
            case "image":
                this.session.image = data.image;
                break;
        }
    }

    private check_values() {
        let self = this;
        if(V.empty(self.data.id)) self.data.id = self.session.id;

        switch (self.data.type){
            case "user":
                if (V.empty(self.data.id, self.data.name, self.data.surname, self.data.email, self.data.status, self.data.permission)) {
                    self.result.error_code = ErrorCode.EMPTY_VALUE;
                }

                if(self.result.error_code === ErrorCode.SUCCESS){
                    if(self.data.status === TableTypes.status.BANNED){
                        if (V.empty(self.data.ban_date_end)) {
                            self.result.error_code = ErrorCode.EMPTY_VALUE;
                        }
                    }
                }

                if(self.result.error_code === ErrorCode.SUCCESS){
                    let row = HelperDB.get.user(self.db, self.session.lang, self.data.id)[0];
                    if(TableTypes.user_rank[self.session.type] >= TableTypes.user_rank[row.type]) {
                        self.result.error_code = ErrorCode.NO_PERM;
                    }
                }
                break;
            case "info":
                if (V.empty(self.data.name, self.data.surname, self.data.email)) {
                    self.result.error_code = ErrorCode.EMPTY_VALUE;
                }
                break;
            case "social_media":break;
            case "image":
                if (V.empty(self.data.image)) {
                    self.result.error_code = ErrorCode.EMPTY_VALUE;
                }
                break;
            case "change_password":
                if (V.empty(self.data.password, self.data.new_password, self.data.new_password_verification)) {
                    self.result.error_code = ErrorCode.EMPTY_VALUE;
                }

                if(self.result.error_code === ErrorCode.SUCCESS){
                    if(self.data.new_password !== self.data.new_password_verification){
                        self.result.error_code = ErrorCode.NOT_SAME_VALUES;
                    }
                }

                if(self.result.error_code === ErrorCode.SUCCESS){
                    let row = HelperDB.get.user(self.db, self.session.lang, self.data.id, null, self.data.password);
                    if(row.length < 1) {
                        self.result.error_code = ErrorCode.WRONG_PASSWORD;
                    }
                }
                break;
        }

        if(this.result.error_code == ErrorCode.SUCCESS) {
            switch (self.data.type) {
                case "user":
                case "info":
                    let row = HelperDB.get.user(self.db, self.session.lang, 0, V.clear(self.data.email, ClearTypes.EMAIL));
                    if (row.length > 0) {
                        if (row[0].id != this.data.id) self.result.error_code = ErrorCode.REGISTERED_VALUE;
                    }
                    break;
            }
        }

        if(self.result.error_code !== ErrorCode.SUCCESS) self.result.status = false;
    }

    init() : Result{
        this.check_values();
        if(this.result.status) this.set();
        return this.result;
    }
}

export default User;