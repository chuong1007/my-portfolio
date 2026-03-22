import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Use service-level client for server-side tracking
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

// Parse User-Agent for device and browser info
function parseUserAgent(ua: string) {
  let device = 'Desktop';
  if (/mobile|android|iphone|ipad|tablet/i.test(ua)) {
    device = /tablet|ipad/i.test(ua) ? 'Tablet' : 'Mobile';
  }

  let browser = 'Unknown';
  if (/edg\//i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  return { device, browser };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitor_id, page_path, page_title, referrer } = body;

    if (!page_path) {
      return NextResponse.json({ error: 'page_path is required' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 1. Chống Bot/Crawler cơ bản o Server Side
    const lowerUA = userAgent.toLowerCase();
    const isBot = /bot|crawler|spider|lighthouse|hyperdx|vercel|headless/i.test(lowerUA);
    if (isBot) {
      return NextResponse.json({ ok: true, skipped: "bot_detected" });
    }

    // Skip tracking for admin pages
    if (page_path.startsWith('/admin')) {
      return NextResponse.json({ ok: true, skipped: "admin_page" });
    }

    const supabase = getSupabaseAdmin();

    // 2. Persistence Tracking Logic: Use visitor_id from body
    // If client didn't send ID (old client), fallback to IP-based hash
    let effectiveId = visitor_id;
    
    if (!effectiveId) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';
      const today = new Date().toISOString().split('T')[0];
      const rawHash = `${ip}::${userAgent}::${today}`;
      effectiveId = crypto.createHash('sha256').update(rawHash).digest('hex').substring(0, 16);
    }

    const { device, browser } = parseUserAgent(userAgent);

    // Upsert visitor directly by its ID
    const { data: visitorRecord, error: upsertError } = await supabase
      .from('visitors')
      .upsert({
        id: effectiveId,
        visitor_hash: effectiveId, // Re-use ID as hash if needed for compatibility
        device,
        browser,
        last_seen: new Date().toISOString()
      }, { onConflict: 'id' })
      .select('id')
      .single();

    if (upsertError || !visitorRecord) {
      console.error('Error upserting visitor:', upsertError);
      return NextResponse.json({ error: 'Failed to track visitor' }, { status: 500 });
    }

    const finalVisitorId = visitorRecord.id;

    // Insert page view
    const { error: pvError } = await supabase
      .from('page_views')
      .insert({
        visitor_id: finalVisitorId,
        page_path,
        page_title: page_title || '',
        referrer: referrer || '',
      });

    if (pvError) {
      console.error('Error inserting page_view:', pvError);
      return NextResponse.json({ error: 'Failed to track pageview' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, visitorId: finalVisitorId });
  } catch (err) {
    console.error('Track API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
