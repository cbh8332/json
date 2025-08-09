import requests
import json
import os

# 读取 urls.json
with open("urls.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# 从环境变量获取代理配置（GitHub Action 通过 secrets 注入）
http_proxy = os.getenv("HTTP_PROXY")
https_proxy = os.getenv("HTTPS_PROXY")

proxies = {}
if http_proxy:
    proxies["http"] = http_proxy
if https_proxy:
    proxies["https"] = https_proxy

for item in data:
    name = item["name"].strip()
    url = item["url"].strip()

    try:
        print(f"📥 正在下载: {name} ({url})")
        resp = requests.get(url, proxies=proxies, timeout=30)
        resp.raise_for_status()

        file_path = f"{name}.lpx"
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(resp.text)

        print(f"✅ 已保存: {file_path}")
    except Exception as e:
        print(f"❌ 下载失败: {name} ({e})")
