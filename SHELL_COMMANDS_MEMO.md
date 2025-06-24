# Shell Commands Reference - Values.md Development Session

This memo documents the shell commands used during debugging and fixing the results page issues in the values.md project.

## 📋 Table of Contents
1. [Git Operations](#git-operations)
2. [Build & Development](#build--development)
3. [File System Operations](#file-system-operations)
4. [Network Testing](#network-testing)
5. [GitHub CLI](#github-cli)
6. [Deployment Verification](#deployment-verification)

## 🔧 Git Operations

### Checking Repository Status
```bash
git status
```
**Purpose**: Shows current branch, modified files, staged changes, and untracked files
**When to use**: Start of any development session to understand current state

### Viewing Changes
```bash
git diff
```
**Purpose**: Shows unstaged changes in working directory
**When to use**: Review modifications before staging them

```bash
git diff --staged
```
**Purpose**: Shows staged changes ready for commit
**When to use**: Review what will be included in the next commit

### Commit History
```bash
git log --oneline -5
```
**Purpose**: Shows last 5 commits in compact format
**When to use**: Review recent development history and commit messages

### Staging and Committing
```bash
git add src/app/api/generate-values/route.ts src/app/results/page.tsx
```
**Purpose**: Stages specific files for commit
**When to use**: Selective staging when you want to commit only certain changes

```bash
git commit -m "$(cat <<'EOF'
Fix results page API response format and navigation links

- Fix API response format mismatch in /api/generate-values route
- Add detailedAnalysis and domainPreferences to API response 
- Fix broken navigation links (/contribute → /research, /explore → /)
- Improve error handling and data validation in results page
- Ensure compatibility between API response and frontend expectations

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```
**Purpose**: Creates commit with multi-line message using heredoc
**When to use**: Detailed commit messages that explain the why and what of changes

### Pushing Changes
```bash
git push origin main
```
**Purpose**: Pushes local commits to remote repository
**When to use**: Share your changes and trigger deployment workflows

## ⚡ Build & Development

### Development Server
```bash
npm run dev
```
**Purpose**: Starts Next.js development server with hot reloading
**When to use**: Local development and testing

```bash
npm run dev --turbopack
```
**Purpose**: Starts dev server with Turbopack for faster builds
**When to use**: When you need faster compilation during development

### Production Build
```bash
npm run build
```
**Purpose**: Creates optimized production build
**When to use**: 
- Verify code compiles without errors
- Test build before deployment
- Check for type errors and linting issues

```bash
npm run build 2>&1 | head -20
```
**Purpose**: Builds and shows first 20 lines of output
**When to use**: Quick build verification focusing on early output/errors

## 📂 File System Operations

### Directory Listing
```bash
ls -la .github/workflows/ 2>/dev/null || echo "No .github/workflows directory found"
```
**Purpose**: Lists workflow files with error handling
**When to use**: Check for CI/CD configuration files

### File Search
```bash
find . -name "vercel.json" -o -name "netlify.toml" -o -name "Dockerfile" -o -name "railway.json" 2>/dev/null
```
**Purpose**: Searches for common deployment configuration files
**When to use**: Identify deployment platform and configuration

## 🌐 Network Testing

### Health Checks
```bash
curl -s -I "https://values-md.vercel.app" | head -5
```
**Purpose**: Gets HTTP headers from deployed site
**When to use**: Verify deployment is live and responding

```bash
curl -s "https://values-md.vercel.app/results" | head -20
```
**Purpose**: Fetches and shows first 20 lines of results page
**When to use**: Check if specific pages are loading correctly

### API Testing
```bash
curl -s -X POST "https://values-md.vercel.app/api/generate-values" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test123"}' | jq -r '.error // "No error"'
```
**Purpose**: Tests API endpoint with JSON payload and extracts error field
**When to use**: Verify API endpoints are working correctly

### Cache Busting
```bash
curl -s -H "Cache-Control: no-cache" "https://values-md.vercel.app/_next/static/chunks/app/results/page-ef0ccf640862d9e4.js"
```
**Purpose**: Fetches resources bypassing cache
**When to use**: Check if deployment updates are live despite caching

## 🐙 GitHub CLI

### Repository Information
```bash
gh repo view --json homepageUrl,url
```
**Purpose**: Gets repository URL and homepage from GitHub
**When to use**: Verify deployment URL and repository information

```bash
gh workflow list 2>&1 || echo "No workflows found or gh not configured"
```
**Purpose**: Lists GitHub Actions workflows with error handling
**When to use**: Check CI/CD pipeline configuration

## 🚀 Deployment Verification

### Build Artifact Checking
```bash
curl -s "https://values-md.vercel.app/results" | grep -o 'page-[a-f0-9]*\.js' | head -1
```
**Purpose**: Extracts JavaScript chunk hash from page
**When to use**: Verify if new deployment has different build artifacts

```bash
curl -s "https://values-md.vercel.app" | grep -o 'dpl_[A-Za-z0-9]*' | head -1
```
**Purpose**: Extracts deployment ID from Vercel
**When to use**: Track specific deployment versions

### Link Verification
```bash
curl -s "https://values-md.vercel.app/results" | grep -o 'href="[^"]*"' | head -10
```
**Purpose**: Extracts all href attributes from deployed page
**When to use**: Verify navigation links are correct after deployment

```bash
curl -s "https://values-md.vercel.app/_next/static/chunks/app/results/page-ef0ccf640862d9e4.js" | grep -o 'href:"/[^"]*"' | head -5
```
**Purpose**: Checks links in compiled JavaScript
**When to use**: Verify client-side navigation links in deployed code

## 💡 Command Patterns and Best Practices

### Error Handling Pattern
```bash
command 2>&1 || echo "Fallback message"
```
**Purpose**: Runs command and provides fallback if it fails
**When to use**: Scripts that should continue even if some commands fail

### Output Limiting
```bash
command | head -20
```
**Purpose**: Shows only first 20 lines of output
**When to use**: Large output that you only need to sample

### Conditional Execution
```bash
ls directory/ 2>/dev/null || echo "Directory not found"
```
**Purpose**: Suppress error output and provide user-friendly message
**When to use**: When checking for optional files/directories

### Time-based Checking
```bash
sleep 30; curl -s "https://example.com" | grep "pattern"
```
**Purpose**: Wait before checking, useful for deployment propagation
**When to use**: Verifying changes that take time to propagate

## 🎯 Development Workflow Summary

### Typical Bug Fix Session:
1. `git status` - Check current state
2. `npm run build` - Verify current build state
3. Make code changes (using File tools)
4. `npm run build` - Test fix
5. `git add [files]` - Stage changes
6. `git commit -m "descriptive message"` - Commit fix
7. `git push origin main` - Deploy changes
8. `curl -s "https://deployed-url"` - Verify deployment

### Deployment Verification Pattern:
1. `git push origin main` - Trigger deployment
2. `curl -s "https://site.com" | grep "pattern"` - Check content
3. `curl -s "https://site.com/static/chunk.js" | grep "pattern"` - Check assets
4. Wait and recheck if needed for propagation

## 🔍 Troubleshooting Commands

### When Build Fails:
```bash
npm run build 2>&1 | tee build.log  # Capture full build output
cat build.log | grep -i error        # Extract error messages
```

### When Deployment Seems Stuck:
```bash
# Check deployment ID hasn't changed
curl -s "https://site.com" | grep -o 'dpl_[A-Za-z0-9]*'

# Check if static assets updated
curl -s "https://site.com/page" | grep -o 'chunk-[a-f0-9]*\.js'
```

### When Links are Broken:
```bash
# Extract all links from deployed page
curl -s "https://site.com/page" | grep -o 'href="[^"]*"'

# Check specific patterns in compiled JS
curl -s "https://site.com/static/chunk.js" | grep -o 'href:"[^"]*"'
```

---

*This memo captures the shell commands used during a real debugging session for the values.md project, demonstrating practical DevOps and troubleshooting workflows.*