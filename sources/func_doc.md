# navigation_bar.js

function setNavigationBarTitle(title,elementId="navigation_header_title")
    /*设置导航栏标题*/


# page_selector.js

function setTotalPage(total, textId = "page_text_id", nowLimit = "10")
    /*设置总页数*/
function setNowPage(inputId = "page_input_id", page = "1")
    /*设置当前页数*/
function setPageLimit(elementId = "page_select_limit", limit = "10")
    /*更新每页项数*/

# side_bar.js

function initSidebar(nowPage, contentId, sidebarId = "side_bar_container", overlayId = "side_bar_overlay")
    /*初始化侧边栏的内容，基础数据*/
function updateSidebar(contentId, sidebarId = "side_bar_container", overlayId = "side_bar_overlay")
    /*根据当前缓存控制显示/隐藏侧边栏*/
function bindSideButtonClick(element, url, contentId, sidebarId, overlayId)
    /*绑定侧边栏按钮的点击事件*/
function bindSidebarEvent(controlId, contentId, sidebarId = "side_bar_container", overlayId = "side_bar_overlay")
    /*
        绑定点击相关事件，controlID为控制侧边栏展开隐藏的元素
        contentId为与侧边栏共存的页面
    */
function reverseIsShowSidebar()
    /*反转是否显示/隐藏侧边栏*/
function onSidebarResize(contentId, sidebarId = "side_bar_container", overlayId = "side_bar_overlay")
    /*当元素尺寸变化*/

# theme.js

function setBackgroundImage(className, fileUrl)
    /*
    设置类名对应元素的图片背景
    className: 元素类名
    fileName: 文件URL
    */
async function loadUserInfo(callback)
    /*加载用户信息*/

# func.js

function throttle(func, limit)
    /*节流*/
function getUrlParam(paramName)
    /*获取URL特定的查询参数*/
function loadUrlParamInLocal(paramArray)
    /*读取特定参数并将读取到的值写入localStorage*/
function loadUrlParamInSession(paramArray)
    /*读取特定参数并将读取到的值写入sessionStorage*/
function checkLocalDefault(itemKey, defaultValue)
    /*检查LocalStorage,若不存在数据则设置默认值*/
function checkSessionDefault(itemKey, defaultValue)
    /*检查LocalStorage,若不存在数据则设置默认值*/
function downloadByA(downloadUrl)
    /*设置a元素下载文件*/
function timeStampToText(timeStamp)
    /*将以秒单位的时间戳转成具体的样式文本*/
function formatFileSize(fileSize)
    /*返回对应的格式的存储大小文本*/
async function clipTextToBoard(clipText)
    /*复制文本至剪切板*/
function callElement(elementId, callback)
    /*获取元素并校验是否存在，存在则执行callback*/
function callElementsByClass(elementClass, callback)
    /*获取元素并校验是否存在，存在则执行callback*/
function getFullDomain()
    /*获取当前完整的域名*/
function parseLocalJson(itemName)
    /*获取并解析数据*/
function parseSessionJson(itemName)
    /*获取并解析数据*/
function randListItem(listData)
    /*随机抽取一个无素*/
function formatSeconds(seconds)
    /*格式化秒数*/
function shuffleArray(array)
    /*洗牌算法打乱数组*/

# render.js
function resizeFullScreen()
    /*计算并调整页页使用适应全屏*/
function displayMessage(messageText, iconUrl = "/static/icons/correct.png", removeTime = 4500)
    /*显示普通消息，一般是成功操作的提示*/
function displayErrorMessage(errorMessageText, iconUrl = "/static/icons/alert.png", removeTime = 4500)
    /*显示错误信息*/
function displayError(error)
    /*显示错误*/
function adjustRelativeLDPopup(popupElementId, startX, startY)
    /*将弹窗从X,Y调整显示合适的位置，左下角弹出*/
function addObserveResizeHiddenById(elementId)
    /*
        页面变化后隐藏，并移除监听器
        添加Math.floor的原因是因为beforeRect和contentRect两者的数值精度不一致
    */
function addObserveResizeHidden(element)
    /*
        页面变化后隐藏，并移除监听器
        添加Math.floor的原因是因为beforeRect和contentRect两者的数值精度不一致
    */
function clickOverlayHidden(overlayId, contentId)
    /*点击overlay区域将隐藏元素*/
function clickMultiOverlayHidden(overlayId, contentIds)
    /*点击overlay区域将隐藏元素*/
function clearElementByStart(elementId = "file_path_bar", minIndex = 1)
    /*清空路径元素*/
function hiddenElement(element, callback)
    /*隐藏元素*/
function displayElement(element, callback)
    /*显示元素*/
function hiddenElementById(elementId, callback)
    /*隐藏元素*/
function displayElementById(elementId, callback)
    /*显示元素*/
function isHidden(element)
    /*判断元素是否拥有hidden类*/
function isDisplayValue(element, value)
    /*判断元素是否处于特定显示状态*/
function isInClientWidth(start = 0, end = 399, callback)
    /*判断当前页面是否在范围宽度内*/
function createOptGroup(name)
    /*创建下拉选项组*/
function createOption(text, value)
    /*创建下拉选项*/
function createSpinner(elementId, className="spin_panel")
    /*创建进度加载条*/
function createSpinnerByElement(target, className="spin_panel")
    /*创建进度加载条*/
function registerFixedElement(containerId, elementId, popButtonId,maxWidth,displayStyle="grid",interval=2000)
    /*
    注册元素，使元素在页面低于width时，以fixed的形式浮动显示，并有相关的控制显示隐藏;
    containerId，包含要浮动的元素的上级元素，当点击在浮动元素外的位置时，隐藏浮动元素;
    elementId, 要浮动的元素;
    popButtonId, 控制元素显示的元素；
    maxWidth, 最大切换浮动的网页/设备宽度；
    displayStyle: 显示时的样式
    interval, 节流，避免监听事件影响性能；
    */
function hiddenFixedElement(elementId,maxWidth,displayStyle="grid")
    /*
    根据Width判断元素是否要隐藏
    elementId, 要浮动的元素;
    maxWidth, 最大切换浮动的网页/设备宽度；
    displayStyle: 显示时的样式
    */

# requestor.js

async function fetchWithRetry(requestFunc, retryTimes = 1)
    /*出现401则重试，成功则返回response*/
async function postJson(url, postData)
    /*post传输json数据*/
async function postJsonWithAuth(url, postData)
    /*带重试，Bearer验证的post方法获取Json数据的接口*/
async function putJsonWithAuth(url, postData)
    /*带重试，Bearer验证的put方法获取Json数据的接口*/
async function getJsonWithAuth(url)
    /*带重试，Bearer验证的Get方法获取Json数据的接口*/
async function deleteJsonWithAuth(url)
    /*带重试，Bearer验证的Delete方法获取Json数据的接口*/
async function postFormWithAuth(url, formData)
    /*带重试，Bearer验证的POST方法传输form-data数据的接口*/
async function refreshToken()
    /*更新Token*/