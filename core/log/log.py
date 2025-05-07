import logging
import os
import sys
from logging.handlers import TimedRotatingFileHandler

from core.config.config import get_config


def init_logger():
    """初始化日志记录器"""
    logger_config = get_config("logger")
    os.makedirs(logger_config["save_path"], exist_ok=True)
    logging.basicConfig(
        level=logger_config["logger_level"],
        format=logger_config["format"],
        handlers=[
            TimedRotatingFileHandler(
                filename="%s/log.log" % logger_config["save_path"],
                when=logger_config["when"],
                interval=logger_config["interval"],
                backupCount=logger_config["backup_count"],
                encoding=logger_config["encoding"],
                delay=logger_config["delay"],
                utc=logger_config["utc"]
            ),
            logging.StreamHandler(sys.stdout)
        ]
    )
    te_logger = logging.getLogger(__name__)
    return te_logger


logger = init_logger()
