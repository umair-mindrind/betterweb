<template>
  <div class="mb-4">
    <label class="block text-sm text-primary font-inter mb-2">{{ label }}</label>
    <input
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :type="type"
      :placeholder="placeholder"
      class="w-full h-11 px-4 border border-[#D4D7E3] rounded-md 
             text-sm text-[#C3C7CD] placeholder-[#C3C7CD] font-inter 
             focus:outline-none focus:border-[#8b5cf6] 
             focus:ring-[3px] focus:ring-[rgba(139,92,246,0.1)]"
    />
    <p v-if="error" class="text-red-500 text-xs mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  label: String,
  type: { type: String, default: "text" },
  placeholder: String,
  error: String
})
defineEmits(['update:modelValue'])
</script>
