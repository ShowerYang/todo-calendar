<template>
  <div class="login-view">
    <div class="login-view__header">
      <!-- <div class="login-view__logo-wrapper">
        <q-icon name="event" size="36px" class="q-mr-sm"></q-icon>
        <span>待辦行事曆</span>
      </div> -->
      <logo-wrapper class="text-white"></logo-wrapper>
      <div class="flex items-center">
        <q-btn
          rounded
          outline
          :label="currentRoute === 'signup' ? '登入' : '免費註冊'"
          :style="{ color: 'white' }"
          @click="handleSwitchPage(currentRoute)"
        ></q-btn>
      </div>
    </div>
    <div class="login-view__body">
      <div class="login-view__form-wrapper">
        <q-form ref="inputForm" class="login-view__form">
          <div class="login-view__form-title">
            {{ currentRoute === 'signup' ? '註冊帳號' : '登入' }}
          </div>
          <div class="login-view__form-input q-mb-md">
            <q-input
              filled
              v-model="email"
              placeholder="電子信箱"
              :rules="[
                (val) => !!val || '*必須填寫',
                (val) => patterns.testPattern.email(val) || '*e-mail格式錯誤'
              ]"
              clearable
              id="inputEmail"
            />
          </div>
          <div class="login-view__form-input q-mb-md">
            <q-input
              filled
              v-model="password"
              :type="isPassword ? 'password' : 'text'"
              placeholder="密碼"
              :rules="[(val) => !!val || '*必須填寫']"
              autocomplete="on"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPassword ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  @click="isPassword = !isPassword"
                  v-show="password"
                /> </template
            ></q-input>
          </div>
          <div class="login-view__form-input q-mb-sm" v-if="currentRoute === 'signup'">
            <q-input
              filled
              v-model="confirmPassword"
              :type="isConfirmPassword ? 'password' : 'text'"
              placeholder="確認密碼"
              :rules="[(val) => !!val || '*必須填寫']"
            >
              <template v-slot:append>
                <q-icon
                  :name="isConfirmPassword ? 'visibility' : 'visibility_off'"
                  class="cursor-pointer"
                  @click="isConfirmPassword = !isConfirmPassword"
                  v-show="confirmPassword"
                />
              </template>
            </q-input>
          </div>
          <!-- 驗證項目 -->
          <div class="login-view__validate-list q-mb-sm" v-if="currentRoute === 'signup'">
            <div class="login-view__validate-group">
              <div class="login-view__validate-group-icon">
                <q-icon
                  :name="isPasswordLengthCompliance ? 'check_circle' : 'check_circle_outline'"
                  :color="isPasswordLengthCompliance ? 'primary' : 'grey'"
                  size="20px"
                ></q-icon>
              </div>
              <div
                class="login-view__validate-group-title"
                :class="{ disabled: !isPasswordLengthCompliance }"
              >
                至少4個字元
              </div>
            </div>
            <div class="login-view__validate-group">
              <div class="login-view__validate-group-icon">
                <q-icon
                  :name="isPasswordSame ? 'check_circle' : 'check_circle_outline'"
                  :color="isPasswordSame ? 'primary' : 'grey'"
                  size="20px"
                ></q-icon>
              </div>
              <div class="login-view__validate-group-title" :class="{ disabled: !isPasswordSame }">
                相符的密碼
              </div>
            </div>
          </div>
          <!-- 註冊帳號 -->
          <q-btn
            color="primary"
            label="送出"
            class="full-width q-mt-md"
            :disable="!isEmailFormatCorrect || !isPasswordLengthCompliance || !isPasswordSame"
            @click="handleSubmit"
            v-if="currentRoute === 'signup'"
          />
          <!-- 登入 -->
          <q-btn
            color="primary"
            label="送出"
            class="full-width q-mt-xs"
            :disable="!isEmailFormatCorrect"
            @click="handleLogin"
            v-else
          />
        </q-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LogoWrapper from '@/components/LogoWrapper.vue'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect
} from 'firebase/auth'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'
import { QForm, patterns, useQuasar } from 'quasar'

const $q = useQuasar()

// #region 處理路由
const route = useRoute()
// 目前路由頁面
const currentRoute = computed(() => {
  return route.name as string
})

const router = useRouter()

/**
 * 處理切換頁面
 * @param {string} currentRouteName
 */
const handleSwitchPage = (currentRouteName: string) => {
  const targetRoute = currentRouteName === 'signin' ? 'signup' : 'signin'
  router.push({ name: targetRoute })
}
// #endregion 處理路由

// #region 表單輸入
const inputForm = ref<InstanceType<typeof QForm>>() // 表單ref

const email = ref<string>('')
const isEmailFormatCorrect = computed(() => {
  return !!email.value && patterns.testPattern.email(email.value)
})

const password = ref<string>('') // 密碼
const isPassword = ref<boolean>(true) // 是否密碼隱藏(true: 隱藏)
const confirmPassword = ref<string>('') // 確認密碼
const isConfirmPassword = ref<boolean>(true) // 是否確認密碼隱藏(true: 隱藏)

const minPasswordLength = ref<number>(4) // 最少密碼長度
// 是否密碼長度符合
const isPasswordLengthCompliance = computed(() => {
  return password.value.length >= minPasswordLength.value
})
// 是否密碼輸入相同
const isPasswordSame = computed(() => {
  return (
    ![password.value, confirmPassword.value].includes('') &&
    password.value === confirmPassword.value
  )
})

/**
 * 處理送出
 * 1. 註冊帳號
 */
const handleSubmit = async () => {
  const validateFormResult = await inputForm.value?.validate()
  if (!validateFormResult) {
    return
  }

  handleCreateUserWuthEmail()
}

/**
 * 處理登入
 */
const handleLogin = async () => {
  const validateFormResult = await inputForm.value?.validate()
  if (!validateFormResult) {
    return
  }

  handleSigninWithEmail()
}
// #endregion 表單輸入

// #region firebase
// const auth = getAuth();
const auth = useFirebaseAuth()
console.log(auth)

/**
 * 處理以email建立使用者
 */
const handleCreateUserWuthEmail = () => {
  console.log('handleCreateUserWuthEmail')
  if (!auth) {
    return
  }

  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      const user = userCredential.user
      console.log(user)
    })
    .catch((error) => {
      console.log(error)
      const errorCode = error.code
      const errorMessage = error.message
    })
}

/**
 * 處理以email登入
 */
const handleSigninWithEmail = () => {
  console.log('handleSigninWithEmail')
  if (!auth) {
    return
  }

  $q.loading.show({ message: '登入中' })
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user
      // console.log(user)
      router.push({ name: 'home' })
    })
    .catch((error) => {
      const errorCode = error.code
      const errorMessage = error.message
      console.log(errorMessage)
      $q.notify({ type: 'negative', message: errorMessage })
    })
    .finally(() => {
      $q.loading.hide()
    })
}
// #endregion firebase
</script>
