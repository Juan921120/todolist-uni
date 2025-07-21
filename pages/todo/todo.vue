<template>
    <view class="user-container">
        <view class="user-info-bar">
            <image class="user-avatar" src="/static/images/default-user.png" alt="用户头像" />
            <text class="user-name">{{ username }}</text>
        </view>
    </view>

    <view class="header-title">
        TO-DO LIST
    </view>
    <view class="jagged-wrapper">
        <view class="todo-container">

            <view class="todo-input-group">
                <input type="text" placeholder="Add a task" class="todo-input" v-model="inputText" />
                <button class="todo-add-button" @click="addTask">＋</button>
            </view>

            <view v-show="pendingCount >= 1 && filter === 'pending'" class="multipleChange">
                <label class="checkbox">
                    <checkbox @tap="allCheck" :checked="allChecked" />
                    全选
                </label>
                <button class="multipleFinishTask" @tap="multipleFinishTask">批量完成</button>
            </view>

            <!-- 空状态 -->
            <view class="emptyState" v-if="
                (filter === 'pending' && pendingCount === 0) ||
                (filter === 'completed' && finishCount === 0) ||
                (filter === 'all' && allCount === 0)">
                <image src="/static/images/empty-state.png" class="catImg" alt="暂无待办"></image>
                <text> 没有任务哦～</text>
            </view>

            <view v-else>
                <view class="todo-list">
                    <checkbox-group @change="checkboxChange">
                        <view class="todo-item" v-for="task in todoLists" :key="task.id">
                            <label class="checkbox">
                                <checkbox v-show="filter === 'pending'" :value="task.id"
                                    :checked="selectedIds.includes(task.id)" />
                                <text>{{ task.text }}</text>
                            </label>

                            <button title="点击标记为完成" class="closeBtn" v-show="filter === 'pending'"
                                @click="finishTask(task.id)">X</button>
                        </view>
                    </checkbox-group>
                </view>
            </view>

            <view class="footer">
                <view class="total">
                    <text v-if="filter === 'pending'">未完成任务：{{ pendingCount }} </text>
                    <text v-else-if="filter === 'completed'">已完成任务：{{ finishCount }} </text>
                    <text v-else>全部任务：{{ allCount }}</text>
                </view>
                <view class="buttonGroup">
                    <button class="bottomButton" @click="toDoTask"
                        :class="{ activeBtn: filter === 'pending' }">待完成</button>
                    <button class="bottomButton" @click="completedTask"
                        :class="{ activeBtn: filter === 'completed' }">已完成</button>
                    <button class="bottomButton" @click="AllTask" :class="{ activeBtn: filter === 'all' }">全部</button>
                </view>
            </view>
        </view>
    </view>
    <view class="logOut-btn" @click="handleLogout">退出登录</view>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { http } from '../../utils/http.js'

// 用户信息
const username = ref(uni.getStorageSync('username') || '未登录用户')

// 页面状态
const todoLists = ref([])
const filter = ref('pending')
const inputText = ref('')

// 统计数据
const pendingCount = ref(0)
const finishCount = ref(0)
const allCount = ref(0)

// 多选相关
const selectedIds = ref([])
const allChecked = ref(false)

// 加载任务列表
const loadList = async () => {
    try {
        console.log('开始加载列表，当前过滤器：', filter.value)

        let apiResponse
        switch (filter.value) {
            case 'all':
                apiResponse = await http.getTaskAll()
                break
            case 'completed':
                apiResponse = await http.getTaskCompleted()
                break
            case 'pending':
                apiResponse = await http.getTaskPending()
                break
            default:
                console.error('未知的过滤器类型：', filter.value)
                return
        }

        console.log('API 返回的 ApiResponse：', apiResponse)

        // 处理 ApiResponse<List<Task>> 格式: { success: true, message: "xxx", data: [...] }
        if (apiResponse && apiResponse.success) {
            // 成功时，data 就是任务列表数组
            todoLists.value = Array.isArray(apiResponse.data) ? apiResponse.data : []
        } else {
            // 失败时，http 工具已经处理了错误提示
            console.error('获取任务列表失败：', apiResponse?.message)
            todoLists.value = []
        }

        console.log('处理后的任务列表：', todoLists.value)

    } catch (error) {
        console.error('加载任务列表异常：', error)
        todoLists.value = []
        // http 工具已经处理了错误提示，这里不需要再次提示
    }
}

// 获取统计数据
const loadCount = async () => {
    try {
        console.log('开始加载统计数据')
        const apiResponse = await http.getTaskCount()
        console.log('统计API返回的 ApiResponse：', apiResponse)

        // 处理 ApiResponse<CountDTO> 格式: { success: true, message: "xxx", data: { pending: 1, completed: 2, total: 3 } }
        if (apiResponse && apiResponse.success && apiResponse.data) {
            const countData = apiResponse.data
            pendingCount.value = countData.pending || 0
            finishCount.value = countData.completed || 0
            allCount.value = countData.total || 0
        } else {
            // 失败时，http 工具已经处理了错误提示
            console.error('获取统计数据失败：', apiResponse?.message)
            pendingCount.value = 0
            finishCount.value = 0
            allCount.value = 0
        }

        console.log('统计数据：', {
            pending: pendingCount.value,
            completed: finishCount.value,
            total: allCount.value
        })

    } catch (error) {
        console.error('获取统计数据异常：', error)
        pendingCount.value = 0
        finishCount.value = 0
        allCount.value = 0
        // http 工具已经处理了错误提示，这里不需要再次提示
    }
}

// 初始化页面数据
const initPage = async () => {
    try {
        await Promise.all([loadList(), loadCount()])
    } catch (error) {
        console.error('页面初始化失败：', error)
    }
}

// 添加任务
const addTask = async () => {
    const text = inputText.value.trim()
    if (!text) {
        uni.showToast({
            title: '请输入任务内容',
            icon: 'none'
        })
        return
    }

    try {
        console.log('添加任务：', { text, status: false })
        const apiResponse = await http.addTask({
            text,
            status: false
        })
        console.log('添加任务返回的 ApiResponse：', apiResponse)

        // 检查是否成功
        if (apiResponse && apiResponse.success) {
            inputText.value = ''
            await initPage() // 重新加载数据

            uni.showToast({
                title: apiResponse.message || '添加成功',
                icon: 'success'
            })
        }
        // 失败情况已在 http 工具中处理

    } catch (error) {
        console.error('添加任务异常：', error)
        // http 工具已经处理了错误提示，这里不需要再次提示
    }
}

// 切换过滤器
const toDoTask = async () => {
    filter.value = "pending"
    await initPage()
}

const completedTask = async () => {
    filter.value = "completed"
    await initPage()
}

const AllTask = async () => {
    filter.value = "all"
    await initPage()
}

// 完成单个任务
const finishTask = async (id) => {
    try {
        console.log('完成任务：', id)
        const apiResponse = await http.completeTask(id)
        console.log('完成任务返回的 ApiResponse：', apiResponse)

        // 检查是否成功
        if (apiResponse && apiResponse.success) {
            await initPage()
            uni.showToast({
                title: apiResponse.message || '任务已完成',
                icon: 'success'
            })
        }
        // 失败情况已在 http 工具中处理

    } catch (error) {
        console.error('完成任务异常：', error)
        // http 工具已经处理了错误提示，这里不需要再次提示
    }
}

// 批量完成任务
const multipleFinishTask = async () => {
    if (selectedIds.value.length === 0) {
        uni.showToast({
            title: '请选择要完成的任务',
            icon: 'none'
        })
        return
    }

    try {
        console.log('批量完成任务：', selectedIds.value)
        const apiResponse = await http.completeTaskBatch(selectedIds.value)
        console.log('批量完成返回的 ApiResponse：', apiResponse)

        // 检查是否成功
        if (apiResponse && apiResponse.success) {
            selectedIds.value = []
            allChecked.value = false
            await initPage()

            uni.showToast({
                title: apiResponse.message || '批量完成成功',
                icon: 'success'
            })
        }
        // 失败情况已在 http 工具中处理

    } catch (error) {
        console.error('批量完成异常：', error)
        // http 工具已经处理了错误提示，这里不需要再次提示
    }
}

// 需要添加的 checkboxChange 方法
const checkboxChange = (e) => {
    console.log('checkbox change:', e.detail.value)
    selectedIds.value = e.detail.value.map(id => parseInt(id)) // 转换为数字类型
    
    // 更新全选状态
    const pendingTasks = todoLists.value.filter(t => t.status === false)
    allChecked.value = pendingTasks.length > 0 && selectedIds.value.length === pendingTasks.length
}

// 全选/取消全选
const allCheck = () => {
    allChecked.value = !allChecked.value
    if (allChecked.value) {
        selectedIds.value = todoLists.value
            .filter(t => t.status === false)
            .map(t => t.id)
        console.log('全选任务ID：', selectedIds.value)
    } else {
        selectedIds.value = []
    }
}

// 退出登录
const handleLogout = () => {
    uni.removeStorageSync('token')
    uni.removeStorageSync('username')
    uni.navigateTo({
        url: '../login/login'
    })
}

// 页面生命周期
onMounted(() => {
    console.log('页面已挂载，开始初始化')
    initPage()
})

// uni-app 生命周期（如果需要的话）
import { onLoad } from '@dcloudio/uni-app'
onLoad(() => {
    console.log('uni-app onLoad 触发')
    initPage()
})
</script>

<style scoped>
.header-title {
    padding: 10px;
    text-align: center;
    font-family: Comic Sans MS, Arial Rounded MT Bold, sans-serif;
    font-size: 26px;
    color: #ff9980;
}

/* 包装器样式 */
.jagged-wrapper {
    margin: 0 auto;
    position: relative;
    display: block;
    border-radius: 12px;
    overflow: visible;
    width: 90%;
}

.todo-container {
    padding: 50px 40px;
    background: #fff8f0;
    border-radius: 48px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 0;
    border: 12px solid #ffccaa;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.todo-title {
    text-align: center;
    font-size: 24px;
    color: #333;
    margin: 0;
}

.logOut-btn {
    padding-top: 20px;
    text-align: center;
}

.todo-input-group {
    display: flex;
    margin-bottom: 20px;
    border: 3px solid #FEDEB8;
    border-radius: 100px;
    background-color: #fff;
}

.todo-input {
    flex-grow: 1;
    padding: 10px 15px;
    border: none;
    border-radius: 30px 0 0 30px;
    font-size: 16px;
    outline: none;
}

.todo-add-button {
    padding: 10px 24px;
    border: none;
    background-color: #ff9980;
    color: white;
    font-size: 20px;
    border-radius: 0 30px 30px 0;
    cursor: pointer;
    transition: background-color 0.3s;
}

.todo-add-button:hover {
    background-color: #ff7a5a;
}

.todo-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.todo-item {
    background-color: #fff;
    padding: 10px 15px;
    border-radius: 20px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    color: #444;
    justify-content: space-between;
}

.checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    text-align: left;
}

.multipleChange {
    display: flex;
    justify-content: space-between;
}

.multipleChange .checkbox {
    margin-left: 15px;
}

.closeBtn {
    width: 30px;
    height: 30px;
    text-align: center;
    line-height: 20px;
    background-color: #f0e6df;
    color: #ffffff;
    padding: 2px;
}

.footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 30px;
    flex-wrap: wrap;
    gap: 10px;
}

input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    width: 20px;
    height: 20px;
    border: 2px solid #DCC5A2;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
    position: relative;
}

/* 选中状态：背景和边框变色 */
input[type="checkbox"]:checked {
    background-color: #ee5628;
    border-color: #ee5628;
    width: 20px;
    height: 20px;
}

/* 对勾 ✔️ */
input[type="checkbox"]:checked::after {
    content: '';
    position: absolute;
    top: 1px;
    left: 4px;
    width: 6px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    box-sizing: content-box;
}

.bottomButton {
    background-color: #FCCFB6;
    color: white;
    border-radius: 32px;
    margin-left: 10px;
    padding: 10px 20px;
    font-size: 14px;
}

.activeBtn {
    background-color: #E3663D;
}

.multipleFinishTask {
    width: 120px;
    margin-bottom: 10px;
    text-align: center;
    display: block;
    border: 1px solid #ff9980;
    border-radius: 50px;
    background-color: #ffedeb;
    font-size: 14px;
    color: #ff9980;
}

.catImg {
    width: 20%;
    display: block;
    margin: 0 auto;
}


@media screen and (max-width: 600px) {
    .emptyState {
        text-align: center;
    }

    .todo-container {
        font-size: 14px;
        margin: 0 auto;
        padding: 40px 30px;
    }

    .todo-title {
        font-size: 18px;
        text-align: center;
    }

    .todo-input {
        font-size: 14px;
        padding: 8px;
    }

    .checkbox {
        text-align: left;
        width: 70%;
    }

    .footer {
        flex-direction: column;
        align-items: center;
        gap: 16px;
    }

    .total {
        text-align: center;
        width: 100%;
    }

    .buttonGroup {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        width: 100%;
    }

    .bottomButton {
        margin-left: 0;
        width: 80%;
    }
}
</style>