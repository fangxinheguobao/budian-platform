#!/bin/bash
# 布典人生平台一键部署脚本：需要 GitHub token（repo 权限）
set -e
TOKEN_FILE="${1:-/tmp/gh_token.json}"
GH="/tmp/gh_cli/bin/gh.exe"
REPO_NAME="budian-platform"

if [ ! -f "$TOKEN_FILE" ]; then echo "token file missing: $TOKEN_FILE"; exit 1; fi
TOKEN=$(python -c "import json;print(json.load(open('$TOKEN_FILE'.replace('\\\\','/')))['access_token'])" 2>/dev/null || grep -o '"access_token": *"[^"]*"' "$TOKEN_FILE" | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then echo "no token parsed"; exit 1; fi
echo "token loaded (${#TOKEN} chars)"

export GH_TOKEN="$TOKEN"
"$GH" auth status 2>&1 | head -3 || true
LOGIN=$("$GH" api user -q .login)
echo "login: $LOGIN"

cd "D:/workspace/布典人生/budian-platform"

# 创建仓库（已存在则跳过）
"$GH" repo view "$LOGIN/$REPO_NAME" >/dev/null 2>&1 && echo "repo exists" || {
  "$GH" repo create "$REPO_NAME" --public --description "布典人生面料管理协同平台：管理端+用户端静态系统（React+Vite）" --source . --remote origin --push 2>&1 | tail -2
}
git remote add origin "https://github.com/$LOGIN/$REPO_NAME.git" 2>/dev/null || true
git remote set-url origin "https://x-access-token:$TOKEN@github.com/$LOGIN/$REPO_NAME.git"
git push -u origin main 2>&1 | tail -2

# 部署 gh-pages：用 dist 内容
git fetch origin gh-pages 2>/dev/null || true
if git ls-remote --heads origin | grep -q gh-pages; then
  git push origin --delete gh-pages 2>&1 | tail -1
fi
CHECKOUT=$(mktemp -d)
git worktree prune
git worktree add "$CHECKOUT" --orphan gh-pages-temp 2>/dev/null || git worktree add -b gh-pages-temp "$CHECKOUT"
cp -r dist/* "$CHECKOUT/"
cd "$CHECKOUT"
git add -A
git -c user.name="budian-deploy" -c user.email="budian-deploy@users.noreply.github.com" commit -m "deploy: $(date +%Y-%m-%d_%H:%M)"
git push origin HEAD:refs/heads/gh-pages 2>&1 | tail -2

# 回到源码目录，开启 Pages
cd "D:/workspace/布典人生/budian-platform"
git remote set-url origin "https://github.com/$LOGIN/$REPO_NAME.git"
"$GH" api -X POST "repos/$LOGIN/$REPO_NAME/pages" -f "source[branch]=gh-pages" -f "source[path]=/" 2>&1 | head -3 || echo "pages maybe already enabled"
"$GH" api "repos/$LOGIN/$REPO_NAME/pages" -q .html_url 2>/dev/null && echo "PAGES_URL ↑" || echo "https://$LOGIN.github.io/$REPO_NAME/"
