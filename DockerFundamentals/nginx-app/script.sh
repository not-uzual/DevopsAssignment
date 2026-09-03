docker build -t nginx-hello .
docker images

docker run -d --name nginx-container -p 8083:80 nginx-hello
docker ps

curl http://localhost:8083
