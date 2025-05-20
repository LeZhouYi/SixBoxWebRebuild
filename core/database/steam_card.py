import copy
import itertools
import math
import threading

from tinydb import TinyDB, Query


class SteamCardServer:

    def __init__(self, db_path: str):
        self.db = TinyDB(db_path)
        self.query = Query()
        self.thread_lock = threading.Lock()

    def add_card(self, game_name: str, card_name: str, count: int, max_sell: float, min_buy: float):
        with self.thread_lock:
            self.db.insert({
                "game_name": game_name,
                "card_name": card_name,
                "count": count,
                "max_sell": max_sell,
                "min_buy": min_buy
            })

    def calculate_card(self, game_name: str, price: float):
        """计算一个补充包可能产生的效果"""
        with self.thread_lock:
            data = self.db.search(self.query.game_name == game_name)
        length = len(data)
        counts = []
        for item in data:
            counts.append(item["count"])
        all_combination = math.pow(length, 3)
        cheap_times = 0
        earn_times = 0
        minus_times = 0
        for combination in itertools.product(range(length), repeat=3):
            temp_counts = copy.deepcopy(counts)
            sell_price = 0  # 要出售的价格
            change_price = 0  # 记录直接购买需要的价格
            for index in combination:
                if temp_counts[index] > 0:
                    # 已有的需要直接出售，出售价格为购买价格-0.01
                    temp_price = data[index]["min_buy"]
                    steam_need = 0.01
                    game_need = math.trunc((temp_price / 10) * 100) / 100
                    if game_need < 0.01:
                        game_need = 0.01
                    sell_price += (temp_price - steam_need - game_need)
                else:
                    # 未有，不出售，记录直接买的时候价格
                    temp_counts[index] += 1
                    change_price += data[index]["min_buy"]
            if price - sell_price <= change_price:
                cheap_times += 1
                if change_price - (price - sell_price) > 0.1:
                    earn_times += 1
            else:
                if price - sell_price - change_price > 0.1:
                    minus_times += 1
        return {
            "all": all_combination,
            "cheap_times": cheap_times,
            "earn_times": earn_times,
            "minus_times": minus_times,
            "cheap_rate": cheap_times / all_combination * 100,
            "earn_rate": earn_times / all_combination * 100,
            "minus_rate": minus_times / all_combination * 100,
            "not_mimus_rate": (all_combination - minus_times - earn_times) / all_combination * 100
        }
