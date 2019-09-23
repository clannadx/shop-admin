import request from '@/utils/request';

export const createAccount = (data) => {
  return request({
    url: '/payee/create',
    method: 'post',
    data
  });
};
export const payAccountList = (params) => {
  return request({
    url: 'payee/list',
    method: 'get',
    params
  });
};
export const updatePayAccount = (data) => {
  return request({
    url: 'payee/list',
    method: 'post',
    data
  });
};
export const deletePayAccount = (data) => {
  return request({
    url: 'payee/delete',
    method: 'post',
    data
  });
};

// 订单
export const orderEtm = (params) => {
  return request({
    url: 'orderetm/list',
    method: 'get',
    params
  });
};

export const orderEtmDetail = (params) => {
  return request({
    url: 'orderetm/detail',
    method: 'get',
    params
  });
};
