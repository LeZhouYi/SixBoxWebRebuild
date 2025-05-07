import configparser
import json
import os

from core.common.file_utils import get_local_path

with open(os.path.join(os.getcwd(), "config/config.json"), "r", encoding="utf-8") as file:
    __config = json.load(file)


def get_config(option: str) -> any:
    """
    读取当前配置对应字段的值
    :param option: 字段
    :return: DEFAULT中字段对应的值
    """
    if option in __config:
        return __config[option]
    raise KeyError(option)


def get_config_path(option: str) -> str:
    """
    从配置文件读取绝对的路径数据
    :param option: 字段名
    :return: DEFAULT中字段对应的路径值并合并为绝对路径
    """
    path = __config.get(section="path", option=option)
    return get_local_path(path)


def get_config_by_section(section: str, option: str) ->any:
    """
    读取当前配置对应字段的值
    :param section: [str]对应节点
    :param option: [str]字段
    :return: [any]DEFAULT中字段对应的值
    """
    if section in __config:
        section_value = __config[section]
        if option in section_value:
            return section_value[option]
    raise KeyError(option)
