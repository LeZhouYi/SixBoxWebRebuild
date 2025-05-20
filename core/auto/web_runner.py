import os.path
import re
import time
from tkinter import messagebox

import yaml
from core.common.file_utils import load_json_data
from os import PathLike
from selenium import webdriver
from selenium.webdriver.edge.options import Options as EdgeOptions


class WebAutoRunner:

    def __init__(self, file_path: PathLike | str, config_path: PathLike | str):
        self.case_data = self.load_case(file_path)
        self.config = load_json_data(config_path)
        self.web_driver = None
        self.run_data = {}

    def get_config_value(self, key: str) -> any:
        """获取配置值"""
        return self.config[key]

    def run_case(self):
        """开始运行"""
        self.init_web_driver()
        for action in self.case_data["actions"]:
            if not isinstance(action, dict):
                raise Exception("格式不正确：%s" % action)
            if action["method"] not in self.get_config_value("methods"):
                raise Exception("不存在该方法：%s" % action["method"])
            params = self.replace_params(action["params"])
            getattr(self, action["method"])(**params)

    def replace_params(self, target: dict):
        """替换参数"""
        if not isinstance(target, (dict, list, tuple, set)):
            raise TypeError("替换格式应为：dict/list/tuple/set")

        def _process(item):
            if isinstance(item, dict):
                return {
                    k: _process(v)
                    for k, v in item.items()
                }
            elif isinstance(item, (list, tuple, set)):
                return type(item)(_process(x) for x in item)
            elif (isinstance(item, str)
                  and re.match(self.get_config_value("param_pattern"), item)
                  and item[1:] in self.run_data
            ):
                return self.run_data[item[1:]]
            return item

        result = _process(target)
        if isinstance(target, dict):
            target.clear()
            target.update(result)
            return target
        return result

    @staticmethod
    def sleep(tick: int):
        """休眠"""
        time.sleep(tick)

    def open_url(self, url: str, is_new: bool = False):
        """打开URL"""
        if is_new:
            self.web_driver.execute_script("window.open('%s');".format(url))
            window_handles = self.web_driver.window_handles
            self.web_driver.switch_to.window(window_handles[-1])
        else:
            self.web_driver.get(url)

    @staticmethod
    def debug():
        """用于Debug"""
        messagebox.showinfo("暂停", "点击确认以继续")

    def init_web_driver(self):
        """初始化web_driver"""
        driver_config = self.case_data["driver"]
        driver_type = driver_config["type"]
        if driver_type not in self.get_config_value("web_types"):
            raise Exception("WebDriver Type 必须在 %s 中" % self.get_config_value("web_types"))
        getattr(self, "init_%s_driver" % driver_type)()

    def init_edge_driver(self):
        """初始化edge的driver"""
        edge_options = EdgeOptions()
        edge_config = self.case_data["driver"]

        # 添加配置
        for argument in edge_config["arguments"]:
            edge_options.add_argument(argument)

        # 添加实验性配置
        edge_options.add_experimental_option("prefs", edge_config["prefs"])

        # 添加扩展
        for extension in edge_config["extensions"]:
            edge_options.add_extension(extension)

        self.web_driver = webdriver.Edge(options=edge_options)

        # 添加参数
        for cmd, cmd_args in edge_config["params"].items():
            self.web_driver.execute_cdp_cmd(cmd, cmd_args)

        # 添加脚本
        for script in edge_config["scripts"]:
            self.web_driver.execute_script(script)

    @staticmethod
    def load_case(file_path: PathLike):
        with open(os.path.join(os.getcwd(), file_path), "r", encoding="utf-8") as f:
            case_data = yaml.full_load(f)
        return case_data
