<template>
  <el-card class="account-container">
    <el-form :model="persForm" label-width="100px" label-position="right" class="demo-ruleForm">
      <el-form-item label="昵称：" prop="user_nickname">
        <el-input type="text" style="width: 300px" v-model="persForm.user_nickname"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="danger" @click="submitPers">确认修改</el-button>
      </el-form-item>
    </el-form>
  </el-card>
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
  import axios from '@/utils/axios'
  import {
    ElMessage
  } from 'element-plus'
  import {
    validateData
  } from '@/utils/action'
  import {
    update_pass
  } from '@/api/common'
  import {
    localGet,
    localSet,
    localRemove,
    pathMap
  } from '@/utils'
  import {
    useStore
  } from "vuex"
  import md5 from 'js-md5'
  export default {
    name: 'Account',
    setup() {
      const nameRef = ref(null)
      const route = useRoute()
      const router = useRouter()
      const store = useStore()
      const state = reactive({
        userInfo: null,
        nameForm: {
          loginName: '',
          nickName: ''
        },
        persForm: {
          user_nickname: '',
        }
      })

      onMounted(() => {
        getUserInfo()
      })

      const getUserInfo = async () => {
        state.userInfo = store.getters.getUser
      }

      //重置用户数据缓存
      const reset_userData = (user_nickname) => {
        state.userInfo.user_nickname = user_nickname
        store.commit("setUser", state.userInfo)
      }

      const submitPers = async () => {
        let data = {
          user_nickname: state.persForm.user_nickname
        }
        //数据校验
        if (validateData(data)) {
          gs_Api.nickname_upd($qs.stringify(data)).then(res => {
            if (res.code == 200) {
              reset_userData(state.persForm.user_nickname)
              ElMessage.success({
                message: "昵称修改成功",
                type: 'success'
              });
            }
          })
        }
      }
      return {
        ...toRefs(state),
        nameRef,
        submitPers
      }
    }
  }
</script>

<style>
  .account-container {
    margin-bottom: 20px;
  }
</style>