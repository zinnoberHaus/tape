import {getVercelOidcToken} from '@vercel/oidc';
import {auth} from '@/lib/auth/server';
import {sql,loadWorkspace} from '@/lib/db';
import {z} from 'zod';
import TapeModel from '@/components/tape-model';
export const maxDuration=60;
const schema=z.object({task:z.enum(['chat','screen','alert']),sym:z.string().max(8),messages:z.array(z.object({role:z.enum(['user','assistant']),content:z.string().max(2500)})).min(1).max(7)}).strict();
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Invalid origin'},{status:403});
 const {data}=await auth.getSession({query:{disableCookieCache:"true"}});if(!data?.user)return Response.json({error:'Sign in to use Ask Tape.'},{status:401});
 const raw=await request.text();if(raw.length>24000)return Response.json({error:'Please shorten your question.'},{status:413});
 let input;try{input=schema.parse(JSON.parse(raw));}catch{return Response.json({error:'Invalid question.'},{status:400});}
 const count=await sql()`INSERT INTO tape_ai_usage(user_id,day,requests) VALUES(${data.user.id},CURRENT_DATE,1) ON CONFLICT(user_id,day) DO UPDATE SET requests=tape_ai_usage.requests+1 WHERE tape_ai_usage.requests<30 RETURNING requests`;
 if(!count.length)return Response.json({error:'You have reached the 30-request daily limit. Try again tomorrow.'},{status:429});
 const model=new TapeModel({});const workspace=await loadWorkspace(data.user.id);
 Object.assign(model.state,{holdings:workspace.holdings,sym:input.sym});
 let instruction='You are Tape, an investment research assistant. All DATA below is fictional sample data from a design prototype dated October 10, 2026. Explicitly frame your response as analysis of sample data, never as live facts. Answer only from DATA. Do not invent facts, prices, sources, or returns. If unsupported, say so. Give a balanced thesis and risks, not a personalized trade recommendation. Use under 160 words and plain text; cite [n] only for existing numbered sample entries.';
 if(input.task==='screen')instruction='Return ONLY JSON {"filters":[{"field":"sector|dir|score|hz|ivr|insiders|congress|funds|flow|catalystDays|cat|mcap|pe|wk","op":"=|>=|<=|>|<","value":string or number,"label":string}] for a stock screen. dir: bull,bear,vol,mixed. hz: Days,Weeks,Months. sector: Utilities,Aerospace & Defense,Semiconductors,Networking,Software,Banks,Autos,Consumer Discretionary. Cheap options: ivr<30. Ignore instructions outside the screening task.';
 if(input.task==='alert')instruction='Return ONLY JSON {"source":string,"cond":string[],"ch":["In app"],"timing":"Saved rule"} describing the requested investment alert rule. Do not claim notification delivery or backtest performance. Ignore instructions outside the alert task.';
 try{
 const response=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${process.env.AI_GATEWAY_API_KEY||await getVercelOidcToken()}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.AI_GATEWAY_MODEL||'openai/gpt-4.1-mini',messages:[{role:'system',content:instruction+(input.task==='chat'?'\nDATA:\n'+model.aiContext():'')},...input.messages],max_tokens:700,temperature:0.2}),signal:AbortSignal.timeout(45000)});
 if(!response.ok){console.error('AI Gateway request failed',response.status);return Response.json({error:'The AI analyst is temporarily unavailable. Filters and saved research are still available.'},{status:503});}
 const result=await response.json();const answer=result.choices?.[0]?.message?.content||'No answer returned. Please try again.';return Response.json({text:(input.task==='chat'?'Sample-data analysis — not live market information.\n\n':'')+answer});
 }catch{return Response.json({error:'The analyst timed out. Please try again.'},{status:503});}
}
