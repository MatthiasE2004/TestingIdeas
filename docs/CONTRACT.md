# Course app contract (shared by all content + tool authors)

App = offline HTML/JS in an Android WebView. Two courses, one app. Nothing-OS look: monochrome, dotted, pill buttons,
one red accent (`--red`). Design system: `/home/user/TestingIdeas/app/www/css/app.css` (read it; use its classes/vars only,
add tool-specific CSS inline via a `<style>` element your tool injects, prefixed with your tool id).

Sources (read-only, do not modify):
- PM course text:  `/tmp/claude-0/-home-user-TestingIdeas/5f829c21-dcab-5cfc-b415-a90a75546e9d/scratchpad/src/pm.txt`  (pdftotext -layout; 98 printed pages, "Activity N" blocks, section numbers 1.1 ... 5.3)
- PM PDF itself (for looking at figures): `.../scratchpad/src/pm.pdf` (use Read with `pages`)
- Entrepreneurship course: `.../scratchpad/src/ent.md` (pandoc markdown; Sessions 1-8; quizzes, activities; images as `ent_media/media/imageN.*`)
- Images ALREADY converted and shipped at `/home/user/TestingIdeas/app/www/img/`:
  `pm_p<PDFPAGE>_<n>.jpg` (PM figures, page = PDF page they appeared on) and `ent_<N>.jpg` (N = docx imageN number, in order of appearance in ent.md - grep `imageN` in ent.md to see where each belongs).
  Reference as `"img/ent_12.jpg"`. Look at images (Read tool) before using them so alt text/caption are right. Skip purely decorative/logo images.
- open.edu is NOT reachable from this sandbox, so everything comes from the two files above. Do not invent facts beyond them; you MAY write extra
  quiz questions / activity prompts / model answers that are faithful to the material.

## Content files
Each content author writes ONE JSON file per chapter into `/home/user/TestingIdeas/app/www/content/parts/`:
`pm-<n>.json` (n=1..5, the five numbered sections of the PM course) and `ent-<n>.json` (n=1..8, Sessions 1-8). Valid JSON (validate with `python3 -m json.tool`).

```
{ "id":"pm1", "title":"Conception: 'The journey begins'", "summary":"one sentence", "minutes":25,
  "pages":[ {"id":"pm1-01","title":"What is a project?","blocks":[ ...blocks... ]}, ... ] }
```
Pagination rules (IMPORTANT - user hates long scrolling): one idea per page, normally 60-150 words of text + at most one image/figure,
and at most one interactive block (quiz/activity/tool/flashcards). Phone/tablet viewport ~ one screen. Split every numbered section
(e.g. 1.1) into several pages. Typical chapter = 10-22 pages. Cover EVERYTHING of substance in the source (nothing silently dropped), reworded
into short readable chunks (keep OU wording for definitions; keep all figures/tables/lists/examples/activities/self-check questions/quizzes).
First page of a chapter = intro with learning outcomes; last page = summary (+ chapter quiz of 4-8 questions, one quiz block per page, max 3 questions per page).
Page ids: `<chapterId>-NN`, unique, stable.

Block types (field `t`):
- `{"t":"h","text":""}` small heading inside page
- `{"t":"p","text":""}` paragraph; inline `**bold**` and `*italic*` allowed
- `{"t":"ul","items":[""]}` / `{"t":"ol","items":[""]}`
- `{"t":"img","src":"img/ent_12.jpg","alt":"","caption":""}`
- `{"t":"callout","kind":"key|tip|note","title":"optional","text":""}`  (key = definition/key idea)
- `{"t":"quote","text":"","by":""}`
- `{"t":"table","head":["",""],"rows":[["",""]]}` (max ~4 columns; phones are narrow)
- `{"t":"video","title":"","url":"https://www.youtube.com/watch?v=..." or null,"note":"what the video shows (from the source)"}` - ONLY when the source mentions a video; url only when given in the source
- `{"t":"activity","id":"pm1-a3","title":"Activity 3","prompt":"","hint":"optional","model":"model/discussion answer from the source (or faithful, 2-5 sentences)","points":["key idea 1","key idea 2","key idea 3"]}`
   free-text answer; the app asks the on-device AI (or a keyword fallback) to compare with `points` (3-5 short sentences). Use for every "Activity"/reflection/
   "write down..." item in the source.
- `{"t":"quiz","id":"pm1-q2","q":"","options":["","",""],"answer":1,"explain":"why"}` single choice (answer = index). Multi-select: `"answer":[0,2]` and `"multi":true`.
   Also use `{"t":"tf","id":"..","q":"statement","answer":true,"explain":""}` for true/false. Convert source self-check/quiz questions faithfully, add more where useful. Never put the answer in the question text.
- `{"t":"flash","cards":[{"front":"term","back":"definition"}]}` key terms (3-8 cards)
- `{"t":"tool","tool":"<toolId>","title":"Try it: ...","intro":"1-2 sentences why/how"}` - a page whose main content is an interactive tool (put it alone on its own page after the relevant theory)
Interactive blocks need globally unique `id`s.

## Interactive tool ids (built by the tool authors; content authors just reference them where they fit)
PM course: `stakeholder-grid` (ch1, section 1.2 players in the game), `swot-pest` (ch1, 1.4 two investigative tools - check which tools the text actually names),
`org-objectives` (ch1 1.5 if suitable - SMART objectives checker; only if text supports), `fin-calc` (ch2, 2.3 financial feasibility: payback/ARR/NPV/discounting),
`risk-matrix` (ch2, 2.4 risk), `decision-matrix` (ch3, 3.2 aids to decision making), `lifecycle-sort` (ch4, 4.1 project life cycles),
`pm-sim` (ch4, 4.4 what a PM does - the capstone simulator with stakeholders who have different needs), `method-picker` (ch5, 5.2 development processes: waterfall/phased/prototype/agile).
Entrepreneurship: `idea-lab` (S1/S2 idea generation, SCAMPER), `bmc` (S3 creating value - business model canvas; reused in S8), `persona` (S4 customers & markets),
`value-prop` (S5 value proposition canvas), `breakeven` (S7 financing: start-up costs, break-even, cash runway), `pitch` (S8 elevator pitch coach).
Use at most the tools that fit; a chapter may have 0-2 tool pages. If a tool you want to reference is not in this list, do not invent one.

## Tool authors: API
Create `/home/user/TestingIdeas/app/www/tools/<toolId>.js` (one file may register several tools). Plain ES2017 JS, no libraries, no network, no build step. Pattern:
```
Tools.register('bmc',{ title:'Business Model Canvas', desc:'one line',
  mount:function(el, ctx){ /* build DOM into el with H.h(...) */ } });
```
`el` is an empty container; render responsive UI for a 10-inch tablet (1280x800 dp landscape/portrait) AND a phone (360dp wide).
Min touch target 44px. Use classes from css/app.css (`.tool`, `.card`, `.btn`, `.btn.primary`, `.chip`, `.input`, `.textarea`, `.label`, `.grid`, `.bar`, `.ai-box`...).
Visual language: white rounded cards on grey, black pill buttons, red only for emphasis/warnings, mono uppercase small labels, dotted accents. No emoji spam, no gradients, no shadows.
`ctx`:
- `ctx.load(key?)` -> previously saved object or null; `ctx.save(obj,key?)` persist (call on every change; autosave). The user must be able to leave and resume.
- `ctx.ai.available()` -> bool; `ctx.ai.ask({system,prompt,maxTokens,temperature,onToken}) -> Promise<string>` (small 0.5-2B local model: keep prompts short & explicit,
  ask for <=120 words, ask for plain text or a rigid simple format; never rely on JSON from it without a safe parser + fallback);
  `ctx.ai.feedback({question,answer,points,model,context}) -> Promise<{text,source,covered}>`.
  The AI is OPTIONAL: every tool must be fully usable and give useful rule-based feedback when `!ctx.ai.available()`. Where AI adds value (judging free text, role-playing a stakeholder, critiquing a canvas),
  show an "Ask AI" button only when available, show a streaming/"thinking" state, and handle rejection (`.catch`) gracefully with the rules-based fallback.
- `ctx.complete(score01?)` call once the learner has meaningfully finished (marks the page done).
- `ctx.toast(msg)`.
Test with the harness: `cd /home/user/TestingIdeas/app/www && python3 -m http.server 8801` then open `http://localhost:8801/tool-test.html?tool=<id>` with Playwright
(chromium preinstalled; `require('playwright')` works; viewports 1280x800 and 390x844; take screenshots and LOOK at them (Read the png); check console errors; exercise the main flows with clicks).
Quality bar: this must teach the concept, not be a toy. Real interactivity (drag/tap/sliders/inputs), immediate feedback, a clear goal & scoring or reflection, explanation of "why" in the feedback, reset button, and saved state.

## Output etiquette
Only write your own files. Do not edit css/app.css, js/core.js, js/ai.js, index.html or other authors' files (tell the lead what you need instead). Final reply: <=120 words, list files + anything the lead must know (tool ids used, open issues).
