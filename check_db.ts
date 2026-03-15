import { createClient } from '@supabase/supabase-js'

const supabaseUrl = ''
const supabaseKey = ''
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data, error } = await supabase
    .from('pages')
    .select('id, slug, title, page_content')
    .eq('slug', 'home')
    .single()
  
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Home Page Data:', JSON.stringify(data, null, 2))
  }
}

check()
