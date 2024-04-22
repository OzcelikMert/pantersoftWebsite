class Subscriber {
    TABLE_NAME = "subscriber";
    ID = `${this.TABLE_NAME}.id`;
    EMAIL = `${this.TABLE_NAME}.email`;
    STATUS = `${this.TABLE_NAME}.status`;
    IP = `${this.TABLE_NAME}.ip`;
    ALL = `${this.TABLE_NAME}.*`;
}

export default Subscriber;