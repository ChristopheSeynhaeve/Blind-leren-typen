import { test, expect } from '@playwright/test';
import { lessons } from '../src/course';

test('complete, persist, repeat and filter exercises', async ({ page }) => {
 await page.goto('http://localhost:5173');
 await expect(page.getByRole('heading',{name:'Letter voor letter vooruit.'})).toBeVisible();
 await page.getByRole('button',{name:'Start je eerste oefening'}).click();
 await page.locator('#typing-input').pressSequentially(lessons[0].exercises[0].text);
 await expect(page.getByRole('heading',{name:'Mooi gedaan!'})).toBeVisible();
 await expect(page.locator('.result-stats')).toContainText('100%');
 await page.reload();
 await expect(page.locator('.small-progress')).toContainText('1 van 42');
 await page.locator('[data-lesson="0"]').click();
 await expect(page.locator('[data-start="0"]')).toContainText('100%');
 await page.locator('[data-start="0"]').click();
 await page.locator('#typing-input').pressSequentially(lessons[0].exercises[0].text);
 await page.getByRole('button',{name:'Volgende oefening'}).click();
 await page.locator('#typing-input').pressSequentially('fff jjj fjf jfj ffj jjf');
 await page.getByRole('button',{name:'Volgende oefening'}).click();
 await page.locator('#typing-input').pressSequentially('fj jf ff jj fj jf fff jjj fjf jfj ffj jjf');
 await page.getByRole('button',{name:'Terug naar mijn lessen'}).click();
 await page.getByRole('button',{name:'Afgerond',exact:true}).click();
 await expect(page.locator('.lesson-row')).toHaveCount(1);
 await page.getByRole('button',{name:'Mijn voortgang'}).click();
 await expect(page.locator('.overview-card').first()).toContainText('3 / 42');
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
