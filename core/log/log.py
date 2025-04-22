import logging
import os
import sys
import time

from core.config.config import get_config


def init_logger():
    """初始化日志记录器"""
    logger_save_path = get_config("logger_path")
    os.makedirs(logger_save_path, exist_ok=True)
    logger_file = "%s/log_%s.log" % (logger_save_path, int(time.time()))

    logging.basicConfig(
        level=get_config("logger_level"),
        format='%(asctime)s-%(name)s-%(levelname)s-%(message)s',
        handlers=[
            logging.FileHandler(logger_file, encoding="utf-8"),
            logging.StreamHandler(sys.stdout)
        ]
    )
    te_logger = logging.getLogger(__name__)
    return te_logger


logger = init_logger()
