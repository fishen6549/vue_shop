import Vue from 'vue'
import { Option, Select, Tree, Tag, MessageBox, Dialog, Button, Form, FormItem, Input, Message, Container, Aside, Header, Main, Menu, Submenu, MenuItem, Breadcrumb, BreadcrumbItem, Row, Col, Card, Table, TableColumn, Switch, Icon, Tooltip, Pagination } from 'element-ui'
import { options } from 'less'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Aside)
Vue.use(Header)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Row)
Vue.use(Col)
Vue.use(Card)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Icon)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Select)
Vue.use(Option)
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
