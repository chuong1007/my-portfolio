export const dynamic = 'force-dynamic';
export default function Page() { return <div>{Object.keys(process.env).join(', ')}</div>; }
