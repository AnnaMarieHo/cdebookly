FROM python:3.11

WORKDIR /code

RUN pip install uv

COPY src/pyproject.toml .
RUN uv pip install -r pyproject.toml --system

COPY src/ .

EXPOSE 7860

CMD ["uv", "run", "uvicorn", "app.app:app", "--host", "0.0.0.0", "--port", "7860"]