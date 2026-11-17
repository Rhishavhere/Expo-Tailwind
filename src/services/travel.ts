import { z } from 'zod';
import type { Expense, Split, Trip, Item } from '@/src/types/database';
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD.').refine(v => { const d = new Date(v + 'T00:00:00Z'); return !Number.isNaN(+d) && d.toISOString().slice(0,10)===v; }, 'Enter a real date.');
export function daysBetween(start: string, end: string) {
  const days: string[] = [];
  for (let d = new Date(start + 'T00:00:00Z'); d <= new Date(end + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate()+1)) { days.push(d.toISOString().slice(0,10)); if (days.length>61) break; }
  return days;
}
export const tripSchema = z.object({
  name: z.string().trim().min(2).max(80), destination_id: z.uuid(), description: z.string().max(1000),
  start_date: isoDate, end_date: isoDate, currency: z.enum(['INR','USD','EUR','GBP']),
  target_budget_minor: z.number().int().nonnegative().max(100000000000).nullable(),
  budget_scope: z.enum(['per_person','group_total']),
}).refine(v => v.end_date>=v.start_date && daysBetween(v.start_date,v.end_date).length<=61, { message:'Use 1–61 days, with end date after start date.', path:['end_date'] });
export const itemSchema = z.object({
  title:z.string().trim().min(1).max(120), description:z.string().max(2000), day_date:isoDate,
  category:z.string().min(1).max(40), start_time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM.').nullable(),
  end_time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM.').nullable(),
  estimated_cost_minor:z.number().int().nonnegative().max(100000000000),
}).refine(v=>!v.start_time || !v.end_time || v.end_time>=v.start_time,{message:'End time must follow start time.',path:['end_time']});
export function minor(value: string): number {
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) throw new Error('Enter an amount with at most two decimal places.');
  const [whole, fraction=''] = value.trim().split('.');
  const amount=Number(whole)*100+Number(fraction.padEnd(2,'0'));
  if (!Number.isSafeInteger(amount) || amount>100000000000) throw new Error('Amount is too large.');
  return amount;
}
export function money(amount: number, currency='INR') { return new Intl.NumberFormat('en-IN',{ style:'currency', currency,maximumFractionDigits:2 }).format(amount/100); }
export function equalSplit(amount:number, users:string[]) {
  if (!Number.isSafeInteger(amount) || amount<=0 || !users.length || new Set(users).size!==users.length) throw new Error('Invalid expense split');
  const sorted=[...users].sort(); return sorted.map((user_id,i)=>({user_id,share_minor:Math.floor(amount/sorted.length)+(i<amount%sorted.length?1:0)}));
}
export function balances(expenses:Expense[],splits:Split[]) {
  const result:Record<string,number>={};
  for (const e of expenses) result[e.paid_by]=(result[e.paid_by]??0)+e.amount_minor;
  for (const s of splits) result[s.user_id]=(result[s.user_id]??0)-s.share_minor;
  return result;
}
export function settlements(balance:Record<string,number>) {
  const debt=Object.entries(balance).filter(([,n])=>n<0).map(([id,n])=>({id,amount:-n}));
  const credit=Object.entries(balance).filter(([,n])=>n>0).map(([id,n])=>({id,amount:n}));
  const result:{from:string;to:string;amount:number}[]=[];
  for(const d of debt) for(const c of credit) { const amount=Math.min(d.amount,c.amount); if(amount){result.push({from:d.id,to:c.id,amount});d.amount-=amount;c.amount-=amount;} }
  return result;
}
export function tripStatus(trip:Trip,today=new Date().toISOString().slice(0,10)) { return ['draft','archived'].includes(trip.status)?trip.status:today<trip.start_date?'upcoming':today>trip.end_date?'completed':'ongoing'; }
export function sortItems(items:Item[]) { return [...items].sort((a,b)=>a.day_date.localeCompare(b.day_date)||a.sort_order-b.sort_order||a.id.localeCompare(b.id)); }
