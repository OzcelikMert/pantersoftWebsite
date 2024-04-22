import Ejs from "ejs";
import Express from "express";
import ExpressSession from "express-session";
import CookieParser from "cookie-parser";
import FileStore  from 'session-file-store';
import fs from "fs";
import {Connection} from "../pantersoft/server/mysql";
const SyncMysql = require('sync-mysql')
let store = FileStore(ExpressSession);

export let config = {
    APP: <any> null,
    PASSWORD_SALT: "a.m@pwd-wabby",
    PUBLIC_FOLDERS: [
        ["image"],
        ["public"],
        ["admin/assets", "app/admin/assets"],
        ["assets", "app/website/assets"],
        ["service/assets", "app/service/assets"],
        ["pantersoft/browser"]
    ],
    VIEW_ENGINE: {
        view: "ejs",
        engine: Ejs.renderFile,
    },
    SESSION: {
        store: new store({
            path: "./session",
            ttl: 3600,
            reapInterval: 3600,
            logFn(...args) {}
        }),
        saveUninitialized: true,
        secret: 'panter_soft-dragi-@-123456',
        resave: true,
        cookie: { secure: false },
    },
    MYSQL: {
        config: {
            host: 'localhost',
            user: 'root',
            database: 'work',
            password: '',
            charset : 'utf8',
        },
    },
    ROOT_DIR: <string> "",
    LANG: <any> {}
}

 class Init{
    constructor(app:any) {
        config.APP = app;
        config.ROOT_DIR = `${require('path').resolve('./')}/src/`;

        Init.view_engine();
        Init.public_folders();
        Init.mysql_connection();
        Init.setup_session();
        Init.lang();
    }
    private static view_engine(){
        config.APP.set("view engine", config.VIEW_ENGINE.view);
        config.APP.engine("html",     config.VIEW_ENGINE.engine);
    }
    private static public_folders(){
        config.PUBLIC_FOLDERS.forEach((item)=>{
            if(item.length === 1){
                config.APP.use(`/${item}`, Express.static(`${config.ROOT_DIR}${item}`));
            }else{
                config.APP.use(`/${item[0]}`, Express.static(`${config.ROOT_DIR}${item[1]}`));
            }
        })
    }
    private static setup_session(){
        config.APP.set('trust proxy',1)
        config.APP.use(CookieParser());
        config.APP.use(ExpressSession(config.SESSION))
    }
    private static mysql_connection(){
        try {
            // @ts-ignore
            Connection = new SyncMysql(config.MYSQL.config);
        }catch (e) {
            console.log("Mysql Connection Error")
            console.error("Mysql Connection Error")
        }
    }
    private static lang(){
        config.LANG = JSON.parse(fs.readFileSync(`${config.ROOT_DIR}public/lang/tr.json`, "utf-8"));
    }
}

export default Init;