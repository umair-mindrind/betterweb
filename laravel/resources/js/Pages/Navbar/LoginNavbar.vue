<template>
  <nav class=" bg-white border-b border-gray-200 py-6 px-16">
    <div class="  mx-auto px-4 flex items-center justify-between">
      <!-- Logo section -->
      <div class="flex items-center">
        <img :src="logo" alt="BetterWeb Logo" class="h-[31px] w-auto object-contain" />
      </div>

      <!-- Navigation links -->
      <div class="flex items-center gap-8 font-inter md:gap-6 text-[#4B5563] sm:gap-4 text-sm font-normal">
        <a href="#" >Features</a>
        <a href="#" >Pricing</a>
        <a href="#" >About</a>
        <a href="#" >Contact</a>
      </div>
    </div>
  </nav>
</template>

<script>
import logo from '@/assets/images/logo-image.svg';

export default {
  name: 'LoginNavbar',
  data() {
    return { logo };
  }
}
</script>
