<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }"> 首页 </el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="dialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <el-table ref="tableRef" :data="roleList" border stripe @row-click="rowClick">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row v-for="(item1,i1) in scope.row.children" :key="item1.id" :class="['bdbottom','vcenter',i1 === 0 ? 'bdtop':'']">
              <!-- 渲染一级列表 -->
              <el-col :span="5">
                <!-- 一级标签 -->
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right" />
              </el-col>
              <el-col :span="19">
                <el-row v-for="(item2,i2) in item1.children" :key="item2.id" :class="['vcenter',i2 === 0?'':'bdtop']">
                  <el-col :span="6">
                    <!-- 二级标签 -->
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right" />
                  </el-col>
                  <el-col :span="18">
                    <!-- 三级标签 -->
                    <el-tag v-for="(item3) in item2.children" :key="item3.id" :disable-transitions="true" style="margin-left:15px" type="warning" closable @close="removeRightById(scope.row,item3.id)">{{ item3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index" />
        <el-table-column label="角色名称" prop="roleName" />
        <el-table-column label="角色描述" prop="roleDesc" />
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRoleById(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色框 -->
    <el-dialog title="添加角色" :visible.sync="dialogVisible" width="50%" center @close="addDialogClosed">
      <el-form ref="addRoleRef" :label-position="'left'" label-width="80px" :rules="addRoleRules" :model="addRole">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRole.roleName" />
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRole.roleDesc" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%">
      <el-form ref="editRoleRef" :label-position="'left'" label-width="80px" :rules="addRoleRules" :model="editRole">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="editRole.roleName" />
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRole.roleDesc" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="30%" @close="closeSetRightDialog">
      <el-tree ref="rightTree" :data="rightList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="checkedKeys" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      roleList: [],
      dialogVisible: false,
      editDialogVisible: false,
      setRightDialogVisible: false,
      rightList: [],
      checkedKeys: [],
      roleId: '',
      addRole: {
        roleName: '',
        roleDesc: ''
      },
      editRole: {},
      addRoleRules: {
        roleName: [
          { type: 'string', required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: false, message: '请输入角色描述', trigger: 'blur' },
          { min: 3, max: 15, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      },
      treeProps: {
        children: 'children',
        label: 'authName'
      }
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      // 这个data是json里面的data
      this.roleList = res.data

      console.log(this.roleList)
    },
    submitForm() {
      console.log('提交表单')
      this.$refs.addRoleRef.validate(async(valid) => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post('roles', this.addRole)
        console.log(res)
        if (res.meta.status !== 201) {
          this.$message.error(res.meta.msg)
          return
        }
        this.$message.success(res.meta.msg)
        this.dialogVisible = false
        this.getRoleList()
      })
    },
    addDialogClosed() {
      console.log('表单关闭')
      this.$refs.addRoleRef.resetFields()
    },
    async showEditDialog(id) {
      console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      this.editRole = res.data
      this.editDialogVisible = true
    },
    submitEditForm() {
      this.$refs.editRoleRef.validate(async(valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put('roles/' + this.editRole.roleId, {
          roleName: this.editRole.roleName, roleDesc: this.editRole.roleDesc
        })
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.editDialogVisible = false
        this.getRoleList()
      })
    },
    async deleteRoleById(id) {
      console.log(id)
      const confirmRes = await this.$confirm('此操作将永久删除该角色, 是否继续?', '询问', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmRes !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      this.$message.success(res.meta.msg)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.getRoleList()
    },
    rowClick(row, column, event) {
      if (column.label === '操作') {
        return
      }
      this.$refs.tableRef.toggleRowExpansion(row)
    },
    async removeRightById(role, rightId) {
      const confirmRes = await this.$confirm('此操作将永久删除该权限, 是否继续?', '询问', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      console.log(confirmRes)
      if (confirmRes !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      console.log('确认了删除')
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      console.log(res)
      this.$message.success(res.meta.msg)
      role.children = res.data
    },
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.rightList = res.data
      this.getLeafKeys(role, this.checkedKeys)
      this.setRightDialogVisible = true
    },
    getLeafKeys(node, arr) {
      console.log(arr)
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    closeSetRightDialog() {
      this.checkedKeys = []
    },
    async setRight() {
      const rightsId = [
        ...this.$refs.rightTree.getCheckedKeys(),
        ...this.$refs.rightTree.getHalfCheckedKeys()
      ]

      const rightsIdStr = rightsId.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: rightsIdStr })
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.$message.success(res.meta.msg)
      this.getRoleList()
      this.setRightDialogVisible = false
    }

  }
}
</script>

<style lang="less" scoped>
.el-tag{
  margin: 10px 0;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;;
  align-items: center;
}
</style>
