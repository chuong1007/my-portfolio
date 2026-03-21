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
    const { page_path, page_title, referrer } = body;

    if (!page_path) {
      return NextResponse.json({ error: 'page_path is required' }, { status: 400 });
    }

    // Skip tracking for admin pages
    if (page_path.startsWith('/admin')) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const supabase = getSupabaseAdmin();

    // Create anonymous visitor hash from IP + User-Agent (privacy-friendly)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Daily-rotating hash for privacy (similar to Vercel Analytics)
    const today = new Date().toISOString().split('T')[0];
    const rawHash = `${ip}::${userAgent}::${today}`;
    const visitorHash = crypto.createHash('sha256').update(rawHash).digest('hex').substring(0, 16);

    const { device, browser } = parseUserAgent(userAgent);

    // Upsert visitor
    const { data: existingVisitor } = await supabase
      .from('visitors')
      .select('id')
      .eq('visitor_hash', visitorHash)
      .single();

    let visitorId: string;

    if (existingVisitor) {
      visitorId = existingVisitor.id;
      // Update last_seen
      await supabase
        .from('visitors')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', visitorId);
    } else {
      // Insert new visitor
      const { data: newVisitor, error: insertError } = await supabase
        .from('visitors')
        .insert({
          visitor_hash: visitorHash,
          device,
          browser,
        })
        .select('id')
        .single();

      if (insertError || !newVisitor) {
        console.error('Error inserting visitor:', insertError);
        return NextResponse.json({ error: 'Failed to track visitor' }, { status: 500 });
      }
      visitorId = newVisitor.id;
    }

    // Insert page view
    const { error: pvError } = await supabase
      .from('page_views')
      .insert({
        visitor_id: visitorId,
        page_path,
        page_title: page_title || '',
        referrer: referrer || '',
      });

    if (pvError) {
      console.error('Error inserting page_view:', pvError);
      return NextResponse.json({ error: 'Failed to track pageview' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Track API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
