docker build -t python-hello .
docker images

docker run -d --name python-container -p 5000:5000 python-hello
docker ps

curl http://localhost:5000