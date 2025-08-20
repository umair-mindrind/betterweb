<script setup>
import { ref, reactive } from "vue"
import { validateAuth } from "@/validations/authValidation.js"
import AppInput from "@/components/AppInput.vue"
import AppButton from "@/components/AppButton.vue"
import SegmentedControl from "@/components/SegmentedControl.vue"
import LoginNavbar from "@/pages/Navbar/LoginNavbar.vue"
import AppFooter from "@/components/AppFooter.vue"
import SocialButton from "@/components/SocialButton.vue"
import bgImage from "@/assets/images/background-image.svg"

// Form fields
const name = ref("")
const email = ref("")
const password = ref("")
const confirmPassword = ref("")
const errors = reactive({})

// Pass type = 'register' to validate name & confirmPassword
const handleSubmit = () => {
  Object.keys(errors).forEach(key => delete errors[key])

  const validationErrors = validateAuth({ 
    type: 'register',
    name: name.value, 
    email: email.value, 
    password: password.value, 
    confirmPassword: confirmPassword.value 
  })

  if (Object.keys(validationErrors).length > 0) {
    Object.assign(errors, validationErrors)
    return
  }

  // Submit form
  console.log("Form submitted!", { name: name.value, email: email.value, password: password.value })
}
</script>


<template>
  <LoginNavbar />
  <div 
    class="flex items-center justify-center pt-10 bg-cover bg-center font-[Inter,sans-serif] p-5"
    :style="{ backgroundImage: `url(${bgImage})` }"
  >
    <div class="w-[578px] h-[940px] px-12 bg-white rounded-[22px] border border-[#E1E1E1A8] p-6 relative">

      <SegmentedControl />

      <div class="text-center mb-6">
        <h1 class="text-[32px] font-inter font-semibold tracking-[1%] mb-1 bg-gradient-to-r from-[#A749FF] to-[#2867D9] text-transparent bg-clip-text">
          Create Account
        </h1>
        <p class="text-sm text-primary font-inter">Sign up to get started</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit">
        <AppInput v-model="name" label="Name" placeholder="Enter your full name" :error="errors.name" />
        <AppInput v-model="email" label="Email" type="email" placeholder="Enter your email" :error="errors.email" />
        <AppInput v-model="password" label="Password" type="password" placeholder="Enter your password" :error="errors.password" />
        <AppInput v-model="confirmPassword" label="Confirm Password" type="password" placeholder="Confirm your password" :error="errors.confirmPassword" />

        <AppButton type="submit" label="Sign Up" />
      </form>

      <!-- Social buttons & footer remain same -->
      <div class="flex items-center my-6">
        <div class="flex-1 h-px bg-[#CFDFE2]"></div>
        <span class="px-4 text-primary font-inter text-sm">Or sign up with</span>
        <div class="flex-1 h-px bg-[#CFDFE2]"></div>
      </div>

     <div class="flex gap-3 mb-5">
        <SocialButton label="Google">
          <template #icon>
            <!-- Google Icon -->
            <svg class="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </template>
        </SocialButton>

        <SocialButton label="Facebook">
          <template #icon>
            <!-- Facebook Icon -->
            <svg class="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </template>
        </SocialButton>
      </div>

      <p class="text-center text-sm text-[#122B31] mb-0">
        Already have an account?
        <a href="/login" class="text-sm text-[#1E4AE9]">Login</a>
      </p>

      <AppFooter />
    </div>
  </div>
</template>
