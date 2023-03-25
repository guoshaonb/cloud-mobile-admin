<template>
  <el-card class="guest-container">
    <template #header>
      <Search :isPc="isPc" :search="search" placeh="请输入作者" @searchDataBack="searchData"></Search>
      <el-button type="success" @click="inspListOpen" icon="el-icon-document-add">发布公告</el-button>
    </template>

    <CommonTable :tableData="tableData" :tableColumns="tableLabel" :page="currentPage" :rows="pageSize" :total="total"
      :loading="loading" :tableOption="tableOption" @sizeChange="sizeChange" @pageChange="pageChange"
      @clickButton="clickButton" @sortChange="sortChange"></CommonTable>
    <DialogCommon ref='dialog1' width="800px" :title="title" :propList="propList1" :callBack="update_List"
      :reload="getAnnounceList" />
    <DialogCommon ref='dialog2' width="800px" :title="title" :propList="propList2" :callBack="insert_List"
      :reload="getAnnounceList" />
  </el-card>
</template>

<script>
  import {
    onMounted,
    onUnmounted,
    reactive,
    ref,
    toRefs
  } from 'vue'
  import axios from '@/utils/axios'
  import {
    useRoute,
    useRouter
  } from 'vue-router'
  import {
    ElMessage
  } from 'element-plus'
  import {
    getVal,
    fromSet,
    validateData,
    getPageIndex
  } from '@/utils/action'
  import {
    useStore
  } from 'vuex'

  export default {
    name: 'UserManage',
    methods: {
      //-----------------------------------------表格事件-----------------------------------------
      // 切换当前一页展示多少条
      sizeChange(val) {
        this.pageSize = val;
        this.getOrderList();
        console.log(`每页 ${val} 条`);
      },
      // 翻页
      pageChange(val) {
        this.changePage(val)
        console.log(`当前页: ${val}`);
      },
      // 点击事件
      clickButton(val) {
        // 调用事件
        this[val.methods](val.row);
      },
      // 排序
      sortChange(val) {
        console.log(val);
      },
      delete(val) {
        // 我是删除
        console.log(val);
      },
      //编辑公告
      update(val) {
        this.updpListOpen(val)
      },
      //移除公告
      delfirm(val) {
        this.announce_Remove(val.id)
      }
    },
    setup() {
      const multipleTable = ref(null)
      const dialog1 = ref(null)
      const dialog2 = ref(null)
      const router = useRouter()
      const store = useStore()
      const state = reactive({
        isPc: true,
        value: "",
        announce_name: "",
        //------------表单模块------------
        title: "",
        id: "",
        propList1: [{
          type: "text",
          label: "标题",
          name: "title",
          value: ""
        }, {
          type: "text",
          label: "作者",
          name: "author",
          value: ""
        }, {
          type: "file",
          label: "图片",
          name: "banner",
          value: ""
        }, {
          type: "textarea",
          label: "内容",
          name: "content",
          value: ""
        }, {
          type: "text",
          label: "跳转链接",
          name: "linkurl",
          value: ""
        }, {
          type: "number",
          label: "排序值",
          name: "sort",
          value: ""
        }],
        propList2: [{
          type: "text",
          label: "标题",
          name: "title",
          value: ""
        }, {
          type: "text",
          label: "作者",
          name: "author",
          value: ""
        }, {
          type: "file",
          label: "图片",
          name: "banner",
          value: ""
        }, {
          type: "textarea",
          label: "内容",
          name: "content",
          value: ""
        }, {
          type: "text",
          label: "跳转链接",
          name: "linkurl",
          value: ""
        }, {
          type: "number",
          label: "排序值",
          name: "sort",
          value: ""
        }],
        phone_list: {},
        phone_value: "",

        //------------表格模块------------
        loading: false,//表格状态
        total: 0,//数据总条数
        currentPage: 1, // 当前页
        pageSize: 10, // 分页大小
        // 表头数据
        tableLabel: [{
          label: "ID",
          param: "id"
        },
        {
          label: "标题",
          param: "title",
        },
        {
          label: "作者",
          param: "author"
        },
        {
          label: "内容",
          param: "content"
        },
        {
          label: "跳转链接",
          param: "linkurl",
        },
        {
          label: "排序值",
          param: "sort",
        }
        ],
        // 表格操作
        tableOption: {
          label: "操作",
          options: [{
            label: "编辑公告",
            type: "primary",
            icon: "el-icon-edit",
            methods: `update`
          }],
          popconfirms: [{
            label: "删除",
            contit: "确定移除",
            title: "确定移除该公告吗？",
            buttype: "danger",
            titicon: "el-icon-delete",
            editicon: "el-icon-delete",
            methods: `delfirm`
          }]
        },
        // 表格数据
        tableData: [],
        radio: "all",//内容选项
        search: "",//搜索内容
      })
      
      onMounted(() => {
        setTimeout(() => {
          state.currentPage = getPageIndex() || 1
          if ($(window).width() < 1200) {
            state.isPc = false
          }
          getAnnounceList()
        }, 200)
      })

      onUnmounted(() => {
        store.commit('delPageIndex')
      })

      //查询数据
      const searchData = (val) => {
        state.search = val
        getAnnounceList()
      }

      const loadingFunc = () => {
        state.loading = true
        setTimeout(() => {
          state.loading = false
          $(".el-pager li").each(function () {
            if ($(this).text() == state.currentPage) {
              $(this).addClass("active").click().siblings().removeClass("active")
            }
          })
        }, 1000)
      }

      const successReload = (text) => {
        text && ElMessage.success(text);
        dialog1.value.close()
        dialog2.value.close()
        getAnnounceList()
      }

      // 获取公告列表公告
      const getAnnounceList = () => {
        loadingFunc()
        gs_Api.announce_list_get(state.search).then(res => {
          if (res.code == 200) {
            const {
              rows: data,
              count
            } = res.data
            for (let i in data) {
              data[i].linkurl = (data[i].linkurl !== "0" && data[i].linkurl !== "") || "无"
              data[i].banner = data[i].banner
            }
            state.tableData = data
            state.total = count
          }
        })
      }

      const changePage = (val) => {
        state.currentPage = val
        getAnnounceList()
      }

      //编辑公告-->打开
      const updpListOpen = (row) => {
        state.title = "编辑公告"
        fromSet(state, "propList1", ["title", "author", "content", "sort"], row)
        state.id = row.id
        dialog1.value.open()
      }

      //编辑公告-->执行
      const update_List = (val, imgUrl) => {

        const baseUrl = 'http://guoshao-service.test.upcdn.net/file-path/'
        let data = {
          title: getVal(val, "title"),
          author: getVal(val, "author"),
          banner: imgUrl ? (baseUrl + imgUrl) : '',
          content: getVal(val, "content"),
          linkurl: getVal(val, "linkurl"),
          sort: getVal(val, "sort"),
        }

        if (data.sort < 1 || data.sort > 9) {
          ElMessage.error('排序值只能为1~9之间')
          return
        }
        gs_Api.announce_list_upd(state.id, $qs.stringify(data)).then(res => {
          if (res.code == 200) {
            successReload("编辑公告成功！")
          }
        })

      }

      //新增公告-->打开
      const inspListOpen = () => {
        state.title = "新增公告"
        fromSet(state, "propList2", [], null)
        dialog2.value.open()
      }

      //新增公告-->执行
      const insert_List = (val, imgUrl) => {

        let data = {
          title: getVal(val, "title"),
          author: getVal(val, "author"),
          banner: imgUrl,
          content: getVal(val, "content"),
          linkurl: getVal(val, "linkurl"),
          sort: getVal(val, "sort"),
        }

        if (!data.title) {
          ElMessage.error('请输入公告标题')
          return
        }
        if (!data.author) {
          ElMessage.error('请输入公告作者')
          return
        }
        if (!data.content) {
          ElMessage.error('请输入公告内容')
          return
        }
        if (data.sort < 1 || data.sort > 9) {
          ElMessage.error('排序值只能为1~9之间')
          return
        }
        gs_Api.announce_list_ins($qs.stringify(data)).then(res => {
          if (res.code == 200) {
            successReload("新增公告成功！")
          }
        })
      }

      //删除公告
      const announce_Remove = (id) => {
        gs_Api.announce_list_del(id).then(res => {
          if (res.code == 200) {
            successReload('移除该公告成功！')
          }
        })
      }
      return {
        ...toRefs(state),
        searchData,
        multipleTable,
        getAnnounceList,
        changePage,
        dialog1,
        dialog2,
        updpListOpen,
        update_List,
        inspListOpen,
        insert_List,
        announce_Remove
      }
    }
  }
</script>

<style scoped>
  .guest-container {
    min-height: 100%;
  }

  .el-card.is-always-shadow {
    min-height: 100% !important;
  }
</style>