import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();

    // Check authentication via cookie/session
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '7d'; // today, 7d, 30d, all

    // Calculate date filter
    let dateFilter: string | null = null;
    const now = new Date();
    if (range === 'today') {
      dateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    } else if (range === '7d') {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      dateFilter = d.toISOString();
    } else if (range === '30d') {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      dateFilter = d.toISOString();
    }
    // 'all' → no date filter

    // 1. Total unique visitors
    let visitorsQuery = supabase.from('visitors').select('*', { count: 'exact' });
    if (dateFilter) {
      visitorsQuery = visitorsQuery.gte('last_seen', dateFilter);
    }
    const { count: totalVisitors, data: visitorsData } = await visitorsQuery
      .order('last_seen', { ascending: false });

    // 2. Total page views
    let pvCountQuery = supabase.from('page_views').select('*', { count: 'exact' });
    if (dateFilter) {
      pvCountQuery = pvCountQuery.gte('created_at', dateFilter);
    }
    const { count: totalPageViews } = await pvCountQuery;

    // 3. Today stats
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const { count: todayVisitors } = await supabase
      .from('visitors')
      .select('*', { count: 'exact' })
      .gte('last_seen', todayStart);
    const { count: todayPageViews } = await supabase
      .from('page_views')
      .select('*', { count: 'exact' })
      .gte('created_at', todayStart);

    // 4. Top pages
    let topPagesQuery = supabase.from('page_views').select('page_path, page_title');
    if (dateFilter) {
      topPagesQuery = topPagesQuery.gte('created_at', dateFilter);
    }
    const { data: allPageViews } = await topPagesQuery;

    // Aggregate top pages manually
    const pageMap = new Map<string, { path: string; title: string; views: number; visitors: Set<string> }>();
    if (allPageViews) {
      for (const pv of allPageViews) {
        const key = pv.page_path;
        if (!pageMap.has(key)) {
          pageMap.set(key, { path: key, title: pv.page_title || key, views: 0, visitors: new Set() });
        }
        const entry = pageMap.get(key)!;
        entry.views++;
      }
    }
    const topPages = Array.from(pageMap.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(p => ({ path: p.path, title: p.title, views: p.views }));

    // 5. Recent visitors with their page views
    const recentVisitors = (visitorsData || []).slice(0, 20).map(v => ({
      id: v.id,
      visitor_hash: v.visitor_hash,
      device: v.device,
      browser: v.browser,
      country: v.country,
      first_seen: v.first_seen,
      last_seen: v.last_seen,
    }));

    // Fetch page views for recent visitors
    const visitorIds = recentVisitors.map(v => v.id);
    let visitorPagesQuery = supabase
      .from('page_views')
      .select('visitor_id, page_path, page_title, created_at')
      .in('visitor_id', visitorIds.length > 0 ? visitorIds : ['__none__'])
      .order('created_at', { ascending: false });

    const { data: visitorPages } = await visitorPagesQuery;

    // Group pages by visitor
    const visitorPagesMap = new Map<string, { page_path: string; page_title: string; created_at: string }[]>();
    if (visitorPages) {
      for (const vp of visitorPages) {
        const list = visitorPagesMap.get(vp.visitor_id) || [];
        list.push({ page_path: vp.page_path, page_title: vp.page_title, created_at: vp.created_at });
        visitorPagesMap.set(vp.visitor_id, list);
      }
    }

    const recentVisitorsWithPages = recentVisitors.map(v => ({
      ...v,
      pages: visitorPagesMap.get(v.id) || [],
    }));

    return NextResponse.json({
      totalVisitors: totalVisitors || 0,
      totalPageViews: totalPageViews || 0,
      todayVisitors: todayVisitors || 0,
      todayPageViews: todayPageViews || 0,
      topPages,
      recentVisitors: recentVisitorsWithPages,
    });
  } catch (err) {
    console.error('Analytics API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
