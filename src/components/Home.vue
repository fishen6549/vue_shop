<template>
  <!-- 每一个el组件它每一个组件的名称就是它的类名 -->

  <el-container class="home-container">
    <el-header>
      <div>
        <img
          src="http://placehold.it/60x60/"
          alt=""
        ><span>电商后台管理系统</span>
      </div>
      <el-button
        class="logout-button"
        type="info"
        @click="logout"
      >
        退出
      </el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollpase ? '60px' : '200px'">
        <div
          class="toggle-button"
          @click="toggleCollapse"
        >
          |||
        </div>
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollpase"
          :collapse-transition="false"
          router
          :default-active="defaultActiveNav"
        >
          <el-submenu
            v-for="item in menuList"
            :key="item.id"
            :index="'/' + item.path"
          >
            <template slot="title">
              <i :class="iconsObj[item.id]" />
              <span>{{ item.authName + "-" + item.path }}</span>
            </template>
            <el-menu-item
              v-for="subItem in item.children"
              :key="subItem.id"
              :index="'/' + subItem.path"
              @click="saveActiveNav('/' + subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu" />
                <span>{{ subItem.authName + "-" + subItem.path }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menuList: [],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollpase: false,
      defaultActiveNav: ''
    }
  },
  created() {
    this.getMenuList()
    this.activeNav()
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    saveActiveNav(defaultActiveNav) {
      // 保存点击的导航栏
      console.log(defaultActiveNav)
      window.sessionStorage.setItem('activeNav', defaultActiveNav)
      this.defaultActiveNav = defaultActiveNav
    },
    activeNav() {
      this.defaultActiveNav = window.sessionStorage.getItem('activeNav')
    },
    // 获取所有菜单
    async getMenuList() {
      const { data: res } = await this.$http.get('/menus')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.menuList = res.data
    },
    toggleCollapse() {
      this.isCollpase = !this.isCollpase
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  width: 100%;
  height: 100%;
}

.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  color: #fff;
  font-size: 20px;
  background-color: #373d41;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  text-align: center;
  color: #ccc;
  font-size: 12px;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
