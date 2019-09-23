<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.username"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入订单号"
      />
      <el-button
        v-permission="['GET /admin/admin/list']"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查找</el-button>
      <el-button
        v-permission="['POST /payee/create']"
        class="filter-item"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >添加</el-button>
      <el-button
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >导出</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="正在查询中。。。"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="ID" prop="id" sortable />
      <el-table-column align="center" label="支付类别" prop="type">
        <template slot-scope="scope">
          <span>{{ scope.row.type | orderStatusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="姓名" prop="username" />
      <el-table-column align="center" label="账户" prop="username" />
      <el-table-column align="center" label="收款二维码" prop="wepaypic | alipaypic">
        <template slot-scope="scope">
          <img v-if="scope.row.wepaypic" :src="scope.row.wepaypic" width="80" >
          <img v-else :src="scope.row.alipaypic" width="80" >
        </template>
      </el-table-column>
      <!-- <el-table-column align="center" label="收款二维码" prop="alipaypic">
        <template slot-scope="scope">
          <img :src="scope.row.alipaypic" width="40" >
        </template>
      </el-table-column> -->

      <el-table-column align="center" label="操作" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['POST /admin/admin/update']"
            type="primary"
            size="mini"
            @click="handleUpdate(scope.row)"
          >编辑</el-button>
          <el-button
            v-permission="['POST /admin/admin/delete']"
            type="danger"
            size="mini"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="dataForm"
        status-icon
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="支付类别" prop="type">
          <el-select v-model="type" placeholder="请选择支付类别">
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.label"
              :value= "item.value" />
            <el-option
              key="2"
              label="支付宝"
              value= "2" />
          </el-select>
        </el-form-item>
        <el-form-item label="姓名" prop="username">
          <el-input v-model="dataForm.username" placeholder="姓名长度必须6个字符以上" />
        </el-form-item>
        <el-form-item label="账户" prop="account" >
          <el-input v-model="dataForm.account" type="text" />
        </el-form-item>
        <el-form-item label="收款二维码" prop="avatar">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadAvatar"
            class="avatar-uploader"
            accept=".jpg, .jpeg, .png, .gif"
          >
            <img v-if="dataForm.avatar" :src="dataForm.avatar" class="avatar" >
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
        <!-- <el-form-item label="管理员角色" prop="roleIds">
          <el-select v-model="dataForm.roleIds" multiple placeholder="请选择">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>-->
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #20a0ff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 145px;
  height: 145px;
  display: block;
}
</style>

<script>
import { createAccount, payAccountList, updatePayAccount, deletePayAccount } from '@/api/currency';
import { roleOptions } from '@/api/role';
import { uploadPath } from '@/api/storage';
import { getToken } from '@/utils/auth';
import Pagination from '@/components/Pagination'; // Secondary package based on el-pagination
const statusMap = {
  1: '微信支付',
  2: '支付宝支付'
};
export default {
  name: 'Admin',
  components: { Pagination },
  filters: {
    orderStatusFilter(status) {
      return statusMap[status];
    }
  },
  data() {
    return {
      type: 1,
      options: [
        { id: '11', type: 1, label: '微信' },
        { id: '22', type: 2, label: '支付宝' }
      ],
      uploadPath,
      list: null,
      total: 0,
      roleOptions: [],
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        username: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      dataForm: {
        id: undefined,
        type: '1',
        username: undefined,
        account: undefined,
        avatar: undefined,
        alipaypic: '',
        wepaypic: '',
        roleIds: []
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        username: [
          { required: true, message: '姓名长度必须6个字符以上', trigger: 'blur' }
        ],
        account: [{ required: true, message: '账户不能为空', trigger: 'blur' }]
      },
      downloadLoading: false
    };
  },
  computed: {
    headers() {
      return {
        'X-Litemall-Admin-Token': getToken()
      };
    }
  },
  created() {
    this.getList();

    roleOptions().then(response => {
      this.roleOptions = response.data.data.list;
    });
  },
  methods: {
    formatRole(roleId) {
      for (let i = 0; i < this.roleOptions.length; i++) {
        if (roleId === this.roleOptions[i].value) {
          return this.roleOptions[i].label;
        }
      }
      return '';
    },
    getList() {
      this.listLoading = true;
      payAccountList(this.listQuery)
        .then(response => {
          this.list = response.data.data.list;
          this.total = response.data.data.total;
          this.listLoading = false;
        })
        .catch(() => {
          this.list = [];
          this.total = 0;
          this.listLoading = false;
        });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        type: '1',
        username: undefined,
        account: undefined,
        avatar: undefined,
        alipaypic: undefined,
        wepaypic: undefined,
        roleIds: []
      };
    },
    uploadAvatar: function(response) {
      this.dataForm.avatar = response.data.url;
    },
    handleCreate() {
      this.resetForm();
      this.dialogStatus = 'create';
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate();
      });
    },
    createData() {
      try {
        this.$refs['dataForm'].validate(async valid => {
          if (valid) {
            console.log(this.dialogStatus);
            if (this.type === '1') {
              this.dataForm.wepaypic = this.dataForm.avatar;
            } else {
              this.dataForm.alipaypic = this.dataForm.avatar;
            }
            this.dataForm.type = parseInt(this.type);
            const result = await createAccount(this.dataForm);
            console.log(result);
            if (result && result.data.errno === 0) {
              this.dialogFormVisible = false;
              this.$notify.success({
                title: '成功',
                message: '添加管理员成功'
              });
              this.getList();
            } else if (result && result.data.errno !== 0) {
              this.$notify.error({
                title: '失败',
                message: result.data.errmsg
              });
            }
          }
        });
      } catch (error) {
        console.log(error);
      }
    },
    handleUpdate(row) {
      this.dataForm = Object.assign({}, row);
      console.log(this.dataForm);
      const avatar = this.dataForm.alipaypic === '' ? this.dataForm.wepaypic : this.dataForm.alipaypic;
      this.dataForm.avatar = avatar;
      this.type = this.dataForm.type;
      this.dialogStatus = 'update';
      this.dialogFormVisible = true;
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate();
      });
    },
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          updatePayAccount(this.dataForm)
            .then(() => {
              for (const v of this.list) {
                if (v.id === this.dataForm.id) {
                  const index = this.list.indexOf(v);
                  this.list.splice(index, 1, this.dataForm);
                  break;
                }
              }
              this.dialogFormVisible = false;
              this.$notify.success({
                title: '成功',
                message: '更新管理员成功'
              });
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              });
            });
        }
      });
    },
    handleDelete(row) {
      deletePayAccount(row)
        .then(response => {
          this.$notify.success({
            title: '成功',
            message: '删除管理员成功'
          });
          const index = this.list.indexOf(row);
          this.list.splice(index, 1);
        })
        .catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          });
        });
    },
    handleDownload() {
      this.downloadLoading = true;
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['管理员ID', '管理员名称', '管理员头像'];
        const filterVal = ['id', 'username', 'avatar'];
        excel.export_json_to_excel2(
          tHeader,
          this.list,
          filterVal,
          '管理员信息'
        );
        this.downloadLoading = false;
      });
    }
  }
};
</script>
