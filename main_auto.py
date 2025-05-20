import yaml
import yaml_include

from core.auto.web_runner import WebAutoRunner

if __name__ == '__main__':
    yaml.add_constructor("!inc", yaml_include.Constructor(base_dir="data/auto"))
    runner = WebAutoRunner("data/auto/cases/crawl_baidu_news.yml", "sources/config/auto_config.json")
    runner.run_case()
