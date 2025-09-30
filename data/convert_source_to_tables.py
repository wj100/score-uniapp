#!/usr/bin/env python3
"""
将 source.json 数据拆分成两张表的脚本
1. scoring_match - 比赛基础信息表
2. scoring_player_match - 选手比赛详情表
"""

import json
import uuid
from datetime import datetime
from typing import List, Dict, Any

def parse_match_players(match_str: str) -> tuple:
    """解析比赛选手字符串，返回 (player1, player2)"""
    players = match_str.split('-')
    if len(players) != 2:
        raise ValueError(f"Invalid match format: {match_str}")
    return players[0].strip(), players[1].strip()

def parse_score(score_str: str) -> tuple:
    """解析比分字符串，返回 (score1, score2)"""
    scores = score_str.split('-')
    if len(scores) != 2:
        raise ValueError(f"Invalid score format: {score_str}")
    return int(scores[0].strip()), int(scores[1].strip())

def convert_source_data(source_data: List[Dict]) -> tuple:
    """转换源数据为两张表格式，确保 match_id 对应"""
    matches = []
    player_matches = []
    
    for item in source_data:
        try:
            player1, player2 = parse_match_players(item['match'])
            score1, score2 = parse_score(item['score'])
            
            # 使用 createdAt 时间作为比赛时间
            match_time = item['createdAt']
            
            # 生成唯一的 match_id，确保两张表中的 match_id 相同
            match_id = str(uuid.uuid4()).replace('-', '')
            
            # scoring_match 表记录
            match_record = {
                "_id": match_id,
                "time": match_time,
                "match_type": 1,  # 1表示单打
                "player1": player1,
                "player2": player2,
                "score1": score1,
                "score2": score2,
                "match_name": ""  # 默认为空
            }
            matches.append(match_record)
            
            # scoring_player_match 表记录
            # 选手1的记录
            player1_record = {
                "_id": str(uuid.uuid4()).replace('-', ''),
                "match_id": match_id,  # 使用相同的 match_id
                "time": match_time,
                "match_type": 1,  # 1表示单打
                "player": player1,
                "score": score1,
                "result": 1 if score1 > score2 else 0  # 1表示获胜，0表示失败
            }
            
            # 选手2的记录
            player2_record = {
                "_id": str(uuid.uuid4()).replace('-', ''),
                "match_id": match_id,  # 使用相同的 match_id
                "time": match_time,
                "match_type": 1,  # 1表示单打
                "player": player2,
                "score": score2,
                "result": 1 if score2 > score1 else 0  # 1表示获胜，0表示失败
            }
            
            player_matches.extend([player1_record, player2_record])
            
        except (ValueError, KeyError) as e:
            print(f"跳过无效记录: {item}, 错误: {e}")
            continue
    
    return matches, player_matches

def main():
    """主函数"""
    try:
        # 读取源数据
        print("读取源数据 source.json...")
        with open('source.json', 'r', encoding='utf-8') as f:
            source_data = json.load(f)
        
        print(f"源数据包含 {len(source_data)} 条记录")
        
        # 转换为两张表的格式
        print("转换数据为两张表格式...")
        scoring_match_data, scoring_player_match_data = convert_source_data(source_data)
        
        # 保存转换后的数据
        print(f"保存 {len(scoring_match_data)} 条比赛记录到 scoring_match.json...")
        with open('scoring_match.json', 'w', encoding='utf-8') as f:
            json.dump(scoring_match_data, f, ensure_ascii=False, indent=2)
        
        print(f"保存 {len(scoring_player_match_data)} 条选手记录到 scoring_player_match.json...")
        with open('scoring_player_match.json', 'w', encoding='utf-8') as f:
            json.dump(scoring_player_match_data, f, ensure_ascii=False, indent=2)
        
        # 数据验证
        print("\n=== 数据验证 ===")
        print(f"原始记录数: {len(source_data)}")
        print(f"比赛记录数: {len(scoring_match_data)}")
        print(f"选手记录数: {len(scoring_player_match_data)}")
        print(f"预期选手记录数: {len(scoring_match_data) * 2}")
        
        if len(scoring_player_match_data) == len(scoring_match_data) * 2:
            print("✅ 数据验证通过!")
        else:
            print("❌ 数据验证失败!")
        
        # 显示样本数据
        print("\n=== 样本数据 ===")
        if scoring_match_data:
            print("scoring_match 样本:")
            print(json.dumps(scoring_match_data[0], ensure_ascii=False, indent=2))
        
        if scoring_player_match_data:
            print("\nscoring_player_match 样本:")
            print(json.dumps(scoring_player_match_data[0], ensure_ascii=False, indent=2))
        
        print("\n转换完成!")
        
    except FileNotFoundError:
        print("❌ 错误: 找不到 source.json 文件")
        print("请确保脚本在 data 目录中运行，且 source.json 文件存在")
    except json.JSONDecodeError as e:
        print(f"❌ 错误: source.json 文件格式不正确 - {e}")
    except Exception as e:
        print(f"❌ 未预期的错误: {e}")

if __name__ == "__main__":
    main()