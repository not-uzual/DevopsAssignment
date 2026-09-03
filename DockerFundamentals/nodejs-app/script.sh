docker build -t nodejs-hello .
docker images

docker run -d --name nodejs-container -p 3000:3000 nodejs-hello
docker ps

curl http://localhost:3000