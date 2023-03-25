<!--
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-05-24 16:40:29
 * @LastEditors: 郭少
 * @LastEditTime: 2021-06-13 11:36:03
-->
<template>
  <img :src="src" alt="" class="scale-img">
</template>
<script>
  import {
    onMounted,
    reactive,
    ref,
    toRefs
  } from 'vue'
  import {
    useRoute,
    useRouter
  } from 'vue-router'
  import {
    useStore
  } from 'vuex'
  export default {
    name: 'ScaleImg',
    setup() {
      const route = useRoute()
      const router = useRouter()
      const store = useStore()
      let state = reactive({
        src: "",
        imgList: ""
      })
      onMounted(() => {
        if (route.query.src) {
          state.src = store.state.imgPrefix + route.query.src
        } else {
          state.id = route.query.id
          let imgList = JSON.parse(route.query.imgList)
          for (let i = 0; i < imgList.length; i++) {
            console.log(imgList[i].id, state.id)
            if (imgList[i].id == state.id) {
              state.src = imgList[i].src
            }
          }
        }
        store.commit('setPageIndex', route.query.pageIndex)
        console.log(state.src)
      })

      return {
        ...toRefs(state)
      }
    }
  }
</script>
<style scoped>
  .scale-img {
    width: 498px;
    display: block;
    margin: 0 auto;
    border: 3px solid #e2e2e2;
    border-radius: 20px;
  }
</style>