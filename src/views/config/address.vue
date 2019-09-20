<template>
  <div class="app-container">
    <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-width="300px">
      <el-form-item label="公积金地址" prop="address">
        <el-input v-model="dataForm.address" class="input-width" />
      </el-form-item>
      <el-form-item>
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="update">确定</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'ConfigAddress',
  data() {
    return {
      dataForm: {
        address: 0
      },
      rules: {
        address: [{ required: true, message: '不能为空', trigger: 'blur' }]
      }
    };
  },
  created() {
    this.init();
  },
  methods: {
    init: function() {
      // listExpress().then(response => {
      //   this.dataForm = response.data.data;
      // });
    },
    cancel() {
      this.init();
    },
    update() {
      this.$refs['dataForm'].validate(valid => {
        if (!valid) {
          return;
        }
        // updateExpress(this.dataForm)
        //   .then(response => {
        //     this.$notify.success({
        //       title: '成功',
        //       message: '运费配置修改成功'
        //     });
        //   })
        //   .catch(response => {
        //     this.$notify.error({
        //       title: '失败',
        //       message: response.data.errmsg
        //     });
        //   });
      });
    }
  }
};
</script>

<style scoped>
.input-width {
  width: 50%;
}
</style>
