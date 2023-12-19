<template>
  <div class="login-view flex justify-center items-center">
    <div class="login-view__container">
      <q-form ref="inputForm" class="login-view__form">
        <div class="login-view__form-title">註冊帳號</div>
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
          />
        </div>
        <div class="login-view__form-input q-mb-md">
          <q-input
            filled
            v-model="password"
            :type="isPassword ? 'password' : 'text'"
            placeholder="密碼"
            :rules="[(val) => !!val || '*必須填寫']"
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
        <div class="login-view__form-input q-mb-sm">
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
        <div class="login-view__validate-list q-mb-sm">
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
        <q-btn
          color="primary"
          label="送出"
          class="full-width q-mt-md"
          :disable="!isEmailFormatCorrect || !isPasswordLengthCompliance || !isPasswordSame"
          @click="handleSubmit"
        />
      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useCurrentUser, useFirebaseAuth } from 'vuefire'
import { QForm, patterns } from 'quasar'
import { aU } from 'node_modules/@fullcalendar/core/internal-common'

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
watch([password, confirmPassword], (values: string[]) => {
  //
})

/**
 * 處理送出表單
 */
const handleSubmit = async () => {
  const validateFormResult = await inputForm.value?.validate()
  if (!validateFormResult) {
    return
  }

  handleCreateUser()
}
// #endregion 表單輸入

// #region firebase
// const auth = getAuth();
const auth = useFirebaseAuth()
console.log(auth)

/**
 * 處理建立使用者
 */
const handleCreateUser = () => {
  console.log('handleCreateUser')
  if (!auth) {
    return
  }

  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then((userCredential) => {
      const user = userCredential.user
      console.log(user)
    })
    .catch((error) => {
      const errorCode = error.code
      const errorMessage = error.message
      console.log(error)
    })
}
// #endregion firebase
</script>
