<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }"> 首页 </el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
      <el-breadcrumb-item>活动详情</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="queryInfo.query"
            placeholder="请输入内容"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            />
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="dialogVisible = true"> 添加用户 </el-button>

        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="testRoute"> 路由跳转测试 </el-button>

        </el-col>
      </el-row>
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#" />
        <el-table-column prop="username" label="姓名" align="center" />
        <el-table-column prop="mobile" label="手机" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="role_name" label="角色" />
        <el-table-column prop="mg_state" label=" 状态" align="center" active-color="#13ce66" inactive-color="#ccc">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- 编辑用户 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)" />
            <!-- 删除用户 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUserById(scope.row.id)" />
            <!-- 权限分配 -->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRoleDialog(scope.row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        :current-page="1"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />

      <!-- 添加用户的对话框 -->
      <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" center @close="addDialogClosed">
        <el-form ref="addFormRef" :label-position="'left'" label-width="80px" :rules="addFormRules" :model="addForm">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password" />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email" />
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="addForm.mobile" />
          </el-form-item>

        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 编辑用户对话框 -->
      <el-dialog title="编辑用户" :visible.sync="editDialogVisible" width="50%">
        <el-form ref="editFormRef" :label-position="'left'" label-width="80px" :rules="addFormRules" :model="editForm">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="editForm.username" disabled />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email" />
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile" />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEditForm">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 分配角色对话框 -->
      <el-dialog
        title="分配角色"
        :visible.sync="setRoleDialogVisible"
        width="30%"
        @close="selectRoleId = ''"
      >
        <div>
          <p>当前用户名称：{{ userInfo.username }}</p>
          <p>当前角色名称：{{ userInfo.role_name }}</p>
          <p>分配的新角色：
            <el-select v-model="selectRoleId" placeholder="请选择">
              <el-option
                v-for="item in roleList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              />
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="setRole">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      userList: [],
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      dialogVisible: false,
      editDialogVisible: false,
      setRoleDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editForm: {},
      addFormRules: {
        username: [
          { type: 'string', required: true, message: '请输入用户名', trigger: 'change' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'change' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'change' },
          { min: 3, max: 50, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'change' },
          { min: 3, max: 11, message: '长度在 3 到 11 个字符', trigger: 'blur' }
        ]
      },
      userInfo: '',
      roleList: [],
      selectRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      // 这个data是response返回的数据 不然会有axios包装进去的config状态码什么的
      const { data: res } = await this.$http.get('/users', {
        params: this.queryInfo
      })
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 这个data是json里面的data
      this.userList = res.data.users
      this.total = res.data.total
      console.log(this.userList)
    },
    async userStateChanged(userinfo) {
      console.log(userinfo)
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      console.log(res)
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        this.$message.error('更新用户状态失败!')
        return
      }
      this.$message.success('更新用户状态成功!')
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    addDialogClosed() {
      console.log('表单关闭')
      this.$refs.addFormRef.resetFields()
    },
    submitForm() {
      console.log('提交表单')
      this.$refs.addFormRef.validate(async(valid) => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post('users', this.addForm)
        console.log(res)
        if (res.meta.status !== 201) {
          this.$message.error(res.meta.msg)
          return
        }
        this.$message.success(res.meta.msg)
        this.dialogVisible = false
        this.getUserList()
      })
    },
    async showEditDialog(id) {
      console.log(id)
      const { data: res } = await this.$http.get('users/' + id)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    submitEditForm() {
      this.$refs.editFormRef.validate(async(valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email, mobile: this.editForm.mobile
        })
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.editDialogVisible = false
        this.getUserList()
      })
    },
    async deleteUserById(id) {
      console.log(id)
      const confirmRes = await this.$confirm('此操作将永久删除该用户, 是否继续?', '询问', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      console.log(confirmRes)
      if (confirmRes !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      console.log('确认了删除')
      const { data: res } = await this.$http.delete('users/' + id)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getUserList()
    },
    async showSetRoleDialog(userInfo) {
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.roleList = res.data
      console.log(this.roleList)
      this.setRoleDialogVisible = true
    },
    async setRole() {
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`
        , { rid: this.selectRoleId }
      )

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    testRoute() {
      console.log('点击按钮')
      this.$router.push({ name: 'test', params: { id: 12, name: 'apple' }})
      // this.$router.push({ path: 'test', query: { id: 12 }})
    }
  }
}

</script>

<style lang="less" scope>
</style>
