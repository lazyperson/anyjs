export const fetchResource = url => {
  return fetch(url, {
    // 允许跨域请求
    mode: 'cors',
    credentials: 'include'
  }).then(async res => {
    if (!res.ok) {
      throw new Error(`anyjs: 加载资源失败 ${url}, 状态码: ${res.status}`);
    }
    return await res.text();
  });
}
