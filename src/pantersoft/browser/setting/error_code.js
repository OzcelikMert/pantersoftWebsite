const ErrorCode = {
        SUCCESS: 0,
        INCORRECT_DATA: 1,
        EMPTY_VALUE: 2,
        WRONG_VALUE: 3,
        REGISTERED_VALUE: 4,
        SQL_SYNTAX: 5,
        NOT_FOUND: 6,
        UPLOAD_ERROR: 7,
        NOT_LOGGED_IN: 8,
        NO_PERM: 9,
        IP_BLOCK: 10,
        ALREADY_DATA: 11,
        WRONG_EMAIL_OR_PASSWORD: 12,
        WRONG_PASSWORD: 13,
        NOT_SAME_VALUES: 14
};

if (typeof module !== 'undefined') module.exports = ErrorCode;