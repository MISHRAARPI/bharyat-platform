import os
import hashlib
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# In-memory vector store (Day 5 we'll move to Supabase pgvector)
doc_chunks = []

def chunk_text(text: str, chunk_size: int = 500) -> list:
    words = text.split()
    chunks = []
    current_chunk = []
    current_size = 0
    for word in words:
        current_chunk.append(word)
        current_size += 1
        if current_size >= chunk_size:
            chunks.append(' '.join(current_chunk))
            current_chunk = []
            current_size = 0
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    return chunks

def embed_text(text: str) -> list:
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

def cosine_similarity(vec1: list, vec2: list) -> float:
    dot = sum(a * b for a, b in zip(vec1, vec2))
    mag1 = sum(a * a for a in vec1) ** 0.5
    mag2 = sum(b * b for b in vec2) ** 0.5
    if mag1 == 0 or mag2 == 0:
        return 0
    return dot / (mag1 * mag2)

def ingest_document(text: str, source: str, doc_type: str = "bom") -> dict:
    chunks = chunk_text(text)
    ingested = []
    for i, chunk in enumerate(chunks):
        embedding = embed_text(chunk)
        chunk_id = hashlib.md5(f"{source}_{i}".encode()).hexdigest()
        chunk_data = {
            "id": chunk_id,
            "text": chunk,
            "embedding": embedding,
            "source": source,
            "doc_type": doc_type,
            "chunk_index": i
        }
        doc_chunks.append(chunk_data)
        ingested.append(chunk_id)
    return {
        "source": source,
        "chunks_created": len(chunks),
        "chunk_ids": ingested
    }

def search_similar(query: str, top_k: int = 5) -> list:
    if not doc_chunks:
        return []
    query_embedding = embed_text(query)
    scored = []
    for chunk in doc_chunks:
        score = cosine_similarity(query_embedding, chunk["embedding"])
        scored.append({
            "id": chunk["id"],
            "text": chunk["text"],
            "source": chunk["source"],
            "doc_type": chunk["doc_type"],
            "score": score
        })
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]

async def rag_query(question: str) -> dict:
    from lib.llm import call_llm

    relevant_chunks = search_similar(question, top_k=5)

    if not relevant_chunks:
        return {
            "answer": "No relevant data found. Please upload a BOM first.",
            "sources": [],
            "confidence": 0
        }

    context = "\n\n".join([
        f"[Source: {c['source']}]\n{c['text']}"
        for c in relevant_chunks
    ])

    system_prompt = """You are a BOM intelligence assistant for Bharyat AI Platform.
Answer questions about components based ONLY on the provided context.
Always end with CONFIDENCE: [0-100]"""

    user_prompt = f"""Context from BOM data:
{context}

Question: {question}

Answer based only on the context above."""

    answer = await call_llm(system_prompt, user_prompt)

    return {
        "answer": answer,
        "sources": [{"id": c["id"], "source": c["source"], "score": round(c["score"], 3)} for c in relevant_chunks],
        "chunks_used": len(relevant_chunks)
    }