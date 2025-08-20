<template>
  <button
    :type="type"
    class="w-full py-5 text-center rounded-md 
           bg-gradient-to-r from-[#A749FF] to-[#2867D9] 
           text-white text-base tracking-[2px] font-inter 
           font-medium hover:opacity-95"
  >
    {{ label }}
  </button>
</template>

<script setup>
defineProps({
  label: String,
  type: { type: String, default: "button" },
})
</script>
