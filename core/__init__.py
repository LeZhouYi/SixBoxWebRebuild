import os.path

from core.common.file_utils import get_local_path
from core.config.config import get_config_path


def pre_init():
    # 固有路径
    paths = ["data", "data/db"]
    for path_item in paths:
        local_path = get_local_path(path_item)
        if not os.path.exists(local_path):
            os.makedirs(local_path, exist_ok=True)
    # 配置路径
    config_keys = ["logger_path", "file_save_path", "file_static_path"]
    for config_key in config_keys:
        local_path = get_config_path(config_key)
        if not os.path.exists(local_path):
            os.makedirs(local_path, exist_ok=True)


pre_init()
