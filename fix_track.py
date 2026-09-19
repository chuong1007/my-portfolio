with open('src/app/api/track/route.ts', 'r') as f:
    content = f.read()

# Replace the body extraction and validation
old_code = """
    const body = await request.json();
    const { visitor_id, page_path, page_title, referrer } = body;

    if (!page_path) {
      return NextResponse.json({ error: 'page_path is required' }, { status: 400 });
    }
"""

new_code = """
    const body = await request.json();
    let { visitor_id, page_path, page_title, referrer } = body;

    if (!page_path || typeof page_path !== 'string') {
      return NextResponse.json({ error: 'page_path is required' }, { status: 400 });
    }

    // Input Validation & Truncation (Security)
    page_path = page_path.substring(0, 255);
    page_title = typeof page_title === 'string' ? page_title.substring(0, 255) : '';
    referrer = typeof referrer === 'string' ? referrer.substring(0, 255) : '';
    visitor_id = typeof visitor_id === 'string' ? visitor_id.substring(0, 100) : undefined;
"""

content = content.replace(old_code.strip(), new_code.strip())

with open('src/app/api/track/route.ts', 'w') as f:
    f.write(content)
