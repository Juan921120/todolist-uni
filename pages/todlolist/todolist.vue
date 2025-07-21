```vue
<template>
  <view class="page">
    <view class="user-container">
      <view class="user-info-bar">
        <image class="user-avatar" src="/static/images/default-user.png" mode="aspectFill" />
        <text class="user-name">{{ username }}</text>
      </view>
    </view>

    <view class="header-title">TO-DO LIST</view>

    <view class="jagged-wrapper">
      <view class="todo-container">
        <!-- 添加任务 -->
        <view class="todo-input-group">
          <input
            type="text"
            placeholder="Add a task"
            class="todo-input"
            v-model="inputText"
            @confirm="addTask"
          />
          <button class="todo-add-button" @click="addTask">＋</button>
        </view>

        <!-- 批量操作 -->
        <view v-show="pendingCount >= 1 && filter === 'pending'" class="multipleChange">
          <label class="checkbox">
            <checkbox @click="allCheck" :checked="allChecked" />
            <text>全选</text>
          </label>
          <button class="multipleFinishTask" @click="multipleFinishTask">批量完成</button>
        </view>

        <!-- 空状态 -->
        <view class="emptyState" v-if="todoLists.length === 0">
          <image src="/static/images/empty-state.png" class="catImg" mode="aspectFit" />
          <view>没有任务哦～</view>
        </view>

        <!-- 列表 -->
        <view v-else>
          <view class="todo-list">
            <view class="todo-item" v-for="task in todoLists" :key="task.id">
              <label class="checkbox">
                <checkbox
                  v-show="filter === 'pending'"
                  v-model="selectedIds"
                  :value="task.id"
                />
                <text>{{ task.text }}</text>
              </label>
              <button
                class="closeBtn"
                v-show="filter === 'pending'"
                @click="finishTask(task.id)"
              >
                X
              </button>
            </view>
          </view>
        </view>

        <!-- 底部统计与切换 -->
        <view class="footer">
          <view class="total">
            <text v-if="filter === 'pending'">未完成任务：{{ pendingCount }}</text>
            <text v-else-if="filter === 'completed'">已完成任务：{{ finishCount }}</text>
            <text v-else>全部任务：{{ allCount }}</text>
          </view>
          <view class="buttonGroup">
            <button
              class="bottomButton"
              @click="toDoTask"
              :class="{ activeBtn: filter === 'pending' }"
            >
              待完成
            </button>
            <button
              class="bottomButton"
              @click="completedTask"
              :class="{ activeBtn: filter === 'completed' }"
            >
              已完成
            </button>
            <button
              class="bottomButton"
              @click="AllTask"
              :class="{ activeBtn: filter === 'all' }"
            >
              全部
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logOut-btn" @click="handleLogout">
      <text>退出登录</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import request from '@/utils/request.js'

const username = ref(uni.getStorageSync('username') || '未登录用户')
const todoLists = ref([])
const pendingCount = ref(0)
const finishCount = ref(0)
const allCount = ref(0)
const inputText = ref('')
const filter = ref('pending')
const selectedIds = ref([])
const allChecked = ref(false)

const loadList = async () => {
  try {
    let path = '/task/pending'
    if (filter.value === 'completed') path = '/task/completed'
    else if (filter.value === 'all') path = '/task/all'

    const res = await request.get(path)
    // 兼容后端返回 { success, message, data }
    let list = []
    if (res && res.success && Array.isArray(res.data)) {
      list = res.data
    } else if (res && res.success && res.data && Array.isArray(res.data.list)) {
      list = res.data.list
    }
    todoLists.value = list
  } catch (err) {
    console.error('加载任务失败:', err)
    uni.showToast({ title: '加载失败', icon: 'error' })
  }
}

const fetchCounts = async () => {
  try {
    const res = await request.get('/task/count')
    // 兼容后端返回 { success, message, data }
    const d = (res && res.success && res.data) ? res.data : {}
    pendingCount.value = d.pending || 0
    finishCount.value = d.completed || 0
    allCount.value = d.total || 0
  } catch (err) {
    console.error('统计失败：', err)
  }
}

onLoad(() => {
  loadList()
  fetchCounts()
})

const addTask = async () => {
  const text = inputText.value.trim()
  if (!text) return
  try {
    await request.post('/task/add', { text, status: false })
    inputText.value = ''
    await loadList()
    await fetchCounts()
    uni.showToast({ title: '添加成功', icon: 'success' })
  } catch (err) {
    console.error('添加任务失败:', err)
    uni.showToast({ title: '添加失败', icon: 'error' })
  }
}

const toDoTask = () => {
  filter.value = 'pending'
  loadList()
  fetchCounts()
}

const completedTask = () => {
  filter.value = 'completed'
  loadList()
  fetchCounts()
}

const AllTask = () => {
  filter.value = 'all'
  loadList()
  fetchCounts()
}

const finishTask = async (id) => {
  try {
    await request.put(`/task/complete/${id}`)
    await loadList()
    await fetchCounts()
    uni.showToast({ title: '完成任务', icon: 'success' })
  } catch (err) {
    console.error('完成任务失败:', err)
    uni.showToast({ title: '操作失败', icon: 'error' })
  }
}

const multipleFinishTask = async () => {
  if (!selectedIds.value.length) {
    uni.showToast({ title: '请选择任务', icon: 'none' })
    return
  }
  try {
    await request.put('/task/complete/batch', selectedIds.value)
    await loadList()
    await fetchCounts()
    selectedIds.value = []
    allChecked.value = false
    uni.showToast({ title: '批量完成成功', icon: 'success' })
  } catch (err) {
    console.error('批量完成失败:', err)
    uni.showToast({ title: '操作失败', icon: 'error' })
  }
}

const allCheck = () => {
  allChecked.value = !allChecked.value
  selectedIds.value = allChecked.value
    ? todoLists.value.filter(t => !t.status).map(t => t.id)
    : []
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: res => {
      if (res.confirm) {
        uni.removeStorageSync('token')
        uni.removeStorageSync('username')
        uni.reLaunch({ url: '/pages/login/login' })
      }
    }
  })
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background-image:
    url('/static/images/cat-paw.png'),
    url('/static/images/cat-paw.png');
  background-size: 80px 80px, 80px 80px;
  background-repeat: repeat, repeat;
  background-color: #FFEEE2;
  font-family: 'Comic Sans MS', 'Arial Rounded MT Bold', sans-serif;
  padding-top: 30px;
}

.user-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.user-info-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px 20px;
  border-radius: 20px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.user-name {
  font-size: 16px;
  color: #333;
  font-weight: bold;
}

.header-title {
  padding: 10px;
  text-align: center;
  font-size: 26px;
  color: #ff9980;
}

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
  border: 12px solid #ffccaa;
}

.todo-input-group {
  display: flex;
  margin-bottom: 20px;
  border: 3px solid #FEDEB8;
  border-radius: 100px;
  background-color: #fff;
}

.todo-input {
  flex: 1;
  padding: 10px 15px;
  border: none;
  border-radius: 30px 0 0 30px;
  font-size: 16px;
  background-color: transparent;
}

.todo-add-button {
  padding: 10px 24px;
  border: none;
  background-color: #ff9980;
  color: white;
  font-size: 20px;
  border-radius: 0 30px 30px 0;
}

.todo-list {
  margin: 0;
  padding: 0;
}

.todo-item {
  background-color: #fff;
  padding: 10px 15px;
  border-radius: 20px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  color: #444;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.multipleChange {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.multipleChange .checkbox {
  margin-left: 15px;
}

.closeBtn {
  width: 30px;
  height: 30px;
  background-color: #f0e6df;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  color: white;
}

.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  flex-wrap: wrap;
  gap: 10px;
}

.bottomButton {
  background-color: #FCCFB6;
  color: white;
  border-radius: 32px;
  margin-left: 10px;
  padding: 10px 20px;
  font-size: 14px;
  border: none;
}

.activeBtn {
  background-color: #E3663D;
}

.multipleFinishTask {
  width: 120px;
  text-align: center;
  border: 1px solid #ff9980;
  border-radius: 50px;
  background-color: #ffedeb;
  font-size: 14px;
  color: #ff9980;
  padding: 8px;
}

.catImg {
  width: 20%;
  display: block;
  margin: 0 auto;
}

.emptyState {
  text-align: center;
  color: #999;
}

.logOut-btn {
  padding: 20px;
  text-align: center;
}

.logOut-btn text {
  color: #ff9980;
  font-size: 16px;
}

@media screen and (max-width: 600px) {
  .todo-container {
    padding: 40px 30px;
    font-size: 14px;
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

