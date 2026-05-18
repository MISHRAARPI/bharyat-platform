from dotenv import load_dotenv
load_dotenv()
import os
import httpx
import asyncio

async def test():
    key = os.getenv("GROQ_API_KEY")
    print(f"Key: {key[:10]}...")
    
    async with httpx.AsyncClient() as client:
        r = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {key}"},
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": "say hi"}]
            }
        )
        print(r.json())

asyncio.run(test())