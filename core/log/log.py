import datetime
import logging
import os.path

from core.config.config import get_config, get_config_path


def init_logger():
    """初始化日志记录器"""
    logger_level = get_config("logger_level")
    te_logger = logging.getLogger("flask_app_logger")
    te_logger.setLevel(logger_level)

    date_stamp = datetime.datetime.now().strftime("%Y%m%d")
    logger_name = "log_%s.log" % date_stamp
    file_path = os.path.join(get_config_path("logger_path"), logger_name)
    file_handler = logging.FileHandler(file_path)
    file_handler.setLevel(logger_level)

    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    te_logger.addHandler(file_handler)
    return te_logger


logger = init_logger()
