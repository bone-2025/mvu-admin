# 快速部署指南

## 方式一：使用部署脚本（最简单）

```bash
# 不指定服务器名称
./deploy.sh

# 指定服务器名称
./deploy.sh your-matrix-server.com
```

## 方式二：使用 Docker Compose

```bash
# 启动服务
docker-compose up -d

# 指定服务器名称
SERVER_NAME=your-matrix-server.com docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 方式三：使用 Docker 命令

```bash
# 构建镜像
docker build -t element-admin:latest .

# 运行容器（不指定服务器名称）
docker run -d \
  --name element-admin \
  -p 8080:8080 \
  --restart unless-stopped \
  element-admin:latest

# 运行容器（指定服务器名称）
docker run -d \
  --name element-admin \
  -p 8080:8080 \
  -e SERVER_NAME=your-matrix-server.com \
  --restart unless-stopped \
  element-admin:latest
```

## 访问应用

部署成功后，访问：http://localhost:8080

## 常用命令

```bash
# 查看日志
docker logs -f element-admin

# 停止容器
docker stop element-admin

# 启动容器
docker start element-admin

# 删除容器
docker rm element-admin

# 查看容器状态
docker ps -a | grep element-admin
```

## 详细文档

更多详细信息请查看 [DEPLOY.md](./DEPLOY.md)




