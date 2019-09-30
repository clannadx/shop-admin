<template>
  <div class="app-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.orderSn"
        clearable
        class="filter-item"
        style="width: 200px;"
        placeholder="请输入订单编号"
      />
      <el-button
        v-permission="['GET /admin/payee/list']"
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >查找</el-button>
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
      <el-table-column align="center" min-width="100" label="订单编号" prop="orderSn" />
      <el-table-column align="center" label="订单状态" prop="orderStatus">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.orderStatus | orderStatusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="订单单价" prop="price" />
      <el-table-column align="center" label="订单数量" prop="size" />
      <el-table-column align="center" label="支付金额" prop="cost" />
      <el-table-column align="center" label="支付时间" prop="payTime" />
      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['GET /admin/orderetm/detail']"
            type="primary"
            size="mini"
            @click="handleDetail(scope.row)"
          >审核</el-button>
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

    <!-- 订单详情对话框 -->
    <el-dialog :visible.sync="orderDialogVisible" title="订单详情" width="800">
      <el-form :data="orderDetail" label-position="left">
        <el-form-item label="订单编号">
          <span>{{ orderDetail.order_sn }}</span>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-tag>{{ orderDetail.order_status | orderStatusFilter }}</el-tag>
        </el-form-item>
        <el-form-item label="支付渠道">
          <span>{{ orderDetail.type |orderTypeFilter }}</span>
        </el-form-item>
        <el-form-item label="转账订单号">
          <span>{{ orderDetail.pay_sn }}</span>
        </el-form-item>
        <el-form-item label="费用信息">
          <span>
            (实际费用) {{ orderDetail.cost }} 元 =
            (单价) {{ orderDetail.price }} USDT *
            (数量) {{ orderDetail.size }} 个
          </span>
        </el-form-item>
        <el-form-item label="支付时间">
          <span>{{ orderDetail.pay_time }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button
          v-permission="['POST /admin/orderetm/verify']"
          type="success"
          icon="el-icon-check"
          @click="checkPassReview(orderDetail.id)"
        >审核通过</el-button>
        <el-button
          v-permission="['POST /admin/orderetm/reject']"
          type="danger"
          icon="el-icon-close"
          @click="checkRejectReview(orderDetail.id)"
        >审核拒绝</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { listOrder, detailOrder } from '@/api/order';
import {
  orderEtm,
  orderEtmDetail,
  passReview,
  rejectReview
} from '@/api/currency';
import Pagination from '@/components/Pagination'; // Secondary package based on el-pagination
import checkPermission from '@/utils/permission'; // 权限判断函数

const statusMap = {
  101: '未付款',
  102: '取消订单',
  103: '系统取消',
  201: '待审核',
  301: '已审核',
  302: '审核未通过',
  401: '已完成'
};

const orderType = {
  1: '支付宝',
  2: '微信'
};

export default {
  name: 'Order',
  components: { Pagination },
  filters: {
    orderStatusFilter(status) {
      return statusMap[status];
    },
    orderTypeFilter(status) {
      return orderType[status];
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      downloadLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        id: undefined,
        orderSn: undefined,
        orderStatusArray: ['201'],
        sort: 'add_time',
        order: 'desc'
      },
      statusMap,
      orderDialogVisible: false,
      shipDialogVisible: false,
      shipForm: {
        orderId: undefined,
        shipChannel: undefined,
        shipSn: undefined
      },
      orderDetail: {
        order: {},
        user: {},
        orderGoods: []
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    checkPermission,
    getList() {
      this.listLoading = true;
      orderEtm(this.listQuery)
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
    handleDetail(row) {
      orderEtmDetail({ id: row.id }).then(response => {
        this.orderDetail = response.data.data;
      });
      this.orderDialogVisible = true;
    },
    review(row) {
      this.shipDialogVisible = true;
    },
    checkPassReview(id) {
      this.$confirm('已核对订单，是否审核通过?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this._passReview(id);
        })
        .catch(() => {
          this.orderDialogVisible = false;
        });
    },
    checkRejectReview(id) {
      this.$confirm('已核对订单，是否审核拒绝?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this._rejectReview(id);
        })
        .catch(() => {
          this.orderDialogVisible = false;
        });
    },
    async _passReview(id) {
      try {
        const result = await passReview({ orderId: id });
        if (result && result.data.errno === 0) {
          this.orderDialogVisible = false;
          this.$notify.success({
            title: '成功',
            message: '审核通过'
          });
          this.getList();
        }
      } catch (error) {
        this.$notify.error({
          title: '失败',
          message: error.data.errmsg
        });
      }
    },
    async _rejectReview(id) {
      try {
        const result = await rejectReview({ orderId: id });
        if (result && result.data.errno === 0) {
          this.orderDialogVisible = false;
          this.$notify.success({
            title: '成功',
            message: '已驳回'
          });
          this.getList();
        }
      } catch (error) {
        this.$notify.error({
          title: '失败',
          message: error.data.errmsg
        });
      }
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleDownload() {
      this.downloadLoading = true;
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = [
          '订单编号',
          '订单单价',
          '订单数量',
          '支付金额',
          '支付时间'
        ];
        const filterVal = ['orderSn', 'price', 'size', 'cost', 'payTime'];
        excel.export_json_to_excel2(
          tHeader,
          this.list,
          filterVal,
          '待审核订单'
        );
        this.downloadLoading = false;
      });
    }
  }
};
</script>
