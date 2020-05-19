import express from 'express';
import axios from 'axios';
import env from './env';
import { diffInHours, getClientIP, calcPercentiles } from './utils';
import { IVendorStats, IAPIInfo, IPCache } from './types';

const app = express();

const initVendorStats = () => {
  const stats = {};
  for (let vendor of Object.keys(env.vendors)) {
    stats[vendor] = [];
  }
  return stats;
};

const vendorStats: IVendorStats = initVendorStats();
const ipCache: IPCache = {};

let currentVendor = Object.keys(env.vendors)[0];

//
// Helper methods
//

// Remember call time and api latency for each API request
const updateVendorStats = (apiLatency: number) => {
  const curVendorStats = vendorStats[currentVendor];

  curVendorStats.push({
    callTime: new Date(),
    apiLatency,
  });
  if (curVendorStats.length > env.maxStatsCache) {
    curVendorStats.shift();
  }
};

// Check if specified vendor can be used and does not exceed the specified limit
const canUseVendor = (vendor) => {
  const stats = vendorStats[vendor];
  const maxRequestsPerHour = env.vendors[vendor].maxRequestsPerHour;

  if (stats.length <= maxRequestsPerHour) return true;

  // Get appropriate stat from the past
  // or simply the oldest one if we have < maxRequestsPerHour stats
  const idx = stats.length - maxRequestsPerHour;

  // See if we reached maxRequestsPerHour calls in an hour
  if (diffInHours(stats[idx].callTime, stats[stats.length - 1].callTime) < 1) {
    return false;
  } else {
    return true;
  }
};

// Default is currentVendor, otherwise - check for any available
const getAvailableVendor = () => {
  if (canUseVendor(currentVendor)) {
    return currentVendor;
  } else {
    const otherVendors = Object.keys(env.vendors).filter(
      (v) => v !== currentVendor
    );

    for (let vendor of otherVendors) {
      if (canUseVendor(vendor)) {
        currentVendor = vendor;
        return vendor;
      }
    }
    return undefined;
  }
};

// Proxy the API call to one of th vendors and get the Country info and other stats
const getCountryByIP = async (ip: string): Promise<IAPIInfo> => {
  const ipParts = ip.split('.');
  const ipBClass = `${ipParts[0]}.${ipParts[1]}`;

  // Check IP cache
  // DEBUG: disables IP cache
  if (ipCache[ipBClass] === undefined || env.IS_DEBUG) {
    const startTime = process.hrtime();
    const vendor = getAvailableVendor();
    if (vendor === undefined) {
      return {
        success: false,
        errorCode: 'Limit per hour is exceeded on all vendors!',
      };
    } else {
      const vendorInfo = env.vendors[vendor];
      const url = vendorInfo.urlFormat.replace('%IP_ADDRESS%', ip);
      try {
        const res = await axios.get(url);

        const endTime = process.hrtime(startTime);
        const apiLatency = (endTime[0] * 1000000000 + endTime[1]) / 1000000;
        updateVendorStats(apiLatency);

        ipCache[ipBClass] = res.data[vendorInfo.countryField];

        return {
          success: true,
          countryName: res.data[vendorInfo.countryField],
          apiLatency,
          vendor,
        };
      } catch (err) {
        return {
          success: false,
          errorCode: `Internal server error: ${err.code}`,
        };
      }
    }
  } else {
    return {
      success: true,
      countryName: ipCache[ipBClass],
      vendor: 'cache',
      apiLatency: 0,
    };
  }
};

//
// Routes
//

// Show help
app.get('/', (req, res) => {
  res.send(`
  <strong>Available methods:</strong><br/><br/>
  <code style="line-height: 1.5rem">
  /getIPCountry: returns the IP and the Country name of the requester<br/>
  /metrics: returns metrics per vendor
  </code>`);
});

// Resolve IP into Country name
app.get('/getIPCountry', async (req, res) => {
  const ip = getClientIP(req);
  let ret: IAPIInfo;

  res.header('Content-Type', 'application/json');

  if (ip === '127.0.0.1') {
    ret = {
      success: true,
      countryName: 'Localhost',
      apiLatency: 0,
      vendor: 'none',
    };
  } else {
    ret = await getCountryByIP(ip);
  }

  if (ret.success) {
    const out = {
      ip,
      countryName: ret.countryName,
      apiLatency: Number(ret.apiLatency.toFixed(2)),
      vendor: ret.vendor,
    };
    // DEBUG: show all stats in every API response
    if (env.IS_DEBUG) out['vendorStats'] = vendorStats;

    res.send(out);
  } else {
    res.status(500).send({ error: ret.errorCode });
  }
});

// Show all vendor metrics
app.get('/metrics', async (req, res) => {
  const out = {};
  for (let vendor of Object.keys(vendorStats)) {
    out[vendor] = calcPercentiles(vendorStats[vendor]);
  }

  res.header('Content-Type', 'application/json');
  res.send(out);
});

export default app;
