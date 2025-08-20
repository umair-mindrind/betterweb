<template>
  <div class="flex bg-[#F5F5F5] rounded-md p-[4px] mb-8">
    <!-- Login Tab -->
    <Link
      :href="route('login')"
      :class="[
        'flex-1 py-5 px-4 text-center font-semibold text-sm rounded-[5px]',
        $page.url === '/' ? 'bg-white text-[#4B5563]' : 'bg-[#F5F5F5] text-[#4B5563]'
      ]"
    >
      Login
    </Link>

    <!-- Sign Up Tab -->
    <Link
      :href="route('register')"
      :class="[
        'flex-1 py-5 px-4 text-center font-semibold text-sm rounded-[5px]',
        $page.url === '/register' ? 'bg-white text-[#4B5563]' : 'bg-[#F5F5F5] text-[#4B5563]'
      ]"
    >
      Sign Up
    </Link>
  </div>
</template>

<script setup>
import { Link } from '@inertiajs/vue3';
</script>