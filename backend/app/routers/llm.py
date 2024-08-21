import os

from fastapi import APIRouter, HTTPException
from openai import OpenAI
from openai.types.chat import ChatCompletionMessage
from pydantic import BaseModel
from qdrant_client import QdrantClient

router = APIRouter()


class PromptRequest(BaseModel):
    prompt: str


class PromptResponse(BaseModel):
    response: ChatCompletionMessage


@router.post("", response_model=PromptResponse)
async def llm(request: PromptRequest):
    def get_embedding(text, model="text-embedding-ada-002"):
        text = text.replace("\n", " ")
        return client.embeddings.create(input=[text], model=model).data[0].embedding

    client = OpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
    )
    qdrant = QdrantClient(url="http://localhost:6333")

    embedding = get_embedding(request.prompt)

    search_result = qdrant.search(
        collection_name="txt_vector_collection", query_vector=embedding, limit=3
    )

    # Extract context from search results
    # context_list = [point.payload['page_content'] for point in search_result]
    # context = "\n\n".join(context_list)

    # messages = [
    #     {"role": "system", "content": "You are a helpful assistant."},
    #     {"role": "system", "content": f"Context: {context}"},
    #     {"role": "user", "content": request.prompt},
    # ]

    # Extract context from search results
    context_list = [point.payload["page_content"] for point in search_result]
    context = "\n\n".join(
        [f"... doc {i + 1} ...\n{doc}" for i, doc in enumerate(context_list)]
    )

    # Format the message according to the specified structure
    formatted_message = f"""Please answer the question using the provided context.
    <Context>
    {context}
    <Context/>

    Now answer the user question:
    <user question>
    {request.prompt}
    <user question/>"""

    print("formatted message", formatted_message)

    # Include the formatted message in the messages
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": formatted_message},
    ]

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=150,
            temperature=0.7,
        )
        return PromptResponse(response=completion.choices[0].message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
