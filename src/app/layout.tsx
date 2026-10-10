import type {Metadata} from 'next';
import {Geist,Geist_Mono} from 'next/font/google';
import '@neondatabase/auth-ui/css';
import './globals.css';
import '@/design/hover.css';
const sans=Geist({subsets:['latin'],variable:'--font-sans'});
const mono=Geist_Mono({subsets:['latin'],variable:'--font-mono'});
export const metadata:Metadata={title:'Tape — Your investing edge',description:'One research workspace for opportunities, smart money, options, news, and portfolio risk.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en" className={`${sans.variable} ${mono.variable} dark`} suppressHydrationWarning><body>{children}</body></html>}
