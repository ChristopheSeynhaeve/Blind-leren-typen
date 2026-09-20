import { test, expect } from '@playwright/test';
import { lessons } from '../src/course';
import { STORAGE_KEY, calculateResult, timeLimit } from '../src/progress';

test('missed time goal recommends retry but allows continuing', async ({page})=>{
 await page.clock.install();
 await page.goto('http://localhost:5173');
 await page.getByRole('button',{name:'Start je eerste oefening'}).click();
 const text=lessons[0].exercises[0].text;
 await page.locator('#typing-input').pressSequentially(text[0]);
 await page.clock.runFor((timeLimit(text.length,lessons[0].stage)+1)*1000);
 await expect(page.locator('#time-feedback')).toContainText('Tijdslimiet overschreden');
 await page.locator('#typing-input').pressSequentially(text.slice(1));
 await expect(page.getByRole('heading',{name:'Nog even oefenen'})).toBeVisible();
 await expect(page.locator('.goal-met')).toContainText('Nauwkeurigheid');
 await expect(page.locator('.goal-missed')).toContainText('Tijd:');
 await expect(page.locator('#restart')).toHaveClass('primary');
 await expect(page.locator('#next')).toHaveClass('secondary');
 await page.getByRole('button',{name:'Terug naar mijn lessen'}).click();
 await expect(page.locator('[data-start="0"] .retry-status')).toContainText('Nog niet behaald');
 await page.locator('[data-start="0"]').click();
 await page.locator('#typing-input').pressSequentially('xxxxxxxxxx'+text);
 await expect(page.locator('.goal-missed')).toContainText('Nauwkeurigheid');
 await page.getByRole('button',{name:'Volgende oefening'}).click();
 await expect(page.getByRole('heading',{name:'Vind je ritme'})).toBeVisible();
});

test('new row exercises explain the finger and isolate Q-A first',async({page})=>{
 await page.goto('http://localhost:5173');
 await page.locator('[data-lesson="5"]').click();
 await page.locator('[data-start="0"]').click();
 await expect(page.locator('.movement-guide')).toContainText('Q ↔ A');
 await expect(page.locator('.movement-guide')).toContainText('linkerpink');
 await expect(page.locator('#typing-text')).toContainText('qa aq qa aq qa aq qa aq de ed');
});

test('split lesson order, saved lesson history and final navigation', async ({ page }) => {
 await page.goto('http://localhost:5173');
 await page.evaluate(({key, result}) => localStorage.setItem(key, JSON.stringify({'lesson-4-0':[result]})), {key: STORAGE_KEY, result:calculateResult(100,100,60000)});
 await page.reload();
 await expect(page.locator('.nav-count')).toHaveText('15');
 await expect(page.locator('[data-lesson="2"]')).toContainText('De ringvingers');
 await expect(page.locator('[data-lesson="3"]')).toContainText('De pinken');
 await page.getByRole('button',{name:'Mijn voortgang'}).click();
 await expect(page.locator('tbody')).toContainText('Naar het midden');
 await page.getByRole('button',{name:'Mijn lessen'}).click();
 await page.locator('[data-lesson="14"]').click();
 await page.locator('[data-start="2"]').click();
 await expect(page.locator('.exercise-header')).toContainText('Les 15 van 15');
 await page.locator('#typing-input').pressSequentially(lessons[14].exercises[2].text);
 await page.getByRole('button',{name:'Naar je voortgang'}).click();
 await expect(page.getByRole('heading',{name:'Jouw vooruitgang.'})).toBeVisible();
});

test('complete, persist, repeat and filter exercises', async ({ page }) => {
 await page.goto('http://localhost:5173');
 await expect(page.getByRole('heading',{name:'Letter voor letter vooruit.'})).toBeVisible();
 await page.getByRole('button',{name:'Start je eerste oefening'}).click();
 await page.locator('#typing-input').pressSequentially(lessons[0].exercises[0].text);
 await expect(page.getByRole('heading',{name:'Mooi gedaan!'})).toBeVisible();
 await expect(page.locator('.result-stats')).toContainText('100%');
 await page.reload();
 await expect(page.locator('.small-progress')).toContainText('1 van 45');
 await page.locator('[data-lesson="0"]').click();
 await expect(page.locator('[data-start="0"]')).toContainText('100%');
 await page.locator('[data-start="0"]').click();
 await page.locator('#typing-input').pressSequentially(lessons[0].exercises[0].text);
 await page.getByRole('button',{name:'Volgende oefening'}).click();
 await page.locator('#typing-input').pressSequentially(lessons[0].exercises[1].text);
 await page.getByRole('button',{name:'Volgende oefening'}).click();
 await page.locator('#typing-input').pressSequentially('fj jf ff jj fj jf fff jjj fjf jfj ffj jjf');
 await page.getByRole('button',{name:'Terug naar mijn lessen'}).click();
 await page.getByRole('button',{name:'Afgerond',exact:true}).click();
 await expect(page.locator('.lesson-row')).toHaveCount(1);
 await page.getByRole('button',{name:'Mijn voortgang'}).click();
 await expect(page.locator('.overview-card').first()).toContainText('3 / 45');
});

test('incorrect attempt, pause, reset and mobile layout',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('http://localhost:5173');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
 await page.getByRole('button',{name:'Start je eerste oefening'}).click();
 await page.locator('#typing-input').pressSequentially('x');
 await expect(page.locator('#character-count')).toHaveText(`0 / ${lessons[0].exercises[0].text.length}`);
 await expect(page.locator('.incorrect')).toHaveCount(1);
 await page.locator('#typing-input').evaluate((el:HTMLTextAreaElement)=>el.blur());
 await expect(page.locator('#input-help')).toContainText('Gepauzeerd');
 await page.getByRole('button',{name:'Opnieuw',exact:true}).click();
 await expect(page.locator('#live-accuracy')).toHaveText('100%');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
