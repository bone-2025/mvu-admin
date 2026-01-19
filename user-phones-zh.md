# 用户手机号管理 API 文档（中文版）

## 概述

用户手机号管理 API 提供了对用户手机号的完整 CRUD 操作，包括查询、添加和删除功能。

**基础路径**: `/api/admin/v1/user-phones`  
**认证要求**: 需要管理员权限（Bearer Token，scope: `urn:mas:admin`）

---

## API 端点总览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/v1/user-phones` | 获取手机号列表（支持分页和过滤） |
| GET | `/api/admin/v1/user-phones/{id}` | 获取单个手机号详情 |
| POST | `/api/admin/v1/user-phones` | 添加手机号 |
| DELETE | `/api/admin/v1/user-phones/{id}` | 删除手机号 |

---

## 1. 获取手机号列表

### 请求

```http
GET /api/admin/v1/user-phones?filter[user]={userId}&page[first]=10&count=false
```

### 查询参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `filter[user]` | ULID | 过滤指定用户的手机号 | `filter[user]=01ABC...` |
| `filter[phone]` | string | 过滤指定手机号 | `filter[phone]=13800138000` |
| `page[first]` | integer | 获取前 N 条记录 | `page[first]=10` |
| `page[after]` | ULID | 从指定 ID 之后开始 | `page[after]=01ABC...` |
| `count` | string | 是否返回总数 | `count=true` / `count=only` |

### 响应示例

```json
{
  "meta": {
    "count": 1
  },
  "data": [
    {
      "type": "user-phone",
      "id": "01040G2081040G2081040G2081",
      "attributes": {
        "created_at": "2024-01-01T00:00:00Z",
        "user_id": "02081040G2081040G2081040G2",
        "phone": "13800138000"
      },
      "links": {
        "self": "/api/admin/v1/user-phones/01040G2081040G2081040G2081"
      }
    }
  ],
  "links": {
    "self": "/api/admin/v1/user-phones?filter[user]=02081040G2081040G2081040G2&page[first]=10"
  }
}
```

### cURL 示例

```bash
# 获取用户的所有手机号
curl -X GET "https://example.com/api/admin/v1/user-phones?filter[user]=02081040G2081040G2081040G2" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 2. 获取单个手机号详情

### 请求

```http
GET /api/admin/v1/user-phones/{id}
```

### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | ULID | 手机号记录的 ID |

### 响应示例

```json
{
  "data": {
    "type": "user-phone",
    "id": "01040G2081040G2081040G2081",
    "attributes": {
      "created_at": "2024-01-01T00:00:00Z",
      "user_id": "02081040G2081040G2081040G2",
      "phone": "13800138000"
    },
    "links": {
      "self": "/api/admin/v1/user-phones/01040G2081040G2081040G2081"
    }
  }
}
```

### cURL 示例

```bash
curl -X GET "https://example.com/api/admin/v1/user-phones/01040G2081040G2081040G2081" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 3. 添加手机号

### 请求

```http
POST /api/admin/v1/user-phones
Content-Type: application/json
```

### 请求体

```json
{
  "user_id": "02081040G2081040G2081040G2",
  "phone": "13800138000"
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `user_id` | ULID | ✅ | 用户的 ID |
| `phone` | string | ✅ | 手机号码（11 位数字，以 1 开头） |

### 手机号格式要求

- ✅ 必须是 11 位数字
- ✅ 必须以 1 开头
- ✅ 仅支持中国大陆手机号格式
- ❌ 示例：`13800138000` ✅ | `1234567890` ❌ | `1380013800` ❌

### 响应示例（201 Created）

```json
{
  "data": {
    "type": "user-phone",
    "id": "01040G2081040G2081040G2081",
    "attributes": {
      "created_at": "2024-01-01T00:00:00Z",
      "user_id": "02081040G2081040G2081040G2",
      "phone": "13800138000"
    },
    "links": {
      "self": "/api/admin/v1/user-phones/01040G2081040G2081040G2081"
    }
  }
}
```

### 错误响应

**400 Bad Request** - 手机号格式无效
```json
{
  "errors": [
    {
      "title": "Phone \"invalid-phone\" is not valid"
    }
  ]
}
```

**404 Not Found** - 用户不存在
```json
{
  "errors": [
    {
      "title": "User ID 00000000000000000000000000 not found"
    }
  ]
}
```

**409 Conflict** - 手机号已被使用
```json
{
  "errors": [
    {
      "title": "User phone \"13800138000\" already in use"
    }
  ]
}
```

### cURL 示例

```bash
curl -X POST "https://example.com/api/admin/v1/user-phones" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "02081040G2081040G2081040G2",
    "phone": "13800138000"
  }'
```

---

## 4. 删除手机号

### 请求

```http
DELETE /api/admin/v1/user-phones/{id}
```

### 路径参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `id` | ULID | 手机号记录的 ID |

### 响应示例（204 No Content）

无响应体

### 错误响应

**404 Not Found** - 手机号不存在
```json
{
  "errors": [
    {
      "title": "User phone ID 00000000000000000000000000 not found"
    }
  ]
}
```

### cURL 示例

```bash
curl -X DELETE "https://example.com/api/admin/v1/user-phones/01040G2081040G2081040G2081" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 常见使用场景

### 场景 1: 查看用户的所有手机号

```bash
USER_ID="02081040G2081040G2081040G2"
curl -X GET "https://example.com/api/admin/v1/user-phones?filter[user]=${USER_ID}" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 场景 2: 检查手机号是否已被使用

```bash
PHONE="13800138000"
curl -X GET "https://example.com/api/admin/v1/user-phones?filter[phone]=${PHONE}" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

如果返回空数组 `[]`，说明手机号未被使用；如果返回数据，说明已被使用。

### 场景 3: 为用户添加手机号

```bash
curl -X POST "https://example.com/api/admin/v1/user-phones" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "02081040G2081040G2081040G2",
    "phone": "13800138000"
  }'
```

### 场景 4: 删除用户的手机号

```bash
# 1. 先查询获取手机号 ID
PHONE_ID="01040G2081040G2081040G2081"

# 2. 删除手机号
curl -X DELETE "https://example.com/api/admin/v1/user-phones/${PHONE_ID}" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 数据模型

### UserPhone 对象

```typescript
interface UserPhone {
  type: "user-phone";
  id: string;              // ULID 格式
  attributes: {
    created_at: string;    // ISO 8601 格式时间
    user_id: string;       // ULID 格式
    phone: string;         // 11 位数字，以 1 开头
  };
  links: {
    self: string;         // 资源自身链接
  };
}
```

---

## HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 资源创建成功 |
| 204 | 资源删除成功（无响应体） |
| 400 | 请求参数错误（手机号格式无效） |
| 404 | 资源不存在 |
| 409 | 资源冲突（手机号已被使用） |
| 500 | 服务器内部错误 |

---

## 注意事项

1. **手机号格式**: 仅支持中国大陆手机号格式（11 位数字，以 1 开头）
2. **唯一性**: 每个手机号只能关联一个用户
3. **权限**: 需要管理员权限才能访问这些 API
4. **策略限制**: 添加手机号时会忽略策略限制，允许管理员直接添加
5. **自动更新**: 添加或删除手机号后，系统会自动调度任务更新用户信息

---

## 故障排除

### TypeError: Failed to fetch

如果遇到 `TypeError: Failed to fetch` 错误，通常是由以下原因引起的：

#### 1. CORS（跨域资源共享）问题

**症状**: 浏览器控制台显示 CORS 相关错误，如：
- `Access to fetch at 'https://auth.mvu.cn/...' from origin '...' has been blocked by CORS policy`
- `No 'Access-Control-Allow-Origin' header is present on the requested resource`

**解决方法**:
- 确保服务器正确配置了 CORS 头信息
- 检查 `Access-Control-Allow-Origin` 头是否包含你的前端域名
- 验证 `Access-Control-Allow-Methods` 是否包含 `GET`、`POST`、`DELETE` 等方法
- 确认 `Access-Control-Allow-Headers` 包含 `Authorization` 和 `Content-Type`

#### 2. 网络连接问题

**症状**: 请求无法到达服务器

**解决方法**:
- 检查网络连接是否正常
- 验证服务器地址 `https://auth.mvu.cn` 是否可访问
- 尝试使用 `curl` 或 Postman 直接测试 API 端点
- 检查防火墙或代理设置是否阻止了请求

#### 3. SSL/TLS 证书问题

**症状**: 浏览器显示证书错误或安全警告

**解决方法**:
- 验证服务器的 SSL 证书是否有效
- 检查证书是否过期
- 确认证书域名与请求的域名匹配

#### 4. 认证问题

**症状**: 请求被拒绝，但网络连接正常

**解决方法**:
- 确认 Bearer Token 是否正确设置
- 验证 Token 是否过期，需要重新登录
- 检查 Token 的 scope 是否包含 `urn:mas:admin`
- 确认请求头中包含正确的 `Authorization: Bearer <token>`

#### 5. 请求格式问题

**症状**: 参数格式不正确导致请求失败

**解决方法**:
- 验证查询参数格式是否正确，例如：
  - `filter[user]` 应该是有效的 ULID
  - `page[first]` 应该是数字
  - `count` 应该是字符串 `"true"` 或 `"false"`
- 检查 URL 编码是否正确
- 确认请求方法（GET/POST/DELETE）是否匹配端点

#### 调试步骤

1. **使用浏览器开发者工具**:
   - 打开 Network 标签页
   - 查看失败的请求详情
   - 检查请求头、响应头和响应体

2. **使用 cURL 测试**:
   ```bash
   curl -X GET "https://auth.mvu.cn/api/admin/v1/user-phones?filter[user]=01KCTVAASRZ9SVHTPKVJCXDQ4F&page[first]=10&count=false" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -v
   ```

3. **检查服务器日志**:
   - 查看服务器端日志，了解请求是否到达服务器
   - 检查是否有错误信息或异常

4. **验证 API 端点**:
   - 确认 API 端点路径正确：`/api/admin/v1/user-phones`
   - 验证服务器是否正在运行
   - 检查 API 版本是否匹配

#### 常见错误代码

| HTTP 状态码 | 说明 | 解决方法 |
|------------|------|---------|
| 400 | 请求参数错误 | 检查查询参数格式和值 |
| 401 | 未授权 | 检查 Bearer Token 是否有效 |
| 403 | 禁止访问 | 确认用户有管理员权限 |
| 404 | 资源不存在 | 验证用户 ID 或手机号 ID 是否正确 |
| 500 | 服务器内部错误 | 联系服务器管理员 |
| CORS 错误 | 跨域请求被阻止 | 配置服务器 CORS 设置 |

---

## 相关文档

- [用户管理 API](./users.md)
- [用户邮箱管理 API](./user-emails.md)
- [完整的 OpenAPI 规范](../api/spec.json)

---

**最后更新**: 2025-01-13
