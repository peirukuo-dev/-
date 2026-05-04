# 教授評價系統 (Python 終端機版本)

import random

# --- 核心資料結構 (模擬資料庫) ---
# 預留結構：之後可以將此字典更換為資料庫連線
professors_db = {
    "王小明": {
        "ratings": [4, 5, 4],
        "comments": ["老師教得很清楚", "給分很大方"],
        "beaten_count": 0
    },
    "李大華": {
        "ratings": [2, 3, 1],
        "comments": ["考試超難...", "教授常常消失"],
        "beaten_count": 0
    },
    "張志強": {
        "ratings": [5, 5, 4],
        "comments": ["幽默風趣", "推推"],
        "beaten_count": 0
    }
}

def calculate_avg(ratings):
    """計算平均分數"""
    if not ratings:
        return 0
    return round(sum(ratings) / len(ratings), 1)

def show_list():
    """功能 1: 顯示所有教授列表"""
    print("\n--- 目前受評教授列表 ---")
    for name in professors_db.keys():
        avg = calculate_avg(professors_db[name]["ratings"])
        print(f"教授：{name} | 平均評分：{avg} ⭐")

def search_professor():
    """功能 2: 搜尋並選擇教授"""
    name = input("\n請輸入想查詢的教授名字：")
    if name in professors_db:
        return name
    else:
        print("❌ 找不到這個教授，請確認名字是否正確。")
        return None

def show_info(name):
    """功能 3: 查看教授詳細資訊"""
    data = professors_db[name]
    avg = calculate_avg(data["ratings"])
    print(f"\n===== 教授資訊：{name} =====")
    print(f"⭐ 平均評分：{avg} ({len(data['ratings'])} 人評分)")
    print(f"🥊 被舒壓次數：{data['beaten_count']} 次")
    print("\n[ 留言板 ]")
    for i, comment in enumerate(data["comments"], 1):
        print(f"{i}. {comment}")
    print("==========================")

def add_rating_and_comment(name):
    """功能 4/5: 對教授評分與留言"""
    try:
        score = int(input("\n請給予評分 (1~5 分)："))
        if 1 <= score <= 5:
            professors_db[name]["ratings"].append(score)
            comment = input("請留下您的評論：")
            if comment:
                professors_db[name]["comments"].append(comment)
            print("✅ 感謝您的評價！")
        else:
            print("❌ 評分範圍必須是 1~5。")
    except ValueError:
        print("❌ 請輸入數字。")

def stress_relief(name):
    """功能 6: 扁教授 (舒壓系統)"""
    actions = [
        "丟出了粉筆！但教授輕巧地閃過了。",
        "在考卷上畫了烏龜，讓教授氣到跳腳！",
        "教授在走廊消失了，讓你找不到人討論功課！",
        "你對教授使出了「延期交作業之術」！",
        "教授因爲你的熱情提問感到一陣暈眩。",
        "你在夢中奪走了教授的點名簿！"
    ]
    print(f"\n🥊 你對 {name} 教授進行了舒壓行動...")
    print(f"結果：{random.choice(actions)}")
    professors_db[name]["beaten_count"] += 1
    print(f"💡 該教授累積被舒壓次數：{professors_db[name]['beaten_count']}")

def main_menu():
    """主程式迴圈"""
    while True:
        print("\n🎓 大學生教授評價系統 🎓")
        print("1. 查看教授列表")
        print("2. 查詢/詳細資訊")
        print("3. 進行評分與留言")
        print("4. 扁教授 (舒壓專區)")
        print("0. 離開系統")
        
        choice = input("\n請選擇功能 (0-4)：")
        
        if choice == '1':
            show_list()
        
        elif choice == '2':
            name = search_professor()
            if name:
                show_info(name)
        
        elif choice == '3':
            name = search_professor()
            if name:
                add_rating_and_comment(name)
        
        elif choice == '4':
            name = search_professor()
            if name:
                stress_relief(name)
        
        elif choice == '0':
            print("👋 系統關閉，助您學業如意！")
            break
        else:
            print("❌ 無效選擇，請重新輸入。")

# 執行系統
if __name__ == "__main__":
    main_menu()
