from dotenv import load_dotenv
load_dotenv()

import os
import uuid
import httpx
from datetime import datetime
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from lib.llm import call_llm
import pandas as pd
from io import BytesIO
from lib.bom_parser import parse_bom
from lib.rag import ingest_document, search_similar, rag_query


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

projects_db = {}

class Project(BaseModel):
    name: str
    customer: Optional[str] = None
    product: Optional[str] = None
    industry: Optional[str] = None
    region: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    customer: Optional[str] = None
    product: Optional[str] = None
    industry: Optional[str] = None
    region: Optional[str] = None

@app.get("/health")
def health():
    return {"status": "ok", "project": "Bharyat AI Platform"}

@app.post("/projects")
def create_project(project: Project):
    project_id = str(uuid.uuid4())
    new_project = {
        "id": project_id,
        "name": project.name,
        "customer": project.customer,
        "product": project.product,
        "industry": project.industry,
        "region": project.region,
        "created_at": datetime.now().isoformat()
    }
    projects_db[project_id] = new_project
    return new_project

@app.get("/projects")
def get_projects():
    return list(projects_db.values())

@app.get("/projects/{project_id}")
def get_project(project_id: str):
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    return projects_db[project_id]

@app.patch("/projects/{project_id}")
def update_project(project_id: str, update: ProjectUpdate):
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    project = projects_db[project_id]
    if update.name: project["name"] = update.name
    if update.customer: project["customer"] = update.customer
    if update.product: project["product"] = update.product
    if update.industry: project["industry"] = update.industry
    if update.region: project["region"] = update.region
    return project

@app.delete("/projects/{project_id}")
def delete_project(project_id: str):
    if project_id not in projects_db:
        raise HTTPException(status_code=404, detail="Project not found")
    del projects_db[project_id]
    return {"message": "Project deleted successfully"}

@app.get("/test-llm")
async def test_llm():
    response = await call_llm(
        system_prompt="You are a component intelligence assistant.",
        user_prompt="What is a BOM? Answer in 2 sentences."
    )
    return {"response": response}

@app.post("/bom/upload")
async def upload_bom(file: UploadFile = File(...)):
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="Only .xlsx, .xls, .csv files allowed")
    contents = await file.read()
    result = parse_bom(contents, file.filename)
    return {
        "message": "BOM uploaded successfully",
        "filename": file.filename,
        **result
    }



@app.post("/rag/ingest")
async def ingest_bom_text(data: dict):
    """Ingest text into RAG pipeline"""
    text = data.get("text", "")
    source = data.get("source", "manual")
    doc_type = data.get("doc_type", "bom")
    
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    result = ingest_document(text, source, doc_type)
    return result

@app.post("/rag/query")
async def query_rag(data: dict):
    question = data.get("question", "")
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")
    result = await rag_query(question)
    return result

@app.get("/rag/stats")
async def rag_stats():
    """Get RAG pipeline stats"""
    from lib.rag import doc_chunks
    return {
        "total_chunks": len(doc_chunks),
        "sources": list(set([c["source"] for c in doc_chunks]))
    }