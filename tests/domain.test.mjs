import test from 'node:test';
import assert from 'node:assert/strict';
import { minor,equalSplit,balances,settlements,tripSchema,isoDate,sortItems } from '../src/services/travel.ts';
import { clusterPhotos,distanceKm } from '../src/features/memories/clustering.ts';
import { suggestionSchema } from '../src/features/assistant/schema.ts';
test('money parsing preserves minor units and rejects float/trailing garbage',()=>{
 assert.equal(minor('15.09'),1509);assert.equal(minor('0.01'),1);
 for(const value of ['1.009','-1','NaN','1x','1e3'])assert.throws(()=>minor(value));
});
test('splits have stable remainders and balances/settlements reconcile',()=>{
 const split=equalSplit(100,['c','a','b']);assert.deepEqual(split,[{user_id:'a',share_minor:34},{user_id:'b',share_minor:33},{user_id:'c',share_minor:33}]);
 const balance=balances([{paid_by:'c',amount_minor:100}],split);
 assert.equal(Object.values(balance).reduce((a,b)=>a+b,0),0);
 const transfers=settlements(balance);for(const t of transfers){balance[t.from]+=t.amount;balance[t.to]-=t.amount;}
 assert.deepEqual(Object.values(balance),[0,0,0]);assert.throws(()=>equalSplit(100,['a','a']));
});
test('calendar validation rejects impossible/reversed/excessive ranges',()=>{
 assert.equal(isoDate.safeParse('2026-02-30').success,false);
 const valid={name:'Go',destination_id:'00000000-0000-4000-8000-000000000001',description:'',start_date:'2026-12-12',end_date:'2026-12-17',currency:'INR',target_budget_minor:null,budget_scope:'per_person'};
 assert.equal(tripSchema.safeParse(valid).success,true);
 assert.equal(tripSchema.safeParse({...valid,end_date:'2026-12-01'}).success,false);
 assert.equal(tripSchema.safeParse({...valid,end_date:'2027-12-01'}).success,false);
});
test('gallery separates unknown location, distant points and different days',()=>{
 const photo=(id,date,latitude,longitude)=>({id,uri:'file://photo',capturedAt:Date.parse(date),latitude,longitude});
 const groups=clusterPhotos([photo('a','2026-01-01',10,76),photo('b','2026-01-01',10.001,76),photo('c','2026-01-01',null,null),photo('d','2026-01-02',10,76),photo('e','2026-01-01',20,76)]);
 assert.equal(groups.length,4);assert.equal(groups[0].photos.length,2);assert.ok(distanceKm({latitude:10,longitude:76},{latitude:10.001,longitude:76})<1);
});
test('AI proposals reject missing/negative money and too many items',()=>{
 const item={day_date:'2026-12-12',title:'A walk',description:'Demo',category:'nature',estimated_cost_minor:0};
 const draft={title:'A day',summary:'Demo',items:[item],warnings:[]};
 assert.equal(suggestionSchema.safeParse(draft).success,true);
 assert.equal(suggestionSchema.safeParse({...draft,items:[{...item,estimated_cost_minor:-1}]}).success,false);
 assert.equal(suggestionSchema.safeParse({...draft,items:Array(31).fill(item)}).success,false);
});
test('itinerary ordering is deterministic even when two positions match',()=>{
 const base={day_date:'2026-01-01',sort_order:0};assert.deepEqual(sortItems([{...base,id:'b'},{...base,id:'a'}]).map(i=>i.id),['a','b']);
});
