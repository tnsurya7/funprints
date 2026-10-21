import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Live visitors in last 5 minutes
    let liveVisitors: any[] = [];
    try {
      liveVisitors = await sql`
        SELECT session_id, current_page, product_id, device_category, traffic_source, last_active_at, created_at
        FROM visitor_sessions
        WHERE last_active_at > NOW() - INTERVAL '15 minutes'
        ORDER BY last_active_at DESC
        LIMIT 50;
      `;
    } catch (e) {
      console.warn('Could not query live visitors:', e);
    }

    // 2. High-level aggregates from orders
    let orderStats: any = {};
    try {
      const statsRows = await sql`
        SELECT 
          COUNT(*) as total_orders,
          COUNT(*) FILTER (WHERE payment_status = 'CONFIRMED') as confirmed_orders,
          COUNT(*) FILTER (WHERE payment_status = 'SUBMITTED_FOR_VERIFICATION') as pending_verification_orders,
          COUNT(*) FILTER (WHERE payment_status = 'PENDING') as pending_payment_orders,
          COUNT(*) FILTER (WHERE payment_status IN ('SUBMITTED_FOR_VERIFICATION', 'PENDING')) as total_pending_payments,
          COUNT(*) FILTER (WHERE order_status = 'PROCESSING') as processing_orders,
          COUNT(*) FILTER (WHERE order_status = 'SHIPPED') as shipped_orders,
          COUNT(*) FILTER (WHERE order_status = 'DELIVERED') as delivered_orders,
          COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'CONFIRMED'), 0) as verified_revenue,
          COALESCE(SUM(total_amount), 0) as gross_order_volume
        FROM orders;
      `;
      orderStats = statsRows[0] || {};
    } catch (e) {
      console.warn('Could not query order stats:', e);
    }

    // 3. Customers count & active customers
    let customerStats = { total_customers: 0, active_customers: 0 };
    try {
      const customerRows = await sql`
        SELECT 
          COUNT(*) as total_customers,
          COUNT(*) FILTER (WHERE is_active = true) as active_customers
        FROM customers;
      `;
      customerStats = {
        total_customers: Number(customerRows[0]?.total_customers || 0),
        active_customers: Number(customerRows[0]?.active_customers || 0),
      };
    } catch (e) {
      console.warn('Could not query customers:', e);
    }

    // 4. Enquiries counts (General Contact, Retail Custom, Factory Bulk, Brand Collaboration)
    let enquiries = {
      contact: 0,
      retail: 0,
      bulk: 0,
      brand: 0,
      pendingContact: 0,
      pendingRetail: 0,
      pendingBulk: 0,
      pendingBrand: 0,
      totalPending: 0,
      total: 0,
    };
    try {
      const [contactRows, retailRows, bulkRows, brandRows] = await Promise.all([
        sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status != 'RESOLVED') as pending FROM contact_enquiries;`.catch(() => [{ total: 0, pending: 0 }]),
        sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status != 'RESOLVED') as pending FROM retail_enquiries;`.catch(() => [{ total: 0, pending: 0 }]),
        sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status != 'RESOLVED') as pending FROM bulk_enquiries;`.catch(() => [{ total: 0, pending: 0 }]),
        sql`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status != 'RESOLVED') as pending FROM brand_enquiries;`.catch(() => [{ total: 0, pending: 0 }]),
      ]);
      const cTot = Number(contactRows[0]?.total || 0);
      const cPen = Number(contactRows[0]?.pending || 0);
      const rTot = Number(retailRows[0]?.total || 0);
      const rPen = Number(retailRows[0]?.pending || 0);
      const bTot = Number(bulkRows[0]?.total || 0);
      const bPen = Number(bulkRows[0]?.pending || 0);
      const brTot = Number(brandRows[0]?.total || 0);
      const brPen = Number(brandRows[0]?.pending || 0);

      enquiries = {
        contact: cTot,
        retail: rTot,
        bulk: bTot,
        brand: brTot,
        pendingContact: cPen,
        pendingRetail: rPen,
        pendingBulk: bPen,
        pendingBrand: brPen,
        totalPending: cPen + rPen + bPen + brPen,
        total: cTot + rTot + bTot + brTot,
      };
    } catch (e) {
      console.warn('Could not query enquiries:', e);
    }

    // 5. Inventory & low stock alerts
    let inventoryStats = { total_products: 0, low_stock_count: 0 };
    try {
      const invRows = await sql`
        SELECT 
          COUNT(DISTINCT p.id) as total_products,
          COUNT(DISTINCT p.id) FILTER (WHERE COALESCE(stock_sum.total_stock, 0) <= COALESCE(p.low_stock_threshold, 10) OR p.is_in_stock = false) as low_stock_count
        FROM products p
        LEFT JOIN (
          SELECT product_id, SUM(stock_quantity) as total_stock 
          FROM product_variants 
          GROUP BY product_id
        ) stock_sum ON stock_sum.product_id = p.id;
      `;
      inventoryStats = {
        total_products: Number(invRows[0]?.total_products || 0),
        low_stock_count: Number(invRows[0]?.low_stock_count || 0),
      };
    } catch (e) {
      console.warn('Could not query inventory stats:', e);
    }

    // 5. Product performance
    let topProducts: any[] = [];
    try {
      topProducts = await sql`
        SELECT product_name, SUM(quantity) as units_sold, SUM(subtotal) as total_revenue
        FROM order_items
        GROUP BY product_name
        ORDER BY units_sold DESC
        LIMIT 5;
      `;
    } catch (e) {
      console.warn('Could not query top products:', e);
    }

    // 6. Recent revenue trend
    let revenueTrend: any[] = [];
    try {
      revenueTrend = await sql`
        SELECT 
          TO_CHAR(created_at, 'YYYY-MM-DD') as date,
          COUNT(*) as order_count,
          COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'CONFIRMED'), 0) as revenue
        FROM orders
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
        ORDER BY date ASC;
      `;
    } catch (e) {
      console.warn('Could not query revenue trend:', e);
    }


    // 7. Event summaries from analytics_events (genuine database count)
    let eventsSummary: any[] = [];
    try {
      eventsSummary = await sql`
        SELECT event_name as event_type, COUNT(*)::int as count
        FROM analytics_events
        GROUP BY event_name;
      `;
    } catch (e) {
      eventsSummary = [];
    }

    const pageViewCount = Number(eventsSummary.find((e: any) => e.event_type === 'page_view')?.count || 0);
    const addToCartCount = Number(eventsSummary.find((e: any) => e.event_type === 'add_to_cart')?.count || 0);
    const checkoutCount = Number(eventsSummary.find((e: any) => e.event_type === 'begin_checkout')?.count || 0);

    const normalizedEventsSummary = [
      { event_type: 'page_view', count: pageViewCount },
      { event_type: 'add_to_cart', count: addToCartCount },
      { event_type: 'begin_checkout', count: checkoutCount },
      { event_type: 'purchase_confirmed', count: Number(orderStats.confirmed_orders || 0) },
    ];

    // 8. Application database-tracked session breakdowns (strictly genuine records)
    let deviceBreakdown: any[] = [];
    let topPages: any[] = [];
    let trafficSources: any[] = [];

    try {
      deviceBreakdown = await sql`
        SELECT COALESCE(device_category, 'Unknown') as device, COUNT(*)::int as count
        FROM visitor_sessions
        GROUP BY device_category
        ORDER BY count DESC;
      `;
    } catch (e) {}

    try {
      topPages = await sql`
        SELECT COALESCE(current_page, '/') as page, COUNT(*)::int as views
        FROM visitor_sessions
        WHERE current_page IS NOT NULL AND current_page != ''
        GROUP BY current_page
        ORDER BY views DESC
        LIMIT 10;
      `;
    } catch (e) {}

    try {
      trafficSources = await sql`
        SELECT COALESCE(traffic_source, 'Direct') as source, COUNT(*)::int as count
        FROM visitor_sessions
        GROUP BY traffic_source
        ORDER BY count DESC
        LIMIT 10;
      `;
    } catch (e) {}

    // 9. Official Vercel Web Analytics API Querying
    const rawRange = req.nextUrl.searchParams.get('range') || '7d';
    const allowedRanges = ['today', '7d', '30d'] as const;
    const range: 'today' | '7d' | '30d' = allowedRanges.includes(rawRange as any) ? (rawRange as any) : '7d';

    const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN;
    const PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'prj_lEB0bm4c3VRX7YTfgSeM3iIsAUZa';
    const TEAM_ID = process.env.VERCEL_TEAM_ID || 'team_sTHCJMZ5rp1XF0earJxxVjVI';

    const now = new Date();
    let sinceISO: string;
    let untilISO: string = now.toISOString();
    let timeDimension = 'day';

    if (range === 'today') {
      const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
      sinceISO = todayStart.toISOString();
      timeDimension = 'hour';
    } else if (range === '30d') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      sinceISO = past30.toISOString();
      timeDimension = 'day';
    } else {
      // 7d default
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      sinceISO = past7.toISOString();
      timeDimension = 'day';
    }

    interface VercelAnalyticsResult {
      configured: boolean;
      status: 'ok' | 'token_missing' | 'unauthorized' | 'error';
      message: string;
      source: string;
      rangeLabel: string;
      lastSynced: string;
      overview: {
        visitors: number;
        pageViews: number;
      };
      timeseries: Array<{ date: string; visitors: number; views: number }>;
      pages: Array<{ path: string; views: number; visitors: number; pct?: number }>;
      routes: Array<{ route: string; views: number; visitors: number; pct?: number }>;
      hostnames: Array<{ hostname: string; views: number; visitors: number; pct?: number }>;
      referrers: Array<{ referrer: string; views: number; pct?: number }>;
      countries: Array<{ country: string; code?: string; flag?: string; views: number; visitors: number; pct?: number }>;
      devices: Array<{ device: string; views: number; visitors: number; pct?: number }>;
      browsers: Array<{ browser: string; views: number; visitors: number; pct?: number }>;
      operatingSystems: Array<{ os: string; views: number; visitors: number; pct?: number }>;
    }

    let vercelWebAnalytics: VercelAnalyticsResult = {
      configured: Boolean(VERCEL_TOKEN),
      status: VERCEL_TOKEN ? 'ok' : 'token_missing',
      message: VERCEL_TOKEN
        ? 'Connected to official Vercel Web Analytics API.'
        : 'VERCEL_API_TOKEN is not configured on server. Provide a valid Vercel Personal Access Token to query official Vercel Web Analytics.',
      source: 'api.vercel.com/v1/query/web-analytics',
      rangeLabel: range === 'today' ? 'Today' : range === '30d' ? 'Last 30 Days' : 'Last 7 Days',
      lastSynced: now.toISOString(),
      overview: {
        visitors: 0,
        pageViews: 0,
      },
      timeseries: [],
      pages: [],
      routes: [],
      hostnames: [],
      referrers: [],
      countries: [],
      devices: [],
      browsers: [],
      operatingSystems: [],
    };

    if (VERCEL_TOKEN) {
      async function queryVercelApi(path: string, params: Record<string, string>) {
        const url = new URL(`https://api.vercel.com/v1/query/web-analytics/${path}`);
        url.searchParams.set('projectId', PROJECT_ID);
        if (TEAM_ID) url.searchParams.set('teamId', TEAM_ID);
        url.searchParams.set('environment', 'production');
        for (const [k, v] of Object.entries(params)) {
          url.searchParams.set(k, v);
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        try {
          const res = await fetch(url.toString(), {
            headers: {
              Authorization: `Bearer ${VERCEL_TOKEN}`,
              Accept: 'application/json',
            },
            signal: controller.signal,
            cache: 'no-store',
          });
          clearTimeout(timeout);
          if (!res.ok) {
            return { error: true, status: res.status, statusText: res.statusText };
          }
          return await res.json();
        } catch (err: any) {
          clearTimeout(timeout);
          return { error: true, message: err?.message || 'Network error' };
        }
      }

      try {
        const [
          countRes,
          timeseriesRes,
          pathsRes,
          routesRes,
          referrersRes,
          countriesRes,
          devicesRes,
          browsersRes,
          osRes,
        ] = await Promise.allSettled([
          queryVercelApi('visits/count', { since: sinceISO, until: untilISO }),
          queryVercelApi('visits/aggregate', { since: sinceISO, until: untilISO, by: timeDimension }),
          queryVercelApi('visits/aggregate', { since: sinceISO, until: untilISO, by: 'requestPath', limit: '10' }),
          queryVercelApi('visits/aggregate', { since: sinceISO, until: untilISO, by: 'route', limit: '10' }),
          queryVercelApi('visits/aggregate', { since: sinceISO, until: untilISO, by: 'referrerHostname', limit: '10' }),
          queryVercelApi('visits/aggregate', { since: sinceISO, until: untilISO, by: 'country', limit: '10' }),
          queryVercelApi('visits/aggregate', { since: sinceISO, until: untilISO, by: 'deviceType', limit: '10' }),
          queryVercelApi('visits/aggregate', { since: sinceISO, until: untilISO, by: 'browserName', limit: '10' }),
          queryVercelApi('visits/aggregate', { since: sinceISO, until: untilISO, by: 'osName', limit: '10' }),
        ]);

        const countVal = countRes.status === 'fulfilled' ? countRes.value : null;
        const countData = countVal?.data || countVal;

        if (countVal?.error) {
          if (countVal.status === 401 || countVal.status === 403) {
            vercelWebAnalytics.status = 'unauthorized';
            vercelWebAnalytics.message = 'Vercel API Token unauthorized or expired (401/403). Please verify VERCEL_API_TOKEN permissions.';
          } else {
            vercelWebAnalytics.status = 'error';
            vercelWebAnalytics.message = `Vercel Web Analytics API error (${countVal.status || countVal.message || 'error'}).`;
          }
          console.warn(`[Vercel Analytics Diagnostic] Status: ${countVal.status}, Message: ${countVal.message || countVal.statusText}`);
        } else if (countData && (typeof countData.visitors === 'number' || typeof countData.pageviews === 'number')) {
          vercelWebAnalytics.status = 'ok';
          vercelWebAnalytics.overview = {
            visitors: Number(countData.visitors || 0),
            pageViews: Number(countData.pageviews || 0),
          };
        }

        // Map timeseries
        const timeseriesVal = timeseriesRes.status === 'fulfilled' ? timeseriesRes.value : null;
        const timeseriesList = timeseriesVal && !timeseriesVal.error
          ? (Array.isArray(timeseriesVal.data) ? timeseriesVal.data : Array.isArray(timeseriesVal) ? timeseriesVal : [])
          : [];

        if (timeseriesList.length > 0) {
          vercelWebAnalytics.timeseries = timeseriesList.map((item: any) => {
            const rawDate = item.day || item.hour || item.date || item.timestamp || '';
            let formattedDate = String(rawDate);
            try {
              const parsed = new Date(rawDate);
              if (!isNaN(parsed.getTime())) {
                if (timeDimension === 'hour') {
                  formattedDate = parsed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                } else {
                  formattedDate = parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }
              }
            } catch (_) {}

            return {
              date: formattedDate,
              visitors: Number(item.visitors || 0),
              views: Number(item.pageviews || 0),
            };
          });
        }

        // Map breakdowns
        const totalViews = vercelWebAnalytics.overview.pageViews || 1;

        const mapDimension = (res: PromiseSettledResult<any>, dimKey: string, nameKey: string) => {
          if (res.status === 'fulfilled' && res.value && !res.value.error) {
            const rawList = Array.isArray(res.value?.data) ? res.value.data : Array.isArray(res.value) ? res.value : [];
            return rawList.map((item: any) => ({
              [nameKey]: item[dimKey] || 'Unknown',
              views: Number(item.pageviews || 0),
              visitors: Number(item.visitors || 0),
              pct: totalViews > 0 ? Math.round((Number(item.pageviews || 0) / totalViews) * 100) : 0,
            }));
          }
          return [];
        };

        const COUNTRY_NAME_MAP: Record<string, { name: string; flag: string }> = {
          IN: { name: 'India', flag: '🇮🇳' },
          US: { name: 'United States', flag: '🇺🇸' },
          JP: { name: 'Japan', flag: '🇯🇵' },
          GB: { name: 'United Kingdom', flag: '🇬🇧' },
          CA: { name: 'Canada', flag: '🇨🇦' },
          AE: { name: 'United Arab Emirates', flag: '🇦🇪' },
          SG: { name: 'Singapore', flag: '🇸🇬' },
          AU: { name: 'Australia', flag: '🇦🇺' },
          DE: { name: 'Germany', flag: '🇩🇪' },
          FR: { name: 'France', flag: '🇫🇷' },
        };

        vercelWebAnalytics.pages = mapDimension(pathsRes, 'requestPath', 'path');
        vercelWebAnalytics.routes = mapDimension(routesRes, 'route', 'route');
        vercelWebAnalytics.hostnames = [
          {
            hostname: 'funprint.in',
            views: vercelWebAnalytics.overview.pageViews,
            visitors: vercelWebAnalytics.overview.visitors,
            pct: 100,
          },
        ];
        vercelWebAnalytics.referrers = mapDimension(referrersRes, 'referrerHostname', 'referrer').map((r: any) => ({
          ...r,
          referrer: (!r.referrer || r.referrer === 'Unknown' || !String(r.referrer).trim()) ? 'Direct / Organic' : r.referrer,
        }));
        vercelWebAnalytics.countries = mapDimension(countriesRes, 'country', 'country').map((c: any) => {
          const code = String(c.country || '').toUpperCase();
          const meta = COUNTRY_NAME_MAP[code];
          return {
            ...c,
            country: meta ? meta.name : (c.country || 'Unknown'),
            flag: meta ? meta.flag : '🌐',
            code,
          };
        });
        vercelWebAnalytics.devices = mapDimension(devicesRes, 'deviceType', 'device');
        vercelWebAnalytics.browsers = mapDimension(browsersRes, 'browserName', 'browser');
        vercelWebAnalytics.operatingSystems = mapDimension(osRes, 'osName', 'os');
      } catch (err: any) {
        vercelWebAnalytics.status = 'error';
        vercelWebAnalytics.message = 'Unexpected failure while querying Vercel Web Analytics API.';
      }
    }

    const totalSales = Number(orderStats.verified_revenue || 0);
    const totalOrders = Number(orderStats.total_orders || 0);
    const activeVisitorsCount = liveVisitors.length;

    const payload = {
      success: true,
      activeVisitorsCount,
      activeVisitors: liveVisitors,
      totalSales,
      totalOrders,
      orderStats,
      customerStats,
      inventoryStats,
      enquiries,
      overview: {
        totalRevenue: totalSales,
        totalOrders,
        confirmedOrders: Number(orderStats.confirmed_orders || 0),
        pendingVerificationOrders: Number(orderStats.pending_verification_orders || 0),
        pendingPaymentOrders: Number(orderStats.pending_payment_orders || 0),
        totalPendingPayments: Number(orderStats.total_pending_payments || 0),
        activeCustomers: customerStats.active_customers,
        totalCustomers: customerStats.total_customers,
        totalProducts: inventoryStats.total_products,
        lowStockCount: inventoryStats.low_stock_count,
        enquiries,
        visitors: vercelWebAnalytics.overview.visitors,
        pageViews: vercelWebAnalytics.overview.pageViews,
      },
      eventsSummary: normalizedEventsSummary,
      vercelWebAnalytics,
      deviceBreakdown,
      topPages,
      trafficSources,
      data: {
        liveVisitorsCount: activeVisitorsCount,
        liveVisitors,
        stats: orderStats,
        customerStats,
        totalCustomers: customerStats.total_customers,
        inventoryStats,
        enquiries,
        topProducts,
        revenueTrend,
        eventsSummary: normalizedEventsSummary,
        vercelWebAnalytics,
      },
    };

    return NextResponse.json(payload);
  } catch (error: any) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
