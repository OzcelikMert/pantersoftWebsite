class CounterType {
    TABLE_NAME = "counter_type";
    ID = `${this.TABLE_NAME}.id`;
    NAME = (lang: string) => { return `${this.TABLE_NAME}.name_${lang}`};
    ALL = `${this.TABLE_NAME}.*`;
}

export default CounterType;