#!/bin/bash
# 一键部署：读取工作区根目录的 .deploy-token（GitHub 令牌，已授权 repo 权限）
# 用法：bash scripts/deploy.sh
set -e
TOKEN_FILE="D:/workspace/布典人生/.deploy-token"
REPO="fangxinheguobao/budian-platform"

[ -f "$TOKEN_FILE" ] || { echo "缺少 $TOKEN_FILE"; exit 1; }
TOKEN=$(grep -o '"access_token":"[^"]*"' "$TOKEN_FILE" | cut -d'"' -f4)
[ -n "$TOKEN" ] || { echo "令牌解析失败，可能已过期，需要重新授权"; exit 1; }

cd "D:/workspace/布典人生/budian-platform"
npm run build

# 推送源码
git push "https://x-access-token:$TOKEN@github.com/$REPO.git" main 2>&1 | tail -1

# 推送构建产物到 gh-pages
rm -rf /tmp/ghpages && mkdir -p /tmp/ghpages && cp -r dist/* /tmp/ghpages/
cd /tmp/ghpages
git init -b gh-pages >/dev/null 2>&1
git add -A
git -c user.name="budian-deploy" -c user.email="budian-deploy@users.noreply.github.com" commit -m "deploy: $(date +%Y-%m-%d_%H:%M)" >/dev/null
git remote add origin "https://x-access-token:$TOKEN@github.com/$REPO.git"
git push origin gh-pages --force 2>&1 | tail -1

echo "完成：https://fangxinheguobao.github.io/budian-platform/ （Pages 构建~1分钟后生效）"
