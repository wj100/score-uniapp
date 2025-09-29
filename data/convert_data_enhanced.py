#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
增强版数据转换脚本：将3.json的数据拆分成1.json和2.json的格式
生成22.json（scoring_match格式）和33.json（scoring_player_match格式）

功能特性：
1. 智能解析比赛格式（单打/双打）
2. 自动生成MongoDB ObjectId
3. 数据验证和错误处理
4. 详细的转换统计
5. 支持多种比赛格式
"""

import json
import uuid
import re
from datetime import datetime
from typing import List, Dict, Any, Tuple
from collections import Counter

class DataConverter:
    def __init__(self):
        self.stats = {
            'total_records': 0,
            'single_matches': 0,
            'double_matches': 0,
            'conversion_errors': 0,
            'players': set()
        }
    
    def generate_object_id(self) -> str:
        """生成类似MongoDB ObjectId的字符串"""
        return str(uuid.uuid4()).replace('-', '')[:24]
    
    def parse_match_string(self, match_str: str) -> Tuple[List[str], int]:
        """
        智能解析比赛字符串，返回(players, match_type)
        支持格式：
        - 单打: "言志-小鲁", "言志 vs 小鲁"
        - 双打: "言志&小鲁-建华&言志", "言志&小鲁 vs 建华&言志"
        """
        match_str = match_str.strip()
        
        # 处理不同的分隔符
        if ' vs ' in match_str:
            teams = match_str.split(' vs ')
        elif ' - ' in match_str:
            teams = match_str.split(' - ')
        elif '-' in match_str:
            teams = match_str.split('-')
        else:
            # 默认单打
            return [match_str], 1
        
        if len(teams) != 2:
            return [match_str], 1
        
        # 检查是否包含双打标识符
        if '&' in teams[0] or '&' in teams[1]:
            # 双打
            return teams, 2
        else:
            # 单打
            return teams, 1
    
    def parse_score_string(self, score_str: str) -> Tuple[int, int]:
        """
        解析比分字符串，返回(score1, score2)
        支持格式: "15 - 13", "15:13", "15-13"
        """
        try:
            # 处理不同的分隔符
            if ' - ' in score_str:
                scores = score_str.split(' - ')
            elif ':' in score_str:
                scores = score_str.split(':')
            elif '-' in score_str:
                scores = score_str.split('-')
            else:
                return 0, 0
            
            if len(scores) == 2:
                score1 = int(scores[0].strip())
                score2 = int(scores[1].strip())
                return score1, score2
        except (ValueError, IndexError):
            pass
        
        return 0, 0
    
    def convert_to_scoring_match_format(self, data: List[Dict]) -> List[Dict]:
        """将3.json格式转换为scoring_match格式"""
        scoring_matches = []
        
        for i, item in enumerate(data):
            try:
                # 解析比赛信息
                players, match_type = self.parse_match_string(item['match'])
                score1, score2 = self.parse_score_string(item['score'])
                
                # 解析时间
                try:
                    time_obj = datetime.fromisoformat(item['createdAt'].replace('Z', '+00:00'))
                    time_date = item['createdAt']
                except:
                    time_date = datetime.now().isoformat() + 'Z'
                
                # 构建scoring_match记录
                scoring_match = {
                    "_id": {"$oid": self.generate_object_id()},
                    "time": {"$date": time_date},
                    "match_type": match_type,
                    "player1": players[0] if len(players) > 0 else "",
                    "player2": players[1] if len(players) > 1 else "",
                    "score1": score1,
                    "score2": score2,
                    "match_name": ""
                }
                
                scoring_matches.append(scoring_match)
                
                # 更新统计
                if match_type == 1:
                    self.stats['single_matches'] += 1
                else:
                    self.stats['double_matches'] += 1
                
                # 收集选手信息
                for player in players:
                    if '&' in player:
                        # 双打选手
                        for p in player.split('&'):
                            self.stats['players'].add(p.strip())
                    else:
                        self.stats['players'].add(player.strip())
                
            except Exception as e:
                print(f"警告：第{i+1}条记录转换失败: {e}")
                self.stats['conversion_errors'] += 1
                continue
        
        return scoring_matches
    
    def convert_to_scoring_player_match_format(self, data: List[Dict]) -> List[Dict]:
        """将3.json格式转换为scoring_player_match格式"""
        player_matches = []
        
        for i, item in enumerate(data):
            try:
                # 解析比赛信息
                players, match_type = self.parse_match_string(item['match'])
                score1, score2 = self.parse_score_string(item['score'])
                
                # 解析时间
                try:
                    time_obj = datetime.fromisoformat(item['createdAt'].replace('Z', '+00:00'))
                    time_date = item['createdAt']
                except:
                    time_date = datetime.now().isoformat() + 'Z'
                
                # 生成比赛ID
                match_id = self.generate_object_id()
                
                if match_type == 1:
                    # 单打：两个选手
                    if len(players) >= 2:
                        player_matches.extend([
                            {
                                "_id": {"$oid": self.generate_object_id()},
                                "match_id": {"$oid": match_id},
                                "time": {"$date": time_date},
                                "match_type": 1,
                                "player": players[0].strip(),
                                "score": score1,
                                "result": 1 if score1 > score2 else 0
                            },
                            {
                                "_id": {"$oid": self.generate_object_id()},
                                "match_id": {"$oid": match_id},
                                "time": {"$date": time_date},
                                "match_type": 1,
                                "player": players[1].strip(),
                                "score": score2,
                                "result": 1 if score2 > score1 else 0
                            }
                        ])
                else:
                    # 双打：处理队伍
                    if len(players) == 2:
                        team_a_players = players[0].split('&') if '&' in players[0] else [players[0]]
                        team_b_players = players[1].split('&') if '&' in players[1] else [players[1]]
                        
                        # 队伍A的选手
                        for player in team_a_players:
                            player_matches.append({
                                "_id": {"$oid": self.generate_object_id()},
                                "match_id": {"$oid": match_id},
                                "time": {"$date": time_date},
                                "match_type": 2,
                                "player": player.strip(),
                                "score": score1,
                                "result": 1 if score1 > score2 else 0
                            })
                        
                        # 队伍B的选手
                        for player in team_b_players:
                            player_matches.append({
                                "_id": {"$oid": self.generate_object_id()},
                                "match_id": {"$oid": match_id},
                                "time": {"$date": time_date},
                                "match_type": 2,
                                "player": player.strip(),
                                "score": score2,
                                "result": 1 if score2 > score1 else 0
                            })
                
            except Exception as e:
                print(f"警告：第{i+1}条记录转换失败: {e}")
                continue
        
        return player_matches
    
    def print_statistics(self, scoring_matches: List[Dict], player_matches: List[Dict]):
        """打印详细的转换统计"""
        print("\n" + "="*60)
        print("📊 数据转换统计报告")
        print("="*60)
        
        print(f"📁 原始记录数: {self.stats['total_records']}")
        print(f"🏸 单打比赛: {self.stats['single_matches']}")
        print(f"👥 双打比赛: {self.stats['double_matches']}")
        print(f"❌ 转换错误: {self.stats['conversion_errors']}")
        print(f"👤 涉及选手: {len(self.stats['players'])}")
        
        print(f"\n📄 生成文件:")
        print(f"   📋 22.json (scoring_match): {len(scoring_matches)} 条记录")
        print(f"   👥 33.json (scoring_player_match): {len(player_matches)} 条记录")
        
        # 选手统计
        if self.stats['players']:
            print(f"\n👤 选手列表:")
            for i, player in enumerate(sorted(self.stats['players']), 1):
                print(f"   {i:2d}. {player}")
        
        # 数据质量检查
        print(f"\n🔍 数据质量检查:")
        print(f"   ✅ 转换成功率: {((self.stats['total_records'] - self.stats['conversion_errors']) / self.stats['total_records'] * 100):.1f}%")
        print(f"   📊 平均每场比赛选手数: {len(player_matches) / len(scoring_matches):.1f}")
        
        # 时间范围
        if scoring_matches:
            times = [match['time']['$date'] for match in scoring_matches]
            print(f"   📅 时间范围: {min(times)} 到 {max(times)}")

def main():
    """主函数"""
    print("🚀 羽毛球数据转换工具启动")
    print("="*60)
    
    converter = DataConverter()
    
    # 读取3.json文件
    try:
        with open('3.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        converter.stats['total_records'] = len(data)
        print(f"✅ 成功读取3.json，共{len(data)}条记录")
    except FileNotFoundError:
        print("❌ 错误：找不到3.json文件")
        return
    except json.JSONDecodeError as e:
        print(f"❌ 错误：3.json文件格式不正确 - {e}")
        return
    
    # 转换为scoring_match格式
    print("\n🔄 转换为scoring_match格式...")
    scoring_matches = converter.convert_to_scoring_match_format(data)
    
    # 保存为22.json
    with open('22.json', 'w', encoding='utf-8') as f:
        for match in scoring_matches:
            f.write(json.dumps(match, ensure_ascii=False) + '\n')
    print(f"✅ 已生成22.json，共{len(scoring_matches)}条scoring_match记录")
    
    # 转换为scoring_player_match格式
    print("🔄 转换为scoring_player_match格式...")
    player_matches = converter.convert_to_scoring_player_match_format(data)
    
    # 保存为33.json
    with open('33.json', 'w', encoding='utf-8') as f:
        for match in player_matches:
            f.write(json.dumps(match, ensure_ascii=False) + '\n')
    print(f"✅ 已生成33.json，共{len(player_matches)}条scoring_player_match记录")
    
    # 显示统计信息
    converter.print_statistics(scoring_matches, player_matches)
    
    # 显示示例数据
    print(f"\n📋 22.json 前3条记录示例:")
    for i, match in enumerate(scoring_matches[:3]):
        print(f"   {i+1}. {json.dumps(match, ensure_ascii=False, indent=4)}")
    
    print(f"\n👥 33.json 前3条记录示例:")
    for i, match in enumerate(player_matches[:3]):
        print(f"   {i+1}. {json.dumps(match, ensure_ascii=False, indent=4)}")
    
    print(f"\n🎉 数据转换完成！")
    print("="*60)

if __name__ == "__main__":
    main()
