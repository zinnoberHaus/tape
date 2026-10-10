'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="simple-page"><a className="brand" href="/">Tape</a><h1>We couldn’t open this page.</h1><p>Please retry. Your saved workspace is still in your account.</p><button className="primary" onClick={reset}>Try again</button></main>}
