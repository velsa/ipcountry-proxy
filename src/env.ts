const DEFAULT_MAX_REQ_PER_HOUR =
  process.env.NODE_ENV === 'test' || process.env.DEBUG ? 3 : 10;

export default {
  LISTEN_PORT: process.env.PORT || 3100,
  IS_DEBUG: process.env.DEBUG ? true : false,
  IS_TEST: process.env.NOVE_ENV === 'test' ? true : false,
  maxStatsCache: process.env.MAX_STAT_CACHE || 100, // must be larger than ANY maxRequestsPerHour!
  vendors: {
    ipstack: {
      urlFormat:
        'http://api.ipstack.com/%IP_ADDRESS%?access_key=77751ecb2afe137d5936c8199a1921cc',
      countryField: 'country_name',
      maxRequestsPerHour: DEFAULT_MAX_REQ_PER_HOUR,
    },
    'ip-api': {
      urlFormat: 'http://ip-api.com/json/%IP_ADDRESS%',
      countryField: 'country',
      maxRequestsPerHour: DEFAULT_MAX_REQ_PER_HOUR,
    },
  },
};
