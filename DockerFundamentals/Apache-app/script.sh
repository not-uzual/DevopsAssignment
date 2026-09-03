docker build -t apache-hello .
docker images

docker run -d --name apache-container -p 8081:80 apache-hello
docker ps

curl http://localhost:8081
