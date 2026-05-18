import os
import httpx

async def call_llm(system_prompt: str, user_prompt: str) -> str:
    """
    Reusable LLM wrapper for all AI features in Bharyat platform.
    Uses Groq (free tier) with llama3-70b model.
    """
    
    # Load AI boundary rules
    rules = ""
    try:
        with open("rules.md", "r") as f:
            rules = f.read()
    except:
        pass

    # Prepend rules to system prompt
    full_system = f"{rules}\n\n{system_prompt}"

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": full_system},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.3
            },
            timeout=30.0
        )
        return response.json()["choices"][0]["message"]["content"]