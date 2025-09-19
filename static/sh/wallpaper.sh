#!/bin/bash
# 自动获取壁纸URL并保存到配置文件

# 设置中国时区
export TZ='Asia/Shanghai'

# 获取当前完整日期，格式为YYYYMMDD
full_date=$(date +"%Y%m%d")
current_date=$(date +"%Y%m")

# 设置Bing每日壁纸的API链接
url="https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN"

# 获取API返回的JSON数据
response=$(curl -s -H "Accept: application/json" --insecure "$url")

# 从JSON数据中提取图片基本链接
imgurl_base=$(echo "$response" | grep -oP '(?<="urlbase":")[^"]*')

# 拼接完整的图片链接
imgurl="https://cn.bing.com${imgurl_base}_1920x1080.jpg"

# 指定配置文件保存路径
config_path="/www/wwwroot/www.xxx.com/img/wallpaper_urls.json"

# 如果目录不存在，则创建
mkdir -p "$(dirname "$config_path")"

# 如果图片链接不为空，则更新配置文件
if [ -n "$imgurl_base" ]; then
    # 检查配置文件是否存在，如果不存在则创建空对象
    if [ ! -f "$config_path" ]; then
        echo "{}" > "$config_path"
    fi
    
    # 检查链接是否已存在
    if grep -q "\"$imgurl\"" "$config_path"; then
        echo "壁纸URL已存在，无需重复添加：$imgurl"
        exit 0
    fi
    
    # 读取文件内容并仅移除空行（保留引号和结构）
    content=$(cat "$config_path" | sed '/^$/d')  # 只删除空行，不影响其他内容
    
    # 移除首尾的{}和可能的空格
    content=$(echo "$content" | sed '1d;$d' | sed 's/^[ \t]*//;s/[ \t]*$//')
    
    # 构建新的键值对
    new_entry="  \"$full_date\": \"$imgurl\""
    
    # 如果原有内容不为空，添加逗号和换行分隔
    if [ -n "$content" ]; then
        new_content="{\n$new_entry,\n$content\n}"
    else
        new_content="{\n$new_entry\n}"
    fi
    
    # 写回文件，使用echo -e解析转义字符
    echo -e "$new_content" > "$config_path"
    
    echo "已成功更新壁纸URL（最新在顶部）：${full_date} -> ${imgurl}"
else
    # 如果获取图片链接失败，则输出错误信息并退出脚本
    echo "获取Bing壁纸链接失败，请检查网络连接或API是否可用"
    exit 1
fi
