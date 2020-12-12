<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }"> 首页 </el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert show-icon type="warning" title="注意：只允许为第三级分类设置相关参数" :closable="false" />
      <!-- 选择区域 -->
      <el-row id="select-row">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader v-model="selectedKeys" :options="cateList" :props="myCateProps" clearable @change="cateChanged" />
        </el-col>
      </el-row>
      <!-- tab区域 -->
      <el-tabs v-model="activeName" @tab-click="tabsClick">
        <!-- 动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button :disabled="isBtnDisabled" type="primary" size="mini" @click="dialogVisible = true">添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{ item }}</el-tag>
                <!-- <el-tag closable>+New Tag</el-tag> -->
                <el-input
                  v-if="scope.row.inputVisible"
                  ref="saveTagInput"
                  v-model="scope.row.inputValue"
                  class="input-new-tag"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                />
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" />
            <el-table-column prop="attr_name" label="参数名称" align="center" />
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态参数面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button :disabled="isBtnDisabled" type="primary" size="mini" @click="dialogVisible = true">添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{ item }}</el-tag>
                <!-- <el-tag closable>+New Tag</el-tag> -->
                <el-input
                  v-if="scope.row.inputVisible"
                  ref="saveTagInput"
                  v-model="scope.row.inputValue"
                  class="input-new-tag"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                />
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" />
            <el-table-column prop="attr_name" label="参数名称" align="center" />
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <el-dialog
      :title="`添加${titleText}`"
      :visible.sync="dialogVisible"
      width="30%"
      @close="addDialogClosed"
    >
      <el-form ref="addFormRef" label-width="80px" :rules="addRoleRules" :model="addForm">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <pre> {{ manyTableData }}</pre>
    <pre> {{ onlyTableData }}</pre>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedKeys: [],
      cateList: [],
      manyTableData: [],
      onlyTableData: [],
      addForm: {
        attr_name: ''
      },
      myCateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      activeName: 'many',
      tabDisabled: true,
      dialogVisible: false,
      addRoleRules: {
        attr_name: [
          { required: true, message: '请输入内容', trigger: 'blur' }]
      }
    }
  },
  computed: {
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.cateList = res.data
    },
    cateChanged(val) {
      if (val.length === 0) {
        this.manyTableData = []
        this.onlyTableData = []
      } else {
        this.getParamsData()
      }
    },
    tabsClick() {
      console.log(this.activeName)
      this.getParamsData()
    },
    async getParamsData() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: { sel: this.activeName }
      })

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })

      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    addParams() {
      this.$refs.addFormRef.validate(async(valid) => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        console.log(res)
        if (res.meta.status !== 201) {
          this.$message.error(res.meta.msg)
          return
        }
        this.$message.success(res.meta.msg)
        this.dialogVisible = false
        this.getParamsData()
      })
    },
    showInput(row) {
      row.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
        console.log(this.$refs.saveTagInput)
      })
    },
    handleInputConfirm(row) {
      console.log('确认了tag', row)
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }

      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false

      this.savaAttrVals(row)
    },
    async savaAttrVals(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
        return
      }
      this.$message.success(res.meta.msg)
    },
    handleClose(i, row) {
      console.log('离开标签', row)
      row.attr_vals.splice(i, 1)
      this.savaAttrVals(row)
    }
  }
}
</script>

<style lang="less" scoped>
#select-row{
    margin: 15px 0;
}

.el-cascader{
    width: 300px;
}

.el-tag {
  margin: 10px;
}

.el-input {
  width: 150px;
}
</style>
