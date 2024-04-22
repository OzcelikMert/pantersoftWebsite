class Counter {
    TABLE_NAME = "counter";
    ID = `${this.TABLE_NAME}.id`;
    IMAGE = `${this.TABLE_NAME}.image`;
    TITLE = (lang: string) => { return `${this.TABLE_NAME}.title_${lang}`};
    VALUE = `${this.TABLE_NAME}.value`;
    TYPE = `${this.TABLE_NAME}.type`;
    DATE = `${this.TABLE_NAME}.date`;
    STATUS = `${this.TABLE_NAME}.status`;
    RANK = `${this.TABLE_NAME}.rank`;
    ALL = `${this.TABLE_NAME}.*`;
}

export default Counter;