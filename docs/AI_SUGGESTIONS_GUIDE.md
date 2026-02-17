# 🤖 AI Smart Insights - Human-in-the-Loop Implementation

## Overview

The Smart Household OS now includes **human-in-the-loop AI suggestions**. This means:

✅ AI analyzes your data
✅ AI proposes suggestions  
✅ **You decide what to do**
✅ System only acts on your approval

**Why this architecture?**

- You maintain control and authority
- System remains deterministic and debuggable
- You can reject bad suggestions
- AI learns from your feedback over time

---

## Architecture

### The Suggestion Lifecycle

```
1. AI Analyzes Data
   ↓
2. AI Generates Suggestions (with reasoning)
   ↓
3. User Reviews Suggestions
   ↓
4. User Accepts/Rejects/Ignores
   ↓
5. If Accepted: System applies changes
   ↓
6. Feedback logged → AI learns
```

### Key Components

#### SuggestionsService (`services/suggestionsService.ts`)

- **Connects to OpenAI Claude API**
- Analyzes:
  - Low stock items
  - Expiring products
  - Consumption patterns
  - Meal ideas from available ingredients
  - Chore optimization
- Returns suggestions with reasoning and confidence scores

#### SuggestionsPanel (`components/SuggestionsPanel.tsx`)

- **User-facing interface**
- Displays AI suggestions
- User controls: Accept / Reject / Ignore
- Shows confidence level (0-100%)
- Explains AI reasoning
- No auto-modifications visible to user

#### Feedback Logging

- Every Accept/Reject/Ignore is logged
- Stored in localStorage (100 most recent)
- Can be used to improve future suggestions

---

## Setup

### 1. Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key

### 2. Configure Environment

Create `.env.local` in your project root:

```bash
VITE_OPENAI_API_KEY=sk-your-actual-key-here
```

Or use the template:

```bash
cp .env.local.example .env.local
# Then edit and add your real API key
```

### 3. Restart Dev Server

```bash
npm run dev
```

---

## How to Use

### Viewing Suggestions

1. Click the **🤖 AI Smart** tab in the main navigation
2. Click **🔄 Refresh Insights** to generate new suggestions
3. Each suggestion shows:
   - **Title**: What's the suggestion?
   - **Description**: What should you do?
   - **Reasoning**: Why did AI suggest this?
   - **Confidence**: How sure is the AI? (0-100%)

### Responding to Suggestions

For each suggestion, you have three options:

#### ✓ Accept & Apply

- AI-suggested action is implemented
- Example: Low stock item → Added to shopping list
- Example: Expiring item → Marked for priority use
- Database updated automatically
- Feedback logged for AI improvement

#### ✕ Not Helpful

- Tells AI this suggestion wasn't useful
- Database NOT changed
- Feedback logged (helps AI improve)
- Suggestion removed from view

#### ⊘ Ignore

- You'll see this suggestion again on refresh
- Feedback logged as "ignored"
- Doesn't affect database

---

## Suggestion Types

### 1. 📦 Low Stock Alert

**When:** Product quantity drops below minimum stock  
**Suggestion:** Add to shopping list  
**Action:** If accepted → toBuy flag set to true

```
"Milk is running low (1L left, min: 2L). Add to shopping?"
Why: Based on your minimum stock threshold
Confidence: 95%
```

### 2. ⏰ Expiration Warning

**When:** Product expiring within 7 days  
**Suggestion:** Use priority or prep recipes  
**Action:** If accepted → Mark for priority use

```
"Spinach expires in 3 days. Make a salad?"
Why: You have eggs, cheese, and other ingredients for omelette
Confidence: 78%
```

### 3. 🍽️ Meal Ideas

**When:** You have ingredients that work well together  
**Suggestion:** Suggested meal combinations  
**Action:** Informational (you decide to cook)

```
"You have eggs, milk, cheese. Make an omelette?"
Why: These ingredients are on-hand and complementary
Confidence: 82%
```

### 4. 📈 Consumption Spike

**When:** Usage of a product suddenly increases  
**Suggestion:** Adjust minimum stock or check for issues  
**Action:** Informational (you review and adjust)

```
"Detergent usage up 50% this month. Adjust min stock?"
Why: Last month: 2L consumed, this month: 3L consumed
Confidence: 88%
```

### 5. 🧹 Chore Optimization

**When:** Chore patterns are inefficient  
**Suggestion:** Suggest schedule or responsibility changes  
**Action:** You decide if changes are needed

```
"Bathroom cleaning skipped 3x lately. Need help?"
Why: Task marked 'Done' only 2 of last 8 scheduled times
Confidence: 71%
```

---

## Feedback Tracking

### What Gets Logged?

Every suggestion response:

```json
{
  "suggestionId": "sugg-1234567890-0",
  "type": "low-stock",
  "feedback": "accepted",
  "confidence": 92,
  "timestamp": 1708017600000
}
```

### Storage

- Stored in `localStorage` under `suggestionFeedback` key
- Keeps last 100 entries
- Can be exported for analysis

### Retrieve Feedback Log

In browser console:

```javascript
JSON.parse(localStorage.getItem("suggestionFeedback"));
```

### Future Improvements

- Export feedback to Supabase for better ML training
- Analyze acceptance rates by suggestion type
- Improve confidence calibration over time

---

## API Costs

### OpenAI Pricing (as of Feb 2026)

**Claude 3.5 Sonnet** (used for suggestions):

- Input: $3 per million tokens
- Output: $15 per million tokens

### Cost Estimation

**Typical suggestion generation:**

- Input: ~500 tokens
- Output: ~200 tokens
- **Cost: ~$0.003 per generation** (less than 1¢)

**Recommendations:**

- Refresh suggestions sparingly (not more than once per minute)
- Consider batch generating for multiple users
- Monitor your API usage at [platform.openai.com/usage](https://platform.openai.com/usage)

---

## Troubleshooting

### "Setup needed: Add your OpenAI API key"

**Solution:**

1. Create `.env.local` file in project root
2. Add: `VITE_OPENAI_API_KEY=sk-your-key-here`
3. Restart dev server: `npm run dev`

### "Failed to generate suggestions"

**Check:**

1. ✓ API key is valid (test at platform.openai.com)
2. ✓ API key has sufficient credits
3. ✓ Network connection is active
4. ✓ Check browser console for detailed error

**Test API key:**

```javascript
// In browser console
fetch("https://api.openai.com/v1/models", {
  headers: { Authorization: "Bearer sk-your-key" },
})
  .then((r) => r.json())
  .then(console.log);
```

### Suggestions taking too long

**Possible reasons:**

- API rate limit (wait a minute before retrying)
- Slow network (check internet connection)
- Large dataset (too many products/chores)

**Solution:** OpenAI API has built-in rate limits. Wait before requesting new suggestions.

---

## Advanced: Customizing Suggestions

### Modify Suggestion Generation

Edit `services/suggestionsService.ts`:

```typescript
// Change the prompt to focus on different areas
const prompt = `You are a smart home assistant...
// Add your custom instructions here
`;
```

### Change AI Model

```typescript
// In suggestionsService.ts
const message = await openai.messages.create({
  model: "claude-3-5-sonnet-20241022",  // ← Change this
  // Use: "claude-3-opus-20250805" for more powerful/expensive
  // Or: "claude-3-haiku-20250307" for faster/cheaper
  ...
});
```

### Filter Suggestion Types

In `SuggestionsPanel.tsx`, before returning suggestions:

```typescript
// Only show high-confidence suggestions
.filter(s => s.confidence >= 80)

// Only show specific types
.filter(s => ['low-stock', 'expiration-warning'].includes(s.type))
```

---

## Best Practices

### For Users

✅ **DO:**

- Review reasoning before accepting
- Start with lower confidence suggestions to see how good AI is
- Reject clearly wrong suggestions (helps AI learn)
- Check confidence levels

❌ **DON'T:**

- Accept all suggestions blindly
- Ignore feedback - it trains the system
- Expect 100% accuracy (AI is assistive, not authoritative)

### For Developers

✅ **DO:**

- Keep suggestions informational when possible
- Only apply data mutations on explicit accept
- Log all feedback for improvement
- Version your prompt changes

❌ **DON'T:**

- Auto-apply suggestions without user review
- Modify sensitive data based on AI suggestions
- Ignore low acceptance rates (indicates bad suggestions)

---

## Security Considerations

### API Key Safety

⚠️ **IMPORTANT:** Never commit `.env.local` to git

```bash
# .gitignore should include:
.env.local
.env.*.local
```

Your API key appears in:

1. Browser's `import.meta.env` (visible in client-side code)
2. Request headers to OpenAI API

**For production:**

- Use a backend proxy to hide API keys
- Implement rate limiting per user
- Monitor for unusual API usage

### Data Privacy

- Suggestions are generated server-side (at OpenAI)
- Your household data sent to OpenAI for analysis
- OpenAI's privacy policy applies
- Consider: Do you want your product/chore data sent to OpenAI?

---

## Future Enhancements

- [ ] Batch suggestion generation for multiple households
- [ ] Learn user preferences and improve confidence calibration
- [ ] Support multiple AI models (switch between Claude, GPT-4, etc.)
- [ ] Real-time suggestions based on consumption patterns
- [ ] Multi-language suggestions (Macedonian support)
- [ ] Family role-based suggestions (child-safe recommendations)
- [ ] Integration with recipe APIs for meal planning
- [ ] Predictive ordering based on consumption history

---

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review browser console for errors
3. Test API key independently
4. Check OpenAI platform status page

---

**Happy suggesting! 🎯**
