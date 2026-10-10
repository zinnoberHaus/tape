import {z} from 'zod';
export const symbols=['VST','LMT','CEG','NVDA','CVNA','ANET','RTX','GD','JPM','NRG','AMD','TSLA','PLTR','QQQ','SMH','SPY','XLU'] as const;
const symbol=z.enum(symbols);
const flags=z.partialRecord(symbol,z.union([z.boolean(),z.literal(0),z.literal(1)]));
export const workspaceSchema=z.object({
  watched:flags.optional(),tracked:flags.optional(),
  follow:z.record(z.string().max(100),z.boolean()).refine(v=>Object.keys(v).length<=100).optional(),
  alList:z.array(z.object({name:z.string().min(1).max(500),src:z.string().max(150),ch:z.array(z.string().max(20)).max(3),last:z.string().max(100),on:z.boolean()})).max(50).optional(),
  holdings:z.array(z.tuple([symbol,z.number().positive().max(1e9),z.number().positive().max(1e9)])).min(1).max(100).optional(),
  onboarded:z.boolean().optional(),
  horizon:z.enum(['Days','Weeks','Months']).optional(),
}).strict();
export type Workspace=z.infer<typeof workspaceSchema>;
export function parseHoldings(text:string):Workspace['holdings'] {
  const lines=text.trim().split(/[\n;]+/).filter(Boolean);
  const rows=lines.filter((s,i)=>!(i===0 && /^\s*(symbol|ticker)\s*,/i.test(s))).map(line=>{
    const parts=line.trim().toUpperCase().replace(/\s*@\s*/g,',').split(/[,\s]+/).filter(Boolean);
    if(parts.length!==3)throw new Error('Use one position per line: ticker, shares, average cost.');
    return [parts[0],Number(parts[1]),Number(parts[2])];
  });
  const parsed=workspaceSchema.shape.holdings.safeParse(rows);
  if(!parsed.success)throw new Error('Use supported tickers with positive shares and average cost.');
  if(new Set(rows.map(r=>r[0])).size!==rows.length)throw new Error('Include each ticker only once.');
  return parsed.data;
}
