# Docker Image Build

```shell
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t rlawnsdud/demo:latest \
  --push .
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

