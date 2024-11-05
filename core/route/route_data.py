from core.common.file_utils import load_json_data
from core.config.config import get_config_path
from core.database.file_system import FileSystemServer
from core.database.user import SessionServer
from core.database.user import UserServer

ReportInfo = {
    "001": "帐号不能为空",
    "002": "密码不能为空",
    "003": "帐号或密码错误",
    "004": "上传文件失败",
    "005": "文件名不能为空",
    "006": "新增成功",
    "007": "文件不能为空",
    "008": "文件类型不在白名单中",
    "009": "文件夹不存在",
    "010": "Token无效",
    "011": "Token过期",
    "012": "文件不存在"
}

FsServer = FileSystemServer(get_config_path("file_sys_db_path"))
FsConfig = load_json_data(get_config_path("file_sys_config_path"))

UsrServer = UserServer(get_config_path("user_db_path"))

SessServer = SessionServer(get_config_path("session_db_path"))
