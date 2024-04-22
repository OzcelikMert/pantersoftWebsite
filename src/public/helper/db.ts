import V from "../../pantersoft/server/operation/variable";
import Mysql from "../../pantersoft/server/mysql";
import {OrderBy, var_types} from "../../pantersoft/server/mysql/helper";
import Crypto from "crypto";
import {config} from "../../config/init";
import U from "../../pantersoft/server/operation/user";


const tbl = {
    views: new (require("../../config/helper/mysql/table/view").default),
    user: new (require("../../config/helper/mysql/table/user").default),
    permission: new (require("../../config/helper/mysql/table/permission").default),
    user_type: new (require("../../config/helper/mysql/table/user_type").default),
    status_type: new (require("../../config/helper/mysql/table/status_type").default),
    slider: new (require("../../config/helper/mysql/table/slider").default),
    service: new (require("../../config/helper/mysql/table/service").default),
    setting: new (require("../../config/helper/mysql/table/setting").default),
    testimonial: new (require("../../config/helper/mysql/table/testimonial").default),
    counter: new (require("../../config/helper/mysql/table/counter").default),
    counter_type: new (require("../../config/helper/mysql/table/counter_type").default),
}

 class HelperDB {
    constructor() {}

    static set = {
        viewer(db: Mysql, req: any){
            let ip = U.get_ip(req);
            let date_now = new Date();
            let date = V.date_format(date_now, "yyyy-mm-dd")
            let date_time = V.date_format(date_now, "yyyy-mm-dd HH:MM:ss");
            let url =  req.baseUrl + req._parsedUrl.pathname;

            let data = db.select(tbl.views.TABLE_NAME)
                .columns(tbl.views.ALL)
                .where.equals([
                    {key: tbl.views.IP, value: ip},
                    {key: tbl.views.URL, value: url}
                ]).where.like([
                    {key: tbl.views.DATE, value: `%${date}%`}
                ]).run();


            if(data.length === 0){
                db.insert(tbl.views.TABLE_NAME)
                    .values([
                        {key: tbl.views.DATE, value: date_time},
                        {key: tbl.views.URL, value: url},
                        {key: tbl.views.IP, value: ip}
                    ]).run();
            }
        }
    }

    static get = {
        user(db: Mysql, lang: string, id: number = 0, email: string | null = null, password: string | null = null) : any {
            let query = db.select(tbl.user.TABLE_NAME).columns([
                tbl.user.ID,
                tbl.user.EMAIL,
                tbl.user.TYPE,
                tbl.user.NAME,
                tbl.user.SURNAME,
                tbl.user.PHONE,
                tbl.user.IMAGE,
                tbl.user.DATE_LOGIN,
                tbl.user.DATE,
                tbl.user.IP,
                db.as_name(tbl.user.COMMENT(lang), "comment"),
                tbl.user.PERMISSION,
                tbl.user.FACEBOOK,
                tbl.user.TWITTER,
                tbl.user.INSTAGRAM,
                tbl.user.LINKEDIN,
                tbl.user.GMAIL,
                tbl.user.STATUS,
                tbl.user.BAN_RANGE,
                tbl.user.BAN_DATE,
                tbl.user.BAN_DATE_END,
                tbl.user.BAN_COMMENT,
                db.as_name(tbl.user_type.NAME(lang), "type_name"),
                db.as_name(tbl.status_type.NAME(lang), "status_name")
            ]).join.inner([
                {table: tbl.user_type.TABLE_NAME, equal: [tbl.user_type.ID, tbl.user.TYPE]},
                {table: tbl.status_type.TABLE_NAME, equal: [tbl.status_type.ID, tbl.user.STATUS]}
            ]).order_by([tbl.user.ID], OrderBy.DESC);

            if(id > 0 && password === null && email === null){
                query.where.equals([
                    {key: tbl.user.ID, value: id, type: var_types.NUMBER}
                ]);
            }else if(email !== null && password !== null && id === 0){
                query.where.equals([
                    {key:tbl.user.EMAIL, value: email},
                    {key:tbl.user.PASSWORD, value: Crypto.createHash('sha256').update(config.PASSWORD_SALT + password).digest('hex')}
                ])
            }else if(email !== null && password === null && id === 0){
                query.where.equals([
                    {key:tbl.user.EMAIL, value: email}
                ])
            }else if(id > 0 && password !== null && email === null){
                query.where.equals([
                    {key: tbl.user.ID, value: id, type: var_types.NUMBER},
                    {key:tbl.user.PASSWORD, value: Crypto.createHash('sha256').update(config.PASSWORD_SALT + password).digest('hex')}
                ])
            }

            return query.run();
        },
        permission(db: Mysql, lang: string, id: number | number[] = 0) : any {
            let query = db.select(tbl.permission.TABLE_NAME).columns([
                tbl.permission.ID,
                tbl.permission.RANK,
                db.as_name(tbl.permission.NAME(lang), "name"),
            ]).order_by([tbl.permission.RANK, tbl.permission.NAME(lang)], OrderBy.ASC);

            if(id !== 0){
                query.where.equals([{key: tbl.permission.ID, value: id, type: var_types.NUMBER}])
            }

            return query.run();
        },
        user_type(db: Mysql, lang: string, id: number | number[] = 0) : any {
            let query = db.select(tbl.user_type.TABLE_NAME).columns([
                tbl.user_type.ID,
                tbl.user_type.RANK,
                db.as_name(tbl.user_type.NAME(lang), "name"),
            ]).order_by([tbl.user_type.RANK], OrderBy.ASC);

            if(id !== 0){
                query.where.equals([{key: tbl.user_type.ID, value: id, type: var_types.NUMBER}])
            }

            return query.run();
        },
        slider(db: Mysql, lang: string, id: number = 0, status: number | Array<number> = 0) : any {
            let query = db.select(tbl.slider.TABLE_NAME).columns([
                tbl.slider.ID,
                tbl.slider.IMAGE,
                tbl.slider.RANK,
                tbl.slider.DATE,
                tbl.slider.STATUS,
                db.as_name(tbl.status_type.NAME(lang), "status_name"),
                db.as_name(tbl.slider.TITLE(lang), "title"),
                db.as_name(tbl.slider.CONTENT(lang), "content"),
            ]).join.inner([
                {table: tbl.status_type.TABLE_NAME, equal: [tbl.status_type.ID, tbl.slider.STATUS]}
            ]).order_by([tbl.slider.RANK], OrderBy.ASC)
            .order_by([tbl.slider.ID], OrderBy.DESC);

            if(id !== 0){
                query.where.equals([{key: tbl.slider.ID, value: id, type: var_types.NUMBER}])
            }
            if(status !== 0){
                query.where.equals([{key: tbl.slider.STATUS, value: status, type: var_types.NUMBER}])
            }

            return query.run();
        },
        service(db: Mysql, lang: string, id: number = 0, status: number | Array<number> = 0) : any {
            let query = db.select(tbl.service.TABLE_NAME).columns([
                tbl.service.ID,
                tbl.service.IMAGE,
                tbl.service.RANK,
                tbl.service.DATE,
                tbl.service.STATUS,
                db.as_name(tbl.status_type.NAME(lang), "status_name"),
                db.as_name(tbl.service.TITLE(lang), "title"),
                db.as_name(tbl.service.CONTENT(lang), "content"),
            ]).join.inner([
                {table: tbl.status_type.TABLE_NAME, equal: [tbl.status_type.ID, tbl.service.STATUS]}
            ]).order_by([tbl.service.RANK], OrderBy.ASC)
            .order_by([tbl.service.ID], OrderBy.DESC);

            if(id !== 0){
                query.where.equals([{key: tbl.service.ID, value: id, type: var_types.NUMBER}])
            }
            if(status !== 0){
                query.where.equals([{key: tbl.service.STATUS, value: status, type: var_types.NUMBER}])
            }

            return query.run();
        },
        testimonials(db: Mysql, lang: string, id: number = 0) : any {
            let query = db.select(tbl.testimonial.TABLE_NAME).columns([
                tbl.testimonial.ID,
                tbl.testimonial.IMAGE,
                tbl.testimonial.RANK,
                tbl.testimonial.DATE,
                tbl.testimonial.STATUS,
                db.as_name(tbl.status_type.NAME(lang), "status_name"),
                db.as_name(tbl.testimonial.TITLE(lang), "title"),
                db.as_name(tbl.testimonial.CONTENT(lang), "content"),
            ]).join.inner([
                {table: tbl.status_type.TABLE_NAME, equal: [tbl.status_type.ID, tbl.testimonial.STATUS]}
            ]).order_by([tbl.testimonial.RANK], OrderBy.ASC)
            .order_by([tbl.testimonial.ID], OrderBy.DESC);
            

            if(id !== 0){
                query.where.equals([{key: tbl.testimonial.ID, value: id, type: var_types.NUMBER}])
            }

            return query.run();
        },
        counter(db: Mysql, lang: string, id: number = 0, status: number | Array<number> = 0) : any {
            let query = db.select(tbl.counter.TABLE_NAME).columns([
                tbl.counter.ID,
                tbl.counter.IMAGE,
                tbl.counter.VALUE,
                tbl.counter.TYPE,
                tbl.counter.RANK,
                tbl.counter.DATE,
                tbl.counter.STATUS,
                db.as_name(tbl.counter_type.NAME(lang), "type_name"),
                db.as_name(tbl.status_type.NAME(lang), "status_name"),
                db.as_name(tbl.counter.TITLE(lang), "title"),
            ]).join.inner([
                {table: tbl.status_type.TABLE_NAME, equal: [tbl.status_type.ID, tbl.counter.STATUS]},
                {table: tbl.counter_type.TABLE_NAME, equal: [tbl.counter_type.ID, tbl.counter.TYPE]}
            ]).order_by([tbl.counter.RANK], OrderBy.ASC)
            .order_by([tbl.counter.ID], OrderBy.DESC);

            if(id !== 0){
                query.where.equals([{key: tbl.counter.ID, value: id, type: var_types.NUMBER}])
            }
            if(status !== 0){
                query.where.equals([{key: tbl.counter.STATUS, value: status, type: var_types.NUMBER}])
            }

            return query.run();
        },
        counter_type(db: Mysql, lang: string, id: number | number[] = 0) : any {
            let query = db.select(tbl.counter_type.TABLE_NAME).columns([
                tbl.counter_type.ID,
                db.as_name(tbl.counter_type.NAME(lang), "name"),
            ]).order_by([tbl.counter_type.ID], OrderBy.ASC);

            if(id !== 0){
                query.where.equals([{key: tbl.counter_type.ID, value: id, type: var_types.NUMBER}])
            }

            return query.run();
        },
        setting(db: Mysql, lang: string) : any {
          let result = db.select(tbl.setting.TABLE_NAME)
                .columns([
                    tbl.setting.KEY,
                    db.as_name(tbl.setting.VALUE(lang),"value"),
                ]).run();

            result.forEach((item: {key: string, value: string})=> item.value = JSON.parse(item.value))
            return result;
        }
    }
}

export default HelperDB;