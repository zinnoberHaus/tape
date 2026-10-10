import AuthScreen from '@/components/auth-screen';
import Link from 'next/link';
import {notFound} from 'next/navigation';
export default async function AuthPage({params}:{params:Promise<{path:string}>}){
 const {path}=await params;
 if(!['sign-in','sign-up','sign-out','forgot-password','reset-password','verify-email','callback','email-otp','magic-link'].includes(path))notFound();
 return <main className="auth-layout"><Link href="/" className="brand"><span>T</span>Tape</Link><div className="auth-grid"><section><p className="subtle">A clearer read on your next move.</p><h1>All your signals.<br/>One conviction.</h1><p>Build a research workspace that connects the news, the money, and the risks behind every opportunity.</p><Link href="/demo" className="text-link">Explore the demo first →</Link></section><AuthScreen path={path}/></div></main>
}
