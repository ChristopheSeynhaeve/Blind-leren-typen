import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessons, totalExercises } from '../src/course';
import { parseProgress, calculateResult } from '../src/progress';

test('every exercise uses only keys introduced so far',()=>{
 const known = new Set(' ');
 for (const [index,lesson] of lessons.entries()) {
  for(const char of lesson.keys)known.add(char);
  for(const exercise of lesson.exercises)for(const char of exercise.text) {
   assert.ok(known.has(char.toLowerCase()), `Lesson ${index+1}: premature character ${char}`);
   if(index<12)assert.equal(char,char.toLowerCase(),'Capitals introduced too early');
  }
 }
 assert.equal([...known].filter(c=>/[a-z]/.test(c)).length,26);
 assert.equal(totalExercises,42);
});
test('invalid or corrupt browser storage is handled',()=>{
 assert.deepEqual(parseProgress('{broken'),{});
 assert.deepEqual(parseProgress('null'),{});
 assert.deepEqual(parseProgress('[]'),{});
 assert.deepEqual(parseProgress('{"lesson-1-0":[{"accuracy":200}]}'),{'lesson-1-0':[]});
 const result=calculateResult(100,100,60000);
 assert.deepEqual(parseProgress(JSON.stringify({'lesson-1-0':[result]})),{'lesson-1-0':[result]});
});
test('accuracy and speed include incorrect attempts and enforce completion threshold',()=>{
 assert.equal(calculateResult(100,100,60000).wpm,20);
 assert.equal(calculateResult(100,110,60000).accuracy,91);
 assert.equal(calculateResult(100,110,60000).passed,false);
 assert.equal(calculateResult(95,100,60000).passed,true);
 assert.ok(Number.isFinite(calculateResult(1,1,0).wpm));
});
