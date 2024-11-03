import configparser

from core.common.file_utils import get_local_path

__config = configparser.ConfigParser()
__config.read(get_local_path("sources/config/config.ini"), encoding="utf-8")


def get_config(option: str) -> str:
    """
    读取当前配置对应字段的值
    :param option: 字段
    :return: DEFAULT中字段对应的值
    """
    return __config.get(section="DEFAULT", option=option)


def get_config_path(option: str) -> str:
    """
    从配置文件读取绝对的路径数据
    :param option: 字段名
    :return: DEFAULT中字段对应的路径值并合并为绝对路径
    """
    path = __config.get(section="DEFAULT", option=option)
    return get_local_path(path)


def get_config_by_section(section: str, option: str) -> str:
    """
    读取当前配置对应字段的值
    :param section: 对应节点
    :param option: 字段
    :return: DEFAULT中字段对应的值
    """
    return __config.get(section=section, option=option)
