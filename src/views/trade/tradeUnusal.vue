<template>
  <div class="app-container">
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

      <el-table-column align="center" label="用户ID" prop="userId" />

      <el-table-column align="center" label="订单状态" prop="orderStatus">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.orderStatus | orderStatusFilter }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="订单单价" prop="price" />
      <el-table-column align="center" label="订单数量" prop="size" />
      <el-table-column align="center" label="支付金额" prop="cost" />
      <el-table-column align="center" label="时间" prop="updateTime" />
      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-permission="['GET /admin/order/detail']"
            type="primary"
            size="mini"
            @click="handleDetail(scope.row)"
          >详情</el-button>
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
          <span>{{ orderDetail.orderSn }}</span>
        </el-form-item>
        <el-form-item label="订单状态">
          <el-tag>{{ orderDetail.orderStatus | orderStatusFilter }}</el-tag>
        </el-form-item>
        <el-form-item label="费用信息">
          <span>
            (实际费用){{ orderDetail.cost }} 元 =
            (单价){{ orderDetail.price }} USDT *
            (数量){{ orderDetail.size }} 个
          </span>
        </el-form-item>
        <el-form-item label="支付信息">
          <span>（支付渠道）快捷交易</span>
          <span>（支付时间）{{ orderDetail.updateTime }}</span>
        </el-form-item>

      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { orderEtm, orderEtmDetail } from '@/api/currency';
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

export default {
  name: 'Order',
  components: { Pagination },
  filters: {
    orderStatusFilter(status) {
      return statusMap[status];
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        id: undefined,
        name: undefined,
        orderStatusArray: ['302', '103'],
        sort: 'add_time',
        order: 'desc'
      },
      statusMap,
      orderDialogVisible: false,
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
    }
  }
};
</script>
