class Setting {
    TABLE_NAME = "setting";
    ID = `${this.TABLE_NAME}.id`;
    KEY = `${this.TABLE_NAME}.key`;
    VALUE = (lang: string) => { return `${this.TABLE_NAME}.value_${lang}`};
    ALL = `${this.TABLE_NAME}.*`;
}

export default Setting;