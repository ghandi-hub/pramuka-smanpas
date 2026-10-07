<script setup lang="ts">
definePageMeta({
  middleware: [
    function () {
      const localePath = useLocalePath();
      return navigateTo(localePath("/member/skk"), { redirectCode: 301 });
    },
  ],
});
</script>

<template>
  <div />
</template>