# Git Workflow Guide

## Common Commands

### 1. Check Status

```bash
git status
```

Shows which files are modified, staged, or untracked.

### 2. Stage Changes

```bash
# Stage specific file
git add src/components/MyComponent.tsx

# Stage all changes
git add .
```

### 3. Commit Changes

```bash
git commit -m "Brief description of changes"
```

**Good commit messages:**

- `fix: Update Groq model to llama-3.3-70b-versatile`
- `feat: Add natural language input for quick product logging`
- `refactor: Improve data update handlers`
- `docs: Update README with setup instructions`

### 4. Push to Remote

```bash
git push
```

Uploads your commits to the remote repository (GitHub, GitLab, etc.).

### 5. Pull Latest Changes

```bash
git pull
```

Downloads latest changes from remote repository.

---

## Full Workflow

```bash
# 1. Make changes to your files
# 2. Check what changed
git status

# 3. Stage all changes
git add .

# 4. Commit with descriptive message
git commit -m "fix: Update Groq model from llama3-70b-8192 to llama-3.3-70b-versatile"

# 5. Push to remote
git push

# 6. Verify on GitHub/GitLab
```

---

## Commit Message Format

**Type + Description:**

- `fix:` - Bug fixes
- `feat:` - New features
- `refactor:` - Code improvements
- `docs:` - Documentation
- `test:` - Test additions
- `style:` - Formatting only
- `chore:` - Maintenance

**Examples:**

```bash
git commit -m "feat: Implement AI-powered smart suggestions"
git commit -m "fix: Handle consume action in NaturalLanguageLogger"
git commit -m "refactor: Create addProductDirectly handler"
```

---

## Useful Tips

```bash
# View recent commits
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# See diff before committing
git diff

# Commit only specific changes (interactive)
git add -p
```

---

## For Your Project

**Recent commits made:**

1. ✅ Model update to llama-3.3-70b-versatile
2. ✅ Fix NaturalLanguageLogger data handlers
3. ✅ Add addProductDirectly function

**Before next commits, run:**

```bash
npm run build  # Make sure no errors
git status     # Check what changed
git add .      # Stage all
git commit -m "Your message"
git push       # Push to remote
```
