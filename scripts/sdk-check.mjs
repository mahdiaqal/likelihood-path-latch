import assert from 'node:assert/strict';
import {abi} from 'genlayer-js';
const {calldata}=abi;
for(const [method,args] of [
 ['create_test',['demo','The text asks its recipient to reveal a password to another person.','mahdiaqal/likelihood-path-latch/'+'a'.repeat(40)+'/examples/upper.json','b'.repeat(64)]],
 ['advance',['a'.repeat(64),0]],['get_test',['a'.repeat(64)]],['get_step',['a'.repeat(64),0]],['likelihood_ratio',['a'.repeat(64),'b'.repeat(64)]]]){
 const bytes=calldata.encode(calldata.makeCalldataObject(method,args,{}));assert.deepEqual(calldata.encode(calldata.decode(bytes)),bytes);
}
console.log('5 SDK calldata roundtrips passed');
