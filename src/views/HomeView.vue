<template>
  <q-layout view="hHh lpR fFf" class="home-view">
    <q-header class="home-view__header bg-white">
      <div class="home-view__control-block">
        <!-- LOGO -->
        <div class="q-mr-lg">
          <logo-wrapper class="text-primary"></logo-wrapper>
        </div>
        <!-- 行事曆控制 -->
        <div class="home-view__date-control">
          <div class="flex items-center q-mr-sm">
            <q-btn outline color="primary" label="今天" @click="moveCalendarDate('today')">
              <q-tooltip class="bg-black text-subtitle2">{{ todayBtnDisplayDate }}</q-tooltip>
            </q-btn>
          </div>
          <div class="flex items-center q-mr-md">
            <q-btn-group outline>
              <q-btn
                outline
                color="primary"
                icon="arrow_left"
                class="q-px-sm"
                @click="moveCalendarDate('prev')"
              >
                <q-tooltip class="bg-black text-subtitle2">往前一月</q-tooltip>
              </q-btn>
              <q-btn
                outline
                color="primary"
                icon="arrow_right"
                class="q-px-sm"
                @click="moveCalendarDate('next')"
              >
                <q-tooltip class="bg-black text-subtitle2">往後一月</q-tooltip>
              </q-btn>
            </q-btn-group>
          </div>
          <div class="flex items-center q-mr-xl">
            <span class="home-view__display-date">{{ headerDisplayDate }}</span>
          </div>
          <!-- 模式切換 -->
          <div class="flex items-center">
            <q-btn-toggle
              v-model="currentCalendarMode"
              toggle-color="primary"
              :options="[
                { label: '月', value: 'dayGridMonth' },
                { label: '週', value: 'dayGridWeek' }
              ]"
            />
          </div>
        </div>
      </div>
      <div class="home-view__user-block flex items-center justify-center">
        <q-avatar text-color="grey" icon="account_circle" font-size="40px" class="cursor-pointer">
          <q-menu :offset="[0, 8]">
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="handleLogout">
                <q-item-section>登出</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-avatar>
      </div>
    </q-header>
    <!-- 行事曆 -->
    <q-page-container class="home-view__calendar-container">
      <FullCalendar ref="calendarRef" class="home-view__calendar" :options="calendarOptions">
        <!-- <template v-slot:dayHeaderContent="arg">
          <b>{{ arg.timeText }}</b>
        </template> -->
        <template v-slot:dayCellContent="arg">
          <div
            :class="{
              'home-view__current-clicked-date': lastClickedDate === getDateStr(arg.date)
            }"
          >
            {{ arg.dayNumberText }}
          </div>
        </template>
        <template v-slot:eventContent="arg">
          <div class="calendar-event" @click="handleClickDateEvent(arg.dateStr, arg.event)">
            <div class="calendar-event__title">{{ arg.event.title }}</div>
            <div class="calendar-event__start-time">
              {{ arg.timeText }}
            </div>
          </div>
        </template>
      </FullCalendar>
    </q-page-container>
    <!-- 資訊視窗 -->
    <q-drawer
      ref="infoDrawerRef"
      v-model="isInfoDrawerOpen"
      side="right"
      :width="400"
      :overlay="false"
    >
      <div class="info-panel">
        <div class="info-panel__header">
          <div class="info-panel__btn">
            <q-btn round flat color="primary" icon="close" @click="toggleInfoDrawer(false)"></q-btn>
          </div>
          <div class="info-panel__btn">
            <q-btn round flat color="primary" icon="more_horiz">
              <q-popup-proxy
                ref="infoPopupProxyRef"
                @before-show="
                  () => {
                    isPendingConfirmDelete = false
                  }
                "
              >
                <div class="popup-query-group">
                  <!-- 操作選擇 -->
                  <template v-if="!isPendingConfirmDelete">
                    <div class="popup-query-group__btn-list">
                      <div class="popup-query-group__btn" @click="handleClickEditEvent">
                        <span>
                          <q-icon name="edit"></q-icon>
                        </span>
                        <span class="popup-query-group__btn-title">編輯</span>
                      </div>
                      <div class="popup-query-group__btn" @click="handleClickDeleteEvent">
                        <span>
                          <q-icon name="delete"></q-icon>
                        </span>
                        <span class="popup-query-group__btn-title">刪除</span>
                      </div>
                    </div>
                  </template>
                  <!-- 確認是否刪除 -->
                  <template v-else>
                    <div class="popup-query-group__title">確定要刪除嗎?</div>
                    <div class="popup-query-group__btn-list">
                      <div class="popup-query-group__btn" @click.stop="confirmDeleteEvent">
                        <span class="popup-query-group__btn-title">刪除</span>
                      </div>
                      <div class="popup-query-group__btn" @click="infoPopupProxyRef?.hide()">
                        <span class="popup-query-group__btn-title">取消</span>
                      </div>
                    </div>
                  </template>
                </div>
              </q-popup-proxy></q-btn
            >
          </div>
        </div>
        <div class="info-panel__attendees flex items-center">
          <!-- 參與者 -->
          <div class="info-panel__attendee">
            <q-avatar
              text-color="grey"
              icon="account_circle"
              font-size="40px"
              class="cursor-pointer"
            ></q-avatar>
          </div>
        </div>
        <!-- 標題 -->
        <div class="info-panel__event-title">
          <div>{{ currentClickedEvent.title }}</div>
        </div>
        <!-- 時間起迄 -->
        <div class="info-panel__event-dates">
          <div class="info-panel__dates-block start">
            <div class="info-panel__dates-date">{{ currentClickedEventStartDatetime.date }}</div>
            <div class="info-panel__dates-time">
              <span>{{ currentClickedEventStartDatetime.time }}</span>
              <span class="info-panel__dates-time-period">{{
                currentClickedEventStartDatetime.timePeriod
              }}</span>
            </div>
          </div>
          <div class="info-panel__dates-arrow">
            <q-icon name="arrow_forward_ios" color="primary"></q-icon>
          </div>
          <div class="info-panel__dates-block">
            <div class="info-panel__dates-date">{{ currentClickedEventEndDatetime.date }}</div>
            <div class="info-panel__dates-time">
              <span>{{ currentClickedEventEndDatetime.time }}</span>
              <span class="info-panel__dates-time-period">{{
                currentClickedEventEndDatetime.timePeriod
              }}</span>
            </div>
          </div>
        </div>
        <!-- 備註 -->
        <div class="info-panel__event-note">
          <span>{{ currentClickedEvent.description }}</span>
        </div>
      </div>
    </q-drawer>
  </q-layout>
  <!-- 編輯對話框 -->
  <q-dialog v-model="isEditDailogOpen">
    <q-card class="edit-dialog-card">
      <q-card-section>
        <q-form ref="editForm" class="edit-form">
          <!-- 標題 -->
          <div class="edit-form__group q-mb-sm">
            <div class="edit-form__group-title">
              <q-icon size="20px"></q-icon>
            </div>
            <div class="edit-form__group-content">
              <q-input
                borderless
                v-model="currentEditEvent.title"
                placeholder="請填寫標題"
                style="font-size: 24px"
              />
            </div>
          </div>
          <!-- 時間起迄 -->
          <div class="edit-form__group q-mb-md">
            <div class="edit-form__group-title">
              <q-icon name="date_range" size="20px" color="primary"></q-icon>
            </div>
            <div class="edit-form__group-content flex column items-start">
              <span class="text-grey-5 q-mr-sm">開始時間</span>
              <!-- 開始日期/時間 -->
              <div class="flex items-center q-mb-sm">
                <span class="edit-form__date-input-wrapper q-mr-sm">
                  <q-input
                    filled
                    v-model="currentEditEvent.startDate"
                    mask="date"
                    :rules="['date']"
                    hide-bottom-space
                    dense
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="currentEditEvent.startDate" no-unset>
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup label="Close" color="primary" flat />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </span>
                <span class="edit-form__time-input-wrapper">
                  <q-input
                    filled
                    v-model="currentEditEvent.startTime"
                    mask="time"
                    :rules="['time']"
                    hide-bottom-space
                    dense
                  >
                    <template v-slot:append>
                      <q-icon name="access_time" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-time v-model="currentEditEvent.startTime">
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup label="Close" color="primary" flat />
                            </div>
                          </q-time>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </span>
              </div>
              <span class="text-grey-5 q-mr-sm">結束時間</span>
              <!-- 結束日期/時間 -->
              <div class="flex items-center">
                <span class="edit-form__date-input-wrapper q-mr-sm">
                  <q-input
                    filled
                    v-model="currentEditEvent.endDate"
                    mask="date"
                    :rules="['date']"
                    hide-bottom-space
                    dense
                  >
                    <template v-slot:append>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-date v-model="currentEditEvent.endDate" no-unset>
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup label="Close" color="primary" flat />
                            </div>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </span>
                <span class="edit-form__time-input-wrapper">
                  <q-input
                    filled
                    v-model="currentEditEvent.endTime"
                    mask="time"
                    :rules="['time']"
                    hide-bottom-space
                    dense
                  >
                    <template v-slot:append>
                      <q-icon name="access_time" class="cursor-pointer">
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                          <q-time v-model="currentEditEvent.endTime">
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup label="Close" color="primary" flat />
                            </div>
                          </q-time>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </span>
              </div>
            </div>
          </div>
          <!-- 描述 -->
          <div class="edit-form__group">
            <div class="edit-form__group-title">
              <q-icon name="description" size="20px" color="grey-7"></q-icon>
            </div>
            <div class="edit-form__group-content">
              <q-input
                v-model="currentEditEvent.description"
                filled
                type="textarea"
                class="full-width"
                placeholder="備註"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
      <q-card-section align="right">
        <div class="flex items-center justify-between full-width">
          <div class="flex items-center">
            <!-- 刪除按鈕 -->
            <!-- <q-btn
              outline
              color="red"
              icon="delete"
              style="padding: 4px 8px"
              v-if="currentEditEvent.id"
            >           
            </q-btn> -->
          </div>
          <div class="flex items-center">
            <q-btn label="取消" outline color="primary" v-close-popup class="q-mr-md" />
            <q-btn
              color="primary"
              label="保存"
              @click="handleClickDialogConfirm"
              :disable="!isEditFormFilled"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import LogoWrapper from '@/components/LogoWrapper.vue'
/* types */
import type { ITodoEvent } from '@/types/todo-events'
/* composables */
import { useCommon } from '@/composables/useCommon'
/* firebase */
import { signOut } from 'firebase/auth'
import { collection, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { useFirebaseAuth, useCurrentUser, useFirestore, useCollection, useDocument } from 'vuefire'
/* quasar */
import { useQuasar, date as qusarDateUtils, QPopupProxy, QDrawer } from 'quasar'
/* full-calendar */
// import '@fullcalendar/core/vdom'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import zhtw from '@fullcalendar/core/locales/zh-TW'
import type {
  CalendarOptions,
  EventSourceInput,
  EventInput,
  EventDropArg
} from '@fullcalendar/core'
import type { DateClickArg } from '@fullcalendar/interaction'

const { getDayOfWeek, getTimePeriod } = useCommon()
const $q = useQuasar()

// #region 授權實體/資料庫連線實體
const auth = useFirebaseAuth() // 目前的授權實體
const db = useFirestore() // 資料庫連線實體

/**
 * 處理登出
 */
const handleLogout = () => {
  if (!auth) return

  $q.loading.show({ message: '登入中' })
  signOut(auth)
    .then(() => {
      // Sign-out successful.
      window.location.reload()
    })
    .catch((error) => {
      // An error happened.
    })
    .finally(() => {
      $q.loading.hide()
    })
}
// #endregion 授權實體/資料庫連線實體

// #region 使用者資料
const currentUser = useCurrentUser() // 目前的使用者
/**
 * 目前的使用者文檔(document)
 */
const currentUserDoc = useDocument(doc(collection(db, 'users'), currentUser.value?.uid))
// #endregion 使用者資料

// #region FullCalendar
// 實體參照: 用於透過提供的函式來控制或設定行事曆
const calendarRef = ref<InstanceType<typeof FullCalendar>>()
// 參數設定
const calendarOptions = reactive<CalendarOptions>({
  locales: [zhtw],
  locale: 'zh-TW',
  plugins: [
    dayGridPlugin,
    timeGridPlugin,
    interactionPlugin // needed for dateClick
  ],
  headerToolbar: false,
  // headerToolbar: {
  //   left: 'prev,next today',
  //   center: 'title',
  //   right: 'dayGridMonth,timeGridWeek,timeGridDay'
  // },
  initialView: 'dayGridMonth',
  // initialEvents: INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
  editable: false,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  events: [],
  dateClick: function (info: DateClickArg) {
    console.log(info)
    if (lastClickedDate.value === info.dateStr) {
      handleEditDialog(info.dateStr, null)
    }
    setLastClickedDate(info.dateStr)
  },
  eventDrop: function (info: EventDropArg) {
    console.log(info)
  }
  // select: this.handleDateSelect,
  // eventClick: this.handleEventClick,
  // eventsSet: this.handleEvents
  /* you can update a remote database when these fire:
  eventAdd:
  eventChange:
  eventRemove:
  */
})

// 目前日期
const currentCalendarDate = ref<Date>()
// Header呈現日期
const headerDisplayDate = computed(() => {
  return qusarDateUtils.formatDate(currentCalendarDate.value, 'YYYY年MM月')
})
// 今天按鈕呈現日期
const todayBtnDisplayDate = computed(() => {
  return qusarDateUtils.formatDate(new Date(), 'YYYY年MM月DD日 ddd')
})
/**
 * 更新目前日期
 * 1. 當有切換日期時，重新透過API取得行事曆的當前日期。
 */
const updateCurrentCalendarDate = () => {
  currentCalendarDate.value = calendarRef.value?.getApi().getDate()
}

/**
 * 移動行事曆日期
 * @param {string} action
 */
const moveCalendarDate = (action: string) => {
  switch (action) {
    case 'today':
      calendarRef.value?.getApi().today()
      break
    case 'prev':
      calendarRef.value?.getApi().prev()
      break
    case 'next':
      calendarRef.value?.getApi().next()
      break
  }
  updateCurrentCalendarDate()
}

// 目前行事曆模式
const currentCalendarMode = ref<string>('dayGridMonth')
/**
 * 觀察
 * 1. 切換行事曆模式
 */
watch(currentCalendarMode, (value: string) => {
  calendarRef.value?.getApi().changeView(value)
})

/**
 * 處理插入行事曆事件
 * @param {ITodoEvent[]} eventList
 */
const handleInsertCalendarEvents = (eventList: ITodoEvent[]) => {
  console.log('handleInsertCalendarEvents', eventList)
  // 判斷是否為陣列(處理ts)
  if (Array.isArray(calendarOptions.events)) {
    const calendarOptionsEvents = calendarOptions.events as EventInput
    eventList.forEach((event: ITodoEvent) => {
      // 整理要加入的物件資料
      const data = {
        id: event.id,
        title: event.title,
        start: new Date(`${event.startDate} ${event.startTime}`),
        end: new Date(`${event.endDate} ${event.endTime}`),
        extendedProps: { ...event }
      }
      /**
       * 透過id查找是否已存在事件
       * 1. id: firestore自動產生的
       */
      const findEvent = calendarOptionsEvents.find((evt: ITodoEvent) => evt.id === event.id)
      if (findEvent) {
        // 有找到=>更新資料
        Object.assign(findEvent, data)
      } else {
        // 找不到=>加入陣列
        calendarOptionsEvents.push(data)
      }
    })
  } else {
    $q.notify({ type: 'negative', message: '行事曆事件容器錯誤' })
  }
}
/**
 * 透過id查找並刪除事件
 * @param {string} targetEventId 目標事件id
 */
const deleteEventById = (targetEventId: string) => {
  if (Array.isArray(calendarOptions.events)) {
    const calendarOptionsEvents = calendarOptions.events as EventInput
    const eventIndex = calendarOptionsEvents.findIndex(
      (evt: ITodoEvent) => evt.id === targetEventId
    )
    if (eventIndex !== -1) {
      calendarOptionsEvents.splice(eventIndex, 1)
    }
  }
}

/**
 * 最後點擊的日期
 */
const lastClickedDate = ref<string>('')
/**
 * 設定最後點擊的日期
 * @param {string} dateStr
 */
const setLastClickedDate = (dateStr: string) => {
  lastClickedDate.value = dateStr
}
/**
 * 取得日期字串(YYYY-MM-DD)
 * @param {Date} date
 */
const getDateStr = (date: Date) => {
  return qusarDateUtils.formatDate(date, 'YYYY-MM-DD')
}
// #endregion FullCalendar

// #region 待辦事項
// 目前使用者的待辦事項列表
const currentUserEvents = useCollection(collection(db, `users/${currentUser.value?.uid}/events`))
// console.log(currentUserEvents)
/**
 * 觀察異動: 目前使用者的待辦事項列表
 */
watch(
  currentUserEvents,
  (value) => {
    handleInsertCalendarEvents(value as ITodoEvent[])
  },
  { deep: true }
)

// 是否編輯對話框開啟
const isEditDailogOpen = ref<boolean>(false)
// 預設內容
const defaultEventContent = reactive({
  id: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  title: '',
  description: '',
  isRemind: false
})
// 目前編輯的待辦事項
const currentEditEvent = reactive<ITodoEvent>({
  ...defaultEventContent
})
// 是否編輯表單已填寫(必要欄位)
const isEditFormFilled = computed(() => {
  return (
    currentEditEvent.title &&
    currentEditEvent.startDate &&
    currentEditEvent.startTime &&
    currentEditEvent.endDate &&
    currentEditEvent.endTime
  )
})
/**
 * 處理編輯對話框
 * @param {string} dateStr
 * @param {EventInput | null} data
 */
const handleEditDialog = (dateStr: string, data: EventInput | null) => {
  if (data) {
    Object.assign(currentEditEvent, { ...data.extendedProps, id: data.id })
  } else {
    /**
     * 處理新增
     * 1. 理論上要依當日已安排的事項去推算時間，但目前先跳過。
     */
    const clickedDate = new Date(dateStr) // 點選到的日期
    const currentTime = qusarDateUtils.formatDate(new Date(), 'HH:mm') // 當前的時間
    // 當前的時間+1小時
    const currentDateHourLater = qusarDateUtils.addToDate(new Date(`${dateStr} ${currentTime}`), {
      hour: 1
    })
    Object.assign(currentEditEvent, {
      id: '',
      startDate: qusarDateUtils.formatDate(clickedDate, 'YYYY/MM/DD'),
      startTime: currentTime,
      endDate: qusarDateUtils.formatDate(clickedDate, 'YYYY/MM/DD'),
      endTime: qusarDateUtils.formatDate(currentDateHourLater, 'HH:mm'),
      title: '',
      description: ''
    })
  }
  isEditDailogOpen.value = true // 開啟對話框
}
/**
 * 處理點擊: 對話框確認
 */
const handleClickDialogConfirm = async () => {
  console.log('handleClickDialogConfirm')

  // 準備儲存的文檔資料
  const documentData = {
    title: currentEditEvent.title,
    description: currentEditEvent.description,
    startDate: currentEditEvent.startDate,
    startTime: currentEditEvent.startTime,
    endDate: currentEditEvent.endDate,
    endTime: currentEditEvent.endTime
  }
  $q.loading.show({ message: '保存中' })
  // 判斷有無id(無=>新增)
  if (!currentEditEvent.id) {
    await addDoc(collection(db, `users/${currentUser.value?.uid}/events`), { ...documentData })
    $q.notify({ type: 'positive', message: '新增成功' })
  } else {
    const targetEventRef = doc(db, `users/${currentUser.value?.uid}/events`, currentEditEvent.id)
    await updateDoc(targetEventRef, {
      ...documentData
    })
    $q.notify({ type: 'positive', message: '更新成功' })
  }
  $q.loading.hide()
  isEditDailogOpen.value = false
}
// #endregion 待辦事項

// #region 資訊視窗開啟
const infoDrawerRef = ref<InstanceType<typeof QDrawer>>()
// 是否資訊視窗開啟
const isInfoDrawerOpen = ref<boolean>(false)
/**
 * 開關資訊視窗
 * @param {boolean} status
 */
const toggleInfoDrawer = (status: boolean) => {
  console.log('toggleInfoDrawer', status)
  isInfoDrawerOpen.value = status
  handleDrawerToggle()
}
// 開啟資訊視窗的定時器
const drawerToggleInterval = ref<NodeJS.Timeout>()
const stopDrawerToggleTimeout = ref<NodeJS.Timeout>()
/**
 * 處理資訊視窗的開關
 */
const handleDrawerToggle = () => {
  if (drawerToggleInterval.value) {
    clearInterval(drawerToggleInterval.value)
  }
  if (stopDrawerToggleTimeout.value) {
    clearTimeout(stopDrawerToggleTimeout.value)
  }

  /**
   * 設定interval定時執行更新FullCalendar的尺寸
   * 1. 忽略效能問題，使其看起來流暢。
   */
  drawerToggleInterval.value = setInterval(() => {
    calendarRef.value?.getApi().updateSize()
  }, 1)
  /**
   * q-drawer開啟時的CSS transition是0.3秒，所以在那之後把定時更新的interval停止。
   */
  stopDrawerToggleTimeout.value = setTimeout(() => {
    clearInterval(drawerToggleInterval.value)
  }, 310)
}
// 詢問是否刪除的QPopupProxy實體參照
const infoPopupProxyRef = ref<InstanceType<typeof QPopupProxy>>()
// 目前點擊事件的日期字串
const currentClickedEventDateStr = ref<string>('')
// 目前點擊事件的內容(FullCalendar)
const currentClickedEventInput = ref<EventInput | null>(null)
// 目前點擊的事件
const currentClickedEvent = reactive<ITodoEvent>({
  ...defaultEventContent
})
// 目前點擊的事件: 開始日期時間
const currentClickedEventStartDatetime = reactive({
  date: '',
  time: '',
  timePeriod: ''
})
// 目前點擊的事件: 結束日期時間
const currentClickedEventEndDatetime = reactive({
  date: '',
  time: '',
  timePeriod: ''
})

/**
 * 處理點擊日期事件
 * @param {string} dateStr
 * @param {EventInput} data
 */
const handleClickDateEvent = (dateStr: string, data: EventInput) => {
  console.log('handleClickDateEvent', dateStr, data)

  currentClickedEventDateStr.value = dateStr
  currentClickedEventInput.value = data
  // 設定開始日期時間
  currentClickedEventStartDatetime.date = qusarDateUtils.formatDate(
    data.start as Date,
    'YYYY/M/D (ddd)'
  )
  // currentClickedEventStartDatetime.date += getDayOfWeek()
  currentClickedEventStartDatetime.time = qusarDateUtils.formatDate(data.start as Date, 'h:mm')
  currentClickedEventStartDatetime.timePeriod = getTimePeriod(
    qusarDateUtils.formatDate(data.start as Date, 'A')
  )
  // 設定結束日期時間
  currentClickedEventEndDatetime.date = qusarDateUtils.formatDate(
    data.end as Date,
    'YYYY/M/D (ddd)'
  )
  currentClickedEventEndDatetime.time = qusarDateUtils.formatDate(data.end as Date, 'h:mm')
  currentClickedEventEndDatetime.timePeriod = getTimePeriod(
    qusarDateUtils.formatDate(data.end as Date, 'A')
  )

  Object.assign(currentClickedEvent, { ...data.extendedProps, id: data.id })
  toggleInfoDrawer(true)
}

/**
 * 處理點擊: 編輯事件
 */
const handleClickEditEvent = () => {
  handleEditDialog(currentClickedEventDateStr.value, currentClickedEventInput.value)
  infoPopupProxyRef.value?.hide()
}

// 是否等待確認刪除
const isPendingConfirmDelete = ref<boolean>(false)
/**
 * 處理點擊: 刪除事件
 */
const handleClickDeleteEvent = () => {
  isPendingConfirmDelete.value = true
}
/**
 * 處理刪除待辦事項
 */
const confirmDeleteEvent = async () => {
  if (currentClickedEvent) {
    $q.loading.show({ message: '刪除中' })
    await deleteDoc(doc(db, `users/${currentUser.value?.uid}/events`, currentClickedEvent.id))
    $q.loading.hide()    
    toggleInfoDrawer(false)
    infoPopupProxyRef.value?.hide()
    deleteEventById(currentClickedEvent.id)
    $q.notify({ type: 'positive', message: '刪除成功' })
  }
}
// #endregion 資訊視窗開啟

onMounted(() => {
  // 頁面掛載後，先初始化顯示日期。
  updateCurrentCalendarDate()
})
</script>
