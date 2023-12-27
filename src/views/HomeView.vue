<template>
  <div class="home-view">
    <div class="home-view__header">
      <div class="home-view__control-block">
        <div>
          <logo-wrapper class="text-primary"></logo-wrapper>
        </div>
        <div></div>
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
    </div>
    <div class="home-view__body"></div>
  </div>
</template>

<script setup lang="ts">
import LogoWrapper from '@/components/LogoWrapper.vue'
/* firebase */
import { getAuth, signOut } from 'firebase/auth'
/* quasar */
import { useQuasar } from 'quasar'
/* full-calendar */
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import zhtw from '@fullcalendar/core/locales/zh-TW'

const $q = useQuasar()

// #region 處理登出
const handleLogout = () => {
  const auth = getAuth()

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
// #endregion 處理登出

// #region 行事曆
// #endregion 行事曆
</script>
