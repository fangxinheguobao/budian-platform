# -*- coding: utf-8 -*-
# 通过 GitHub Git Data API 推送目录到指定分支（绕开 git:443 握手干扰）
import json, base64, urllib.request, urllib.error, os, time, sys

TOKEN = None
for line in open(r'D:\workspace\布典人生\.deploy-token', encoding='utf-8'):
    if 'access_token' in line:
        TOKEN = line.split('"')[3]
REPO = 'fangxinheguobao/budian-platform'
API = 'https://api.github.com/repos/' + REPO

import urllib.request as _u
_u.install_opener(_u.build_opener(_u.ProxyHandler({})))  # 直连，不走系统代理

def req(url, data=None, method='GET'):
    body = json.dumps(data).encode() if data is not None else None
    r = urllib.request.Request(url, data=body, method=method)
    r.add_header('Authorization', 'token ' + TOKEN)
    r.add_header('Accept', 'application/vnd.github+json')
    if body:
        r.add_header('Content-Type', 'application/json')
    last = None
    for attempt in range(5):
        try:
            with urllib.request.urlopen(r, timeout=60) as resp:
                return json.load(resp)
        except urllib.error.HTTPError as e:
            if e.code < 500:
                raise RuntimeError(str(e.code) + ' ' + e.read().decode()[:300])
            last = e
            time.sleep(3)
        except Exception as e:
            last = e
            time.sleep(3)
    raise RuntimeError('network fail: ' + url + ' last=' + str(last))

def push_branch(branch, local_root, commit_msg):
    ref = req(API + '/git/ref/heads/' + branch)
    base_commit = ref['object']['sha']
    commit = req(API + '/git/commits/' + base_commit)
    base_tree = commit['tree']['sha']

    files = []
    SKIP_DIRS = {'.git', 'node_modules', 'dist', 'output'}
    for root, dirs, fs in os.walk(local_root):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for fn in fs:
            p = os.path.join(root, fn)
            rel = os.path.relpath(p, local_root).replace(os.sep, '/')
            files.append((rel, p))

    tree_items = []
    for rel, p in files:
        content = open(p, 'rb').read()
        blob = req(API + '/git/blobs', {'content': base64.b64encode(content).decode(), 'encoding': 'base64'}, 'POST')
        tree_items.append({'path': rel, 'mode': '100644', 'type': 'blob', 'sha': blob['sha']})
        print('  blob ' + rel, flush=True)
    tree = req(API + '/git/trees', {'base_tree': base_tree, 'tree': tree_items}, 'POST')
    new_commit = req(API + '/git/commits', {'message': commit_msg, 'tree': tree['sha'], 'parents': [base_commit]}, 'POST')
    req(API + '/git/refs/heads/' + branch, {'sha': new_commit['sha']}, 'PATCH')
    print(branch + ': pushed ' + str(len(tree_items)) + ' files, commit ' + new_commit['sha'][:8], flush=True)

if __name__ == '__main__':
    push_branch('main', r'D:\workspace\布典人生\budian-platform', 'v6.2：仓库色卡化改造（单位米改张、去采购出入库、仓库仅管理员、商城隐藏库存）')
    push_branch('gh-pages', r'D:\workspace\布典人生\budian-platform\dist', 'deploy: v6.2 色卡化')
    print('ALL DONE')
