<template>
  <el-card class="account-container">
    <el-form :model="passForm" :rules="rules" ref="passRef" label-width="100px" label-position="right"
      class="demo-ruleForm">
      <el-form-item label="原密码：" prop="oldpass" @keyup.enter.native="submitPass">
        <el-input type="password" style="width: 300px" v-model="passForm.password_old"></el-input>
      </el-form-item>
      <el-form-item label="新密码：" prop="newpass" @keyup.enter.native="submitPass">
        <el-input type="password" style="width: 300px" v-model="passForm.password_new"></el-input>
      </el-form-item>
      <el-form-item label="再次确认：" prop="newpass" @keyup.enter.native="submitPass">
        <el-input type="password" style="width: 300px" v-model="passForm.password_new2"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="danger" @click="submitPass">确认修改</el-button>
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
      const passRef = ref(null)
      const route = useRoute()
      const router = useRouter()
      const store = useStore()
      const state = reactive({
        userInfo: null,
        nameForm: {
          loginName: '',
          nickName: ''
        },
        passForm: {
          password_old: '',
          password_new: '',
          password_new2: ''
        },
        rules: {
          password_old: [{
            required: 'true',
            message: '原密码不能为空',
            trigger: ['change']
          }],
          password_new: [{
            required: 'true',
            message: '新密码不能为空',
            trigger: ['change']
          }],
          password_new2: [{
            required: 'true',
            message: '请再次确认新密码',
            trigger: ['change']
          }]
        },
      })

      onMounted(() => {
        getUserInfo()
      })

      const getUserInfo = async () => {
        state.userInfo = store.getters.getUser
      }

      const submitPass = async () => {
        let data = {
          username: state.userInfo.username,
          password_old: state.passForm.password_old,
          password_new: state.passForm.password_new,
          password_new2: state.passForm.password_new2,
        }
        //数据校验
        if (validateData(data)) {
          update_pass(data, () => {
            setTimeout(() => {
              //修改密码成功后，重新返回登录
              ElMessage.success({
                message: "正在前往登录...",
                type: 'success'
              });
              setTimeout(() => {
                localRemove('user')
                setTimeout(() => {
                  router.push({
                    path: "/login"
                  })
                }, 500)
                if (route.path != "/retrieve") {
                  location.reload()
                }
              }, 1000)
            }, 1000)
          })
        }
      }
      return {
        ...toRefs(state),
        nameRef,
        passRef,
        submitPass
      }
    }
  }
</script>

<style>
  .account-container {
    margin-bottom: 20px;
  }
</style>