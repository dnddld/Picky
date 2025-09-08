from sentence_transformers import SentenceTransformer

# 첫 실행 시 자동으로 모델을 다운로드합니다
model = SentenceTransformer('BAAI/bge-m3')

# 테스트 예시
texts = ["안녕하세요", "Hello world", "Python programming"]
embeddings = model.encode(texts)
print(embeddings.shape)
