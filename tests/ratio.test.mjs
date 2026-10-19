import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,next,ratio} from '../scripts/check.mjs';
test('every length-16 binary path has the exact likelihood product at first stop',()=>{
 for(let mask=0;mask<65536;mask++){
  let s=initial(),exponent=0;
  for(let i=0;i<16;i++){
   const hit=Boolean(mask&(1<<i));exponent+=hit?1:-1;s=next(s,hit?'MATCH':'NO_MATCH',16,true);
   assert.deepEqual([ratio(s).numerator,ratio(s).denominator],[3**Math.max(exponent,0),3**Math.max(-exponent,0)]);
   if(s.status!=='OPEN')break;
  }
 }
});
test('UNKNOWN stops without evidence; cap is not a positive boundary',()=>{
 let s=next(initial(),'MATCH',2,true);s=next(s,'UNKNOWN',2,true);
 assert.equal(s.status,'ABSTAINED');assert.equal(s.exponent,1);assert.equal(s.unknowns,1);
 s=next(initial(),'MATCH',2,true);s=next(s,'NO_MATCH',2,true);
 assert.equal(s.status,'CAP_REACHED');assert.deepEqual([ratio(s).numerator,ratio(s).denominator],[1,1]);
});
