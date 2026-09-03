FROM python:3.12

WORKDIR /app

COPY req.txt .

RUN pip install --no-cache-dir -r req.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]