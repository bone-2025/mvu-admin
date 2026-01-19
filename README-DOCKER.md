# Docker 部署说明

本项目已配置好 Docker 部署，可以直接在服务端使用。

## 文件说明

- `Dockerfile` - Docker 镜像构建文件
- `docker-compose.yml` - Docker Compose 配置文件
- `deploy.sh` - 快速部署脚本
- `DEPLOY.md` - 详细部署文档
- `QUICKSTART.md` - 快速开始指南

## 快速开始

### 1. 使用部署脚本（推荐）

\`\`\`bash
./deploy.sh your-matrix-server.com
\`\`\`

### 2. 使用 Docker Compose

\`\`\`bash
docker-compose up -d
\`\`\`

### 3. 使用 Docker 命令

\`\`\`bash
docker build -t element-admin:latest .
docker run -d --name element-admin -p 8080:8080 -e SERVER_NAME=your-matrix-server.com element-admin:latest
\`\`\`

## 访问应用

部署成功后访问：http://localhost:8080

## 更多信息

- 详细部署指南：查看 [DEPLOY.md](./DEPLOY.md)
- 快速开始：查看 [QUICKSTART.md](./QUICKSTART.md)
