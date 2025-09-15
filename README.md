# Docker Image Build

```shell
# platform: linux/amd64
docker build --platform linux/amd64 -t demo:latest .
# platform: linux/arm64
docker build --platform linux/arm64 -t demo:arm .
```

# Docker Hub

```shell
docker tag demo:latest rlawnsdud/demo:latest
docker push rlawnsdud/demo:latest
docker tag demo:arm rlawnsdud/demo:arm
docker push rlawnsdud/demo:arm
```

# Endpoints

- `GET /`
- `GET /health`
- `GET /info`
- `GET /metrics`
- `GET /cpu_load?load=<number_of_cores, default=1>&duration=<seconds, default=5>`
- `GET /mem_load?size=<size_in_mb, default=100>`
- `GET /crash`
- `GET /env?select=<KEY1,KEY2,...>`
- `GET /headers`
- `GET /ip`
- `GET /delay?duration=<seconds, default=5>`
- `POST /shell` (body: `{ "cmd": "<shell_command>" }`)
- `GET /terminal`

# Environment Variables

- `HOST`: Host address to bind to (default: '127.0.0.1')
- `PORT`: Port number to listen on (default: 3000)
- `GLOBAL_PREFIX`: Global prefix for all routes (default: '')
- `APP_NAME`: Application name

