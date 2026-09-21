import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lessons, totalExercises } from '../src/course';
import { parseProgress, calculateResult, timeLimit } from '../src/progress';

test('combined exercises offer five times the original practice and finish sentences',()=>{
 const originalLengths = [41,39,39,41,43,91,81,101,73,95,85,99,115,88,190];
 for (const [index,lesson] of lessons.entries()) {
  const text=lesson.exercises[2].text;
  assert.ok(text.length >= originalLengths[index]*5, `Lesson ${index+1}: too short`);
  assert.ok(text.length < originalLengths[index]*5+100, `Lesson ${index+1}: excessive length`);
  assert.equal(text,text.trim());
  if(lesson.stage==='De puntjes op de i')assert.ok(text.endsWith('.'));
 }
});

test('every exercise uses only keys introduced so far',()=>{
 const known = new Set(' ');
 for (const [index,lesson] of lessons.entries()) {
  for(const char of lesson.keys)known.add(char);
  for(const exercise of lesson.exercises)for(const char of exercise.text) {
   assert.ok(known.has(char.toLowerCase()), `Lesson ${index+1}: premature character ${char}`);
   if(lesson.stage !== 'De puntjes op de i')assert.equal(char,char.toLowerCase(),'Capitals introduced too early');
  }
 }
 assert.equal([...known].filter(c=>/[a-z]/.test(c)).length,26);
 assert.equal(totalExercises,45);
});
test('split lessons preserve existing progress identities without giving the new lesson a result',()=>{
 assert.equal(lessons[2].keys,'sl');
 assert.equal(lessons[3].keys,'qm');
 assert.equal(lessons[2].id,'lesson-15');
 assert.equal(lessons[3].id,'lesson-3');
 assert.equal(lessons[4].id,'lesson-4');
 assert.equal(lessons.at(-1)?.id,'lesson-14');
 assert.equal(new Set(lessons.map(l=>l.id)).size,lessons.length);
 const saved=parseProgress(JSON.stringify({'lesson-4-0':[calculateResult(100,100,60000)]}));
 assert.equal(saved[`${lessons[4].id}-0`][0].passed,true);
 assert.equal(saved[`${lessons[2].id}-0`],undefined);
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
 assert.equal(calculateResult(100,110,60000).accuracy,90.9);
 assert.equal(calculateResult(100,110,60000).passed,false);
 assert.equal(calculateResult(95,100,60000).passed,true);
 assert.ok(Number.isFinite(calculateResult(1,1,0).wpm));
});
test('upper and lower row introduction isolates each new key with its own home key',()=>{
 const expected: Record<string,string> = {a:'q',e:'d',z:'s',r:'f',i:'k',o:'l',t:'f',u:'j',p:'m',y:'j',v:'f',b:'f',n:'j',w:'s',x:'d',c:'f'};
 for(const lesson of lessons) {
  const groups=lesson.exercises[0].text.split(' ');
  lesson.movements.forEach((m,index)=>{
   assert.equal(m.home,expected[m.key]);
   const isolated=groups.slice(index*8,index*8+8);
   assert.equal(isolated.length,8);
   for(const group of isolated)assert.ok(group===m.home+m.key||group===m.key+m.home);
  });
 }
 assert.deepEqual(lessons[5].exercises[0].text.split(' ').slice(0,8),['qa','aq','qa','aq','qa','aq','qa','aq']);
});
test('both goals must pass, including exact accuracy and time boundaries',()=>{
 assert.equal(calculateResult(95,100,60000,60).passed,true);
 assert.equal(calculateResult(95,100,60001,60).passed,false);
 assert.equal(calculateResult(949,1000,59000,60).passed,false);
 assert.equal(calculateResult(100,100,61000,60).maxSeconds,60);
 assert.equal(timeLimit(100,'De basisrij'),160);
 assert.equal(timeLimit(100,'Woorden bouwen'),130);
 assert.equal(timeLimit(1,'De puntjes op de i'),30);
 const result=calculateResult(100,100,61000,60);
 assert.deepEqual(parseProgress(JSON.stringify({'lesson-1-0':[result]})),{'lesson-1-0':[result]});
});
