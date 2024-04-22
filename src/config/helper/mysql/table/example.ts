class Example {
    TABLE_NAME = "example";
    ID = `${this.TABLE_NAME}.id`;
    NAME = `${this.TABLE_NAME}.name`;
    SURNAME = `${this.TABLE_NAME}.surname`;
    AGE = `${this.TABLE_NAME}.age`;
    GENDER = `${this.TABLE_NAME}.gender`;
    DATE = `${this.TABLE_NAME}.date`;
    ADDRESS = `${this.TABLE_NAME}.address`;
    STATUS = `${this.TABLE_NAME}.status`;
    PHONE = `${this.TABLE_NAME}.phone`;
    CONTENT = (lang: string) => { return `${this.TABLE_NAME}.content_${lang}`};
    ALL = `${this.TABLE_NAME}.*`;
}

export default Example;