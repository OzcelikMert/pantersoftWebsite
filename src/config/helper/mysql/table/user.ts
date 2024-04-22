class User {
    TABLE_NAME = "user";
    ID = `${this.TABLE_NAME}.id`;
    TYPE = `${this.TABLE_NAME}.type`;
    NAME = `${this.TABLE_NAME}.name`;
    SURNAME = `${this.TABLE_NAME}.surname`;
    PHONE = `${this.TABLE_NAME}.phone`;
    IMAGE = `${this.TABLE_NAME}.image`;
    EMAIL = `${this.TABLE_NAME}.email`;
    DATE_LOGIN = `${this.TABLE_NAME}.date_login`;
    DATE = `${this.TABLE_NAME}.date`;
    IP = `${this.TABLE_NAME}.ip`;
    COMMENT = (lang: string) => `${this.TABLE_NAME}.comment_${lang}`;
    PASSWORD = `${this.TABLE_NAME}.password`;
    PERMISSION = `${this.TABLE_NAME}.permission`;
    FACEBOOK = `${this.TABLE_NAME}.facebook`;
    TWITTER = `${this.TABLE_NAME}.twitter`;
    INSTAGRAM = `${this.TABLE_NAME}.instagram`;
    LINKEDIN = `${this.TABLE_NAME}.linkedin`;
    GMAIL = `${this.TABLE_NAME}.gmail`;
    STATUS = `${this.TABLE_NAME}.status`;
    BAN_RANGE = `${this.TABLE_NAME}.ban_range`;
    BAN_DATE = `${this.TABLE_NAME}.ban_date`;
    BAN_DATE_END = `${this.TABLE_NAME}.ban_date_end`;
    BAN_COMMENT = `${this.TABLE_NAME}.ban_comment`;
    ALL = `${this.TABLE_NAME}.*`;
}
export default User;