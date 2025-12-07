<template>
  <div style="text-align: center; margin-top: 100px">
    <h1>403 无权限访问</h1>
    <p>你没有权限访问该页面，请联系管理员</p>
    <button @click="goBack">返回首页</button>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const goBack = () => router.push('/')
</script>
