const Timeout = {
    VERY_FAST: 2500,
    FAST: 5000,
    NORMAL: 10000,
    SLOW: 15000,
    VERY_SLOW: 30000
}

if (typeof module !== 'undefined') module.exports = Timeout;