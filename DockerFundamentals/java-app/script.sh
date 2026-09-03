docker build -t java-hello .
docker images

docker run -d --name java-container -p 8080:8080 java-hello
docker ps

curl http://localhost:8080