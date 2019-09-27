import request from '@/utils/request';
import Qs from 'qs';

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
    url: 'payee/update',
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
    params,
    paramsSerializer: function(params) {
      return Qs.stringify(params, { arrayFormat: 'repeat' });
    }
  });
};

export const orderEtmDetail = (params) => {
  return request({
    url: 'orderetm/detail',
    method: 'get',
    params
  });
};
export const passReview = (data) => {
  return request({
    url: 'orderetm/verify',
    method: 'post',
    data
  });
};
export const rejectReview = (data) => {
  return request({
    url: 'orderetm/reject',
    method: 'post',
    data
  });
};
