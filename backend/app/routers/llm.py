from openai import OpenAI
from fastapi import APIRouter, Depends, HTTPException
from openai.types.chat import ChatCompletionMessage
from pydantic import BaseModel
import os

router = APIRouter()


class PromptRequest(BaseModel):
    prompt: str


class PromptResponse(BaseModel):
    response: ChatCompletionMessage


@router.post("", response_model=PromptResponse)
async def llm(request: PromptRequest):
    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
    )
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": request.prompt}],
            max_tokens=150,
            temperature=0.7
        )
        return PromptResponse(response=completion.choices[0].message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
