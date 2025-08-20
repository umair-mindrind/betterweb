<template>
  <button
    class="flex-1 h-11 flex items-center gap-4 justify-center 
           py-3 border border-[#E8E8E8] rounded-md bg-white 
           text-base font-normal font-inter text-[#313957] 
           hover:bg-gray-50"
  >
    <slot name="icon"></slot>
    {{ label }}
  </button>
</template>

<script setup>
defineProps({
  label: String,
})
</script>
